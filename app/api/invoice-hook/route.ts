/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/invoice-hook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

type ClickUpCustomField = {
  id: string;
  name: string;
  type: string;
  value: any;
  type_config?: {
    options?: { id: string; name: string; color?: string; orderindex?: number }[];
    [key: string]: any;
  };
};

type ClickUpStatus = {
  status: string;
};

type ClickUpTask = {
  id: string;
  name: string;
  url?: string;
  status?: ClickUpStatus;
  custom_fields?: ClickUpCustomField[];
};

function getEnvOrThrow(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env variable: ${name}`);
  }
  return value;
}

function findCustomField(fields: ClickUpCustomField[] | undefined, fieldName: string) {
  if (!fields) return undefined;
  return fields.find((f) => f.name === fieldName);
}

// Client může být uložený buď jako index (0,1,2...), nebo jako id option.
// Tohle z toho vytáhne lidské jméno.
function getClientName(field: ClickUpCustomField | undefined): string | undefined {
  if (!field) return undefined;
  const options = field.type_config?.options ?? [];
  const value = field.value;

  if (typeof value === 'number') {
    return options[value]?.name;
  }
  if (typeof value === 'string') {
    const found = options.find((o) => o.id === value);
    return found?.name;
  }
  return undefined;
}

// Checkbox value může být true/false nebo "true"/"false"
function isCheckboxTrue(field: ClickUpCustomField | undefined): boolean {
  if (!field) return false;
  return field.value === true || field.value === 'true';
}

async function updateCustomField(
  taskId: string,
  fieldId: string,
  value: any,
  token: string,
) {
  const resp = await fetch(
    `https://api.clickup.com/api/v2/task/${taskId}/field/${fieldId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify({ value }),
    },
  );

  if (!resp.ok) {
    const txt = await resp.text();
    console.warn('Update custom field failed', {
      taskId,
      fieldId,
      status: resp.status,
      body: txt,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const expectedSecret = getEnvOrThrow('INVOICE_WEBHOOK_SECRET');

    const secretHeader = req.headers.get('x-webhook-secret');
    if (!secretHeader || secretHeader !== expectedSecret) {
      console.warn('Neplatný webhook secret:', { received: secretHeader });
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    let body: any = null;
    try {
      body = await req.json();
    } catch (err) {
      console.warn('Body není validní JSON, přeskočím:', err);
    }

    console.log('Webhook payload:', JSON.stringify(body, null, 2));

    // 1) Testovací ping z ClickUpu (Test button)
    if (body?.body === 'Test message from ClickUp Webhooks Service') {
      console.log('Dostal jsem jen testovací zprávu z ClickUpu – spojení OK.');
      return NextResponse.json({ ok: true, mode: 'test' });
    }

    // 2) Reálný event – vlastní data jsou v body.payload
    const taskObj = body?.payload;
    const triggerTaskId: string | undefined = taskObj?.id;
    const listId: string | undefined = taskObj?.lists?.[0]?.list_id;

    console.log('Trigger taskId:', triggerTaskId);
    console.log('ListId:', listId);

    if (!listId) {
      console.warn('Nemám listId v payloadu.');
      return NextResponse.json({ ok: false, error: 'No list id' }, { status: 400 });
    }

    const clickupToken = getEnvOrThrow('CLICKUP_API_TOKEN');

    // 3) Načteme VŠECHNY tasky v daném listu
    const listResp = await fetch(
      `https://api.clickup.com/api/v2/list/${listId}/task?archived=false`,
      {
        headers: {
          Authorization: clickupToken,
        },
      },
    );

    const listText = await listResp.text();
    console.log('List tasks status:', listResp.status);

    if (!listResp.ok) {
      console.warn('ClickUp list API error', listResp.status, listText);
      return NextResponse.json(
        { ok: false, error: 'ClickUp list API error', status: listResp.status },
        { status: 502 },
      );
    }

    const listJson = JSON.parse(listText) as { tasks: ClickUpTask[] };
    const tasks = listJson.tasks ?? [];

    console.log('Počet tasků v listu:', tasks.length);

    // 4) Najdeme kandidáty: status = "invoiced" a custom field "Invoiced" = false
    const candidateTasks: ClickUpTask[] = tasks.filter((t) => {
      const statusName = (t as any).status?.status;
      const customFields = t.custom_fields ?? [];

      const invoicedField = findCustomField(customFields, 'Invoiced');
      const alreadyInvoiced = isCheckboxTrue(invoicedField);

      return statusName === 'invoiced' && !alreadyInvoiced;
    });

    console.log('Kandidáti pro fakturaci:', candidateTasks.map((t) => t.id));

    if (candidateTasks.length === 0) {
      console.log('Žádné tasky k fakturaci (status invoiced & Invoiced=false).');
      return NextResponse.json({ ok: false, error: 'No tasks to invoice' }, { status: 200 });
    }

    // 5) Zkontrolujeme klienty – musí být jen jeden
    const clientKeys = new Set<string>();
    const clientNames = new Map<string, string>();

    for (const t of candidateTasks) {
      const fields = t.custom_fields ?? [];
      const clientField = findCustomField(fields, 'Client');
      if (!clientField) continue;

      const name = getClientName(clientField) ?? 'Unknown client';
      const raw = clientField.value ?? name;
      const key = String(raw);

      clientKeys.add(key);
      if (!clientNames.has(key)) {
        clientNames.set(key, name);
      }
    }

    if (clientKeys.size === 0) {
      console.warn('Kandidáti pro fakturaci nemají vyplněného klienta.');
      return NextResponse.json(
        { ok: false, error: 'No client on tasks to invoice' },
        { status: 400 },
      );
    }

    const from = getEnvOrThrow('INVOICE_FROM_EMAIL');
    const to = getEnvOrThrow('INVOICE_TO_EMAIL');

    if (clientKeys.size > 1) {
      const names = Array.from(clientNames.values());
      console.warn('Více klientů ve výběru pro fakturu:', names);

      // Upozornění mailem místo faktury
      try {
        await resend.emails.send({
          from,
          to,
          subject: 'ClickUp invoicing – víc klientů v jednom výběru',
          html: `
            <p>Pokoušíš se vytvořit fakturu z tasků, které patří k více klientům.</p>
            <p>Klienti v aktuálním výběru:</p>
            <ul>
              ${names.map((n) => `<li>${n}</li>`).join('')}
            </ul>
            <p>Oprav výběr v ClickUpu – pro jednu fakturu musí být všechny tasky pro stejného klienta.</p>
          `,
        });
      } catch (err) {
        console.error('Resend error při upozornění na více klientů:', err);
      }

      return NextResponse.json(
        { ok: false, error: 'Multiple clients selected', clients: names },
        { status: 400 },
      );
    }

    // Máme přesně jednoho klienta
    const clientKey = Array.from(clientKeys)[0];
    const clientName = clientNames.get(clientKey) ?? 'Unknown client';

    // 6) Připravíme položky – víc tasků na jednu fakturu
    type InvoiceItem = {
      taskId: string;
      name: string;
      hourlyRate: number | null;
      totalPrice: number | null;
      url?: string;
    };

    const items: InvoiceItem[] = [];

    for (const t of candidateTasks) {
      const fields = t.custom_fields ?? [];
      const hourlyField = findCustomField(fields, 'Hourly Rate');
      const totalField = findCustomField(fields, 'Total Price');

      const hr =
        hourlyField && hourlyField.value != null
          ? Number(hourlyField.value)
          : null;

      const total =
        totalField && totalField.value != null
          ? Number(totalField.value)
          : null;

      items.push({
        taskId: t.id,
        name: t.name,
        hourlyRate: hr,
        totalPrice: total,
        url: (t as any).url,
      });
    }

    const totalSum = items.reduce(
      (sum, i) =>
        sum +
        (i.totalPrice != null && !Number.isNaN(i.totalPrice) ? i.totalPrice : 0),
      0,
    );

    console.log('Invoice items:', items.map((i) => ({
      taskId: i.taskId,
      name: i.name,
      hourlyRate: i.hourlyRate,
      totalPrice: i.totalPrice,
    })));

    // 7) Číslo faktury – jednoduchý fallback podle data a klienta
    const now = new Date();
    const fallbackInvoiceNumber = `INV-${now.getFullYear()}${String(
      now.getMonth() + 1,
    ).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${clientKey}`;

    // Pokud někdy budeš chtít: můžeš brát Invoice Number z některého hlavního tasku.
    const invoiceNumber = fallbackInvoiceNumber;

    // 8) HTML faktury – víc řádků
    const rowsHtml = items
      .map(
        (i) => `
        <tr>
          <td style="border-bottom: 1px solid #eee; padding: 8px;">
            ${i.name}
            ${
              i.url
                ? `<br/><a href="${i.url}" style="font-size: 12px; color: #555;">${i.url}</a>`
                : ''
            }
          </td>
          <td style="border-bottom: 1px solid #eee; padding: 8px; text-align: right;">
            ${
              i.hourlyRate != null && !Number.isNaN(i.hourlyRate)
                ? i.hourlyRate.toFixed(2) + ' CZK / h'
                : 'N/A'
            }
          </td>
          <td style="border-bottom: 1px solid #eee; padding: 8px; text-align: right;">
            ${
              i.totalPrice != null && !Number.isNaN(i.totalPrice)
                ? i.totalPrice.toFixed(2) + ' CZK'
                : 'N/A'
            }
          </td>
        </tr>
      `,
      )
      .join('');

    const totalString = `${totalSum.toFixed(2)} CZK`;

    const html = `
      <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 700px; margin: 0 auto;">
        <h1 style="margin-bottom: 8px;">Invoice ${invoiceNumber}</h1>
        <p style="margin: 4px 0 16px 0; color: #555;">Generated automatically from ClickUp tasks</p>

        <h2 style="margin-bottom: 4px;">Billed to</h2>
        <p style="margin: 4px 0 16px 0;"><strong>${clientName}</strong></p>

        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <thead>
            <tr>
              <th style="border-bottom: 1px solid #ddd; text-align: left; padding: 8px;">Description</th>
              <th style="border-bottom: 1px solid #ddd; text-align: right; padding: 8px;">Hourly rate</th>
              <th style="border-bottom: 1px solid #ddd; text-align: right; padding: 8px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <p style="font-size: 16px; margin-top: 16px;">
          <strong>Total to pay: ${totalString}</strong>
        </p>

        <p style="margin-top: 32px; font-size: 12px; color: #999;">
          This invoice was generated automatically from tasks in ClickUp list <code>${listId}</code>.
        </p>
      </div>
    `;

    // 9) Pošleme fakturu mailem
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject: `Invoice ${invoiceNumber} – ${clientName}`,
      html,
    });

    if (error) {
      console.error('Resend error (invoice send):', error);
      return NextResponse.json(
        { ok: false, error: 'Resend error', details: String(error) },
        { status: 500 },
      );
    }

    console.log('Resend success (invoice):', data);

    // 10) Označíme tasky jako fakturované: Invoiced = true, Invoice Number = invoiceNumber
    const firstFields = candidateTasks[0].custom_fields ?? [];
    const invoicedField = findCustomField(firstFields, 'Invoiced');
    const invoiceNumberField = findCustomField(firstFields, 'Invoice Number');

    const updates: Promise<any>[] = [];

    for (const t of candidateTasks) {
      if (invoicedField) {
        updates.push(
          updateCustomField(t.id, invoicedField.id, true, clickupToken),
        );
      }
      if (invoiceNumberField) {
        updates.push(
          updateCustomField(t.id, invoiceNumberField.id, invoiceNumber, clickupToken),
        );
      }
    }

    if (updates.length > 0) {
      await Promise.all(updates);
      console.log(
        'Custom fields aktualizovány pro fakturované tasky:',
        candidateTasks.map((t) => t.id),
      );
    }

    return NextResponse.json({
      ok: true,
      invoiceNumber,
      clientName,
      taskIds: candidateTasks.map((t) => t.id),
      total: totalSum,
    });
  } catch (err: any) {
    console.error('Chyba v invoice-hook route:', err);
    return NextResponse.json(
      { ok: false, error: 'Internal error', details: String(err?.message ?? err) },
      { status: 500 },
    );
  }
}
