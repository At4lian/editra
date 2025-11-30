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

type ClickUpTask = {
  id: string;
  name: string;
  url?: string;
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
    const taskId: string | undefined = taskObj?.id;
    const listId: string | undefined = taskObj?.lists?.[0]?.list_id;

    console.log('Zjištěný taskId:', taskId);
    console.log('Zjištěný listId:', listId);

    if (!taskId) {
      console.warn('Nemám taskId ani v reálném eventu, zkontroluj payload výše.');
      return NextResponse.json({ ok: false, error: 'No task id' }, { status: 400 });
    }

    // 3) Dotáhneme detail tasku z ClickUp API
    const clickupToken = getEnvOrThrow('CLICKUP_API_TOKEN');

    const taskResp = await fetch(`https://api.clickup.com/api/v2/task/${taskId}`, {
      headers: {
        Authorization: clickupToken, // musí být přímo pk_..., žádné "Bearer"
      },
    });

    const taskText = await taskResp.text();
    console.log('Výsledek volání ClickUp API: status', taskResp.status);
    console.log('Tělo odpovědi z ClickUp API:', taskText);

    if (!taskResp.ok) {
      console.warn('ClickUp API vrátilo chybu', taskResp.status);
      return NextResponse.json(
        { ok: false, error: 'ClickUp API error', status: taskResp.status },
        { status: 502 },
      );
    }

    const taskData = JSON.parse(taskText) as ClickUpTask;
    const customFields = taskData.custom_fields ?? [];

    // 4) Vytáhneme potřebná pole
    const clientField = findCustomField(customFields, 'Client');
    const hourlyRateField = findCustomField(customFields, 'Hourly Rate');
    const totalPriceField = findCustomField(customFields, 'Total Price');
    const invoiceNumberField = findCustomField(customFields, 'Invoice Number');

    const clientName = getClientName(clientField) ?? 'Unknown client';

    const hourlyRate = hourlyRateField?.value
      ? Number(hourlyRateField.value)
      : undefined;

    const totalPrice = totalPriceField?.value
      ? Number(totalPriceField.value)
      : undefined;

    // Invoice number – buď z pole, nebo generované (very simple)
    const now = new Date();
    const fallbackInvoiceNumber = `INV-${now.getFullYear()}${String(
      now.getMonth() + 1,
    ).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${taskId}`;
    const invoiceNumber =
      (invoiceNumberField as any)?.value && (invoiceNumberField as any).value !== ''
        ? (invoiceNumberField as any).value
        : fallbackInvoiceNumber;

    const taskName = taskData.name;
    const taskUrl = (taskData as any).url ?? '';

    console.log('Invoice data připravená z ClickUpu:', {
      taskId,
      taskName,
      clientName,
      hourlyRate,
      totalPrice,
      invoiceNumber,
      taskUrl,
    });

    // 5) Složíme jednoduchou HTML "fakturu"
    const priceString =
      totalPrice !== undefined && !Number.isNaN(totalPrice)
        ? `${totalPrice.toFixed(2)} CZK`
        : 'N/A';

    const hourlyString =
      hourlyRate !== undefined && !Number.isNaN(hourlyRate)
        ? `${hourlyRate.toFixed(2)} CZK / h`
        : 'N/A';

    const html = `
      <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="margin-bottom: 8px;">Invoice ${invoiceNumber}</h1>
        <p style="margin: 4px 0 16px 0; color: #555;">Generated automatically from ClickUp task</p>

        <h2 style="margin-bottom: 4px;">Billed to</h2>
        <p style="margin: 4px 0 16px 0;"><strong>${clientName}</strong></p>

        <h2 style="margin-bottom: 4px;">Task</h2>
        <p style="margin: 4px 0;"><strong>${taskName}</strong></p>
        ${
          taskUrl
            ? `<p style="margin: 4px 0 16px 0;"><a href="${taskUrl}">${taskUrl}</a></p>`
            : ''
        }

        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <thead>
            <tr>
              <th style="border-bottom: 1px solid #ddd; text-align: left; padding: 8px;">Description</th>
              <th style="border-bottom: 1px solid #ddd; text-align: right; padding: 8px;">Hourly rate</th>
              <th style="border-bottom: 1px solid #ddd; text-align: right; padding: 8px;">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border-bottom: 1px solid #eee; padding: 8px;">${taskName}</td>
              <td style="border-bottom: 1px solid #eee; padding: 8px; text-align: right;">${hourlyString}</td>
              <td style="border-bottom: 1px solid #eee; padding: 8px; text-align: right;">${priceString}</td>
            </tr>
          </tbody>
        </table>

        <p style="font-size: 16px; margin-top: 16px;">
          <strong>Total to pay: ${priceString}</strong>
        </p>

        <p style="margin-top: 32px; font-size: 12px; color: #999;">
          This invoice was generated automatically from task <code>${taskId}</code> in ClickUp.
        </p>
      </div>
    `;

    // 6) Pošleme email přes Resend
    const from = getEnvOrThrow('INVOICE_FROM_EMAIL');
    const to = getEnvOrThrow('INVOICE_TO_EMAIL');

    const { data, error } = await resend.emails.send({
      from,
      to,
      subject: `Invoice ${invoiceNumber} – ${clientName}`,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { ok: false, error: 'Resend error', details: String(error) },
        { status: 500 },
      );
    }

    console.log('Resend success:', data);

    return NextResponse.json({
      ok: true,
      taskId,
      invoiceNumber,
      clientName,
    });
  } catch (err: any) {
    console.error('Chyba v invoice-hook route:', err);
    return NextResponse.json(
      { ok: false, error: 'Internal error', details: String(err?.message ?? err) },
      { status: 500 },
    );
  }
}
