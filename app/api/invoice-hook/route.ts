// app/api/invoice-hook/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const expectedSecret = process.env.INVOICE_WEBHOOK_SECRET;

  if (!expectedSecret) {
    console.error('INVOICE_WEBHOOK_SECRET není nastavené v env!');
    return NextResponse.json(
      { ok: false, error: 'Server misconfigured: missing INVOICE_WEBHOOK_SECRET' },
      { status: 500 },
    );
  }

  const secretHeader = req.headers.get('x-webhook-secret');

  if (!secretHeader || secretHeader !== expectedSecret) {
    console.warn('Neplatný webhook secret:', {
      received: secretHeader,
    });

    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // 3) TEST napojení na ClickUp API
  const clickupToken = process.env.CLICKUP_API_TOKEN;

  if (!clickupToken) {
    console.warn('CLICKUP_API_TOKEN není nastavený – přeskočím volání ClickUp API.');
  } else {
    try {
      const resp = await fetch(`https://api.clickup.com/api/v2/task/${taskId}`, {
        headers: {
          // musí být přímo pk_..., žádné "Bearer"
          Authorization: clickupToken,
        },
      });

      const text = await resp.text();

      console.log('Výsledek volání ClickUp API: status', resp.status);
      console.log('Tělo odpovědi z ClickUp API:', text);

      if (!resp.ok) {
        console.warn('ClickUp API vrátilo chybu', resp.status);
      }
    } catch (err) {
      console.error('Chyba při volání ClickUp API:', err);
    }
  }

  // 4) Zatím jen vrátíme taskId, ať vidíš, že to prošlo
  return NextResponse.json({ ok: true, taskId, listId });
}
