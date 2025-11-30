/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/invoice-hook/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // 1) Ověření, že máme v env nastavený secret
  const expectedSecret = process.env.INVOICE_WEBHOOK_SECRET;

  if (!expectedSecret) {
    console.error('INVOICE_WEBHOOK_SECRET není nastavené v env!');
    return NextResponse.json(
      { ok: false, error: 'Server misconfigured: missing INVOICE_WEBHOOK_SECRET' },
      { status: 500 }
    );
  }

  // 2) Ověření hlavičky z ClickUpu
  const secretHeader = req.headers.get('x-webhook-secret');

  if (!secretHeader || secretHeader !== expectedSecret) {
    console.warn('Neplatný webhook secret:', {
      received: secretHeader,
    });

    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  // 3) Přečtení payloadu
  let payload: any;
  try {
    payload = await req.json();
  } catch (err) {
    console.error('Chyba při parsování JSON body:', err);
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  console.log('Webhook payload:', JSON.stringify(payload, null, 2));

  // 4) Zkusíme z payloadu vytáhnout task_id (ClickUp to může posílat různě)
  const taskId: string | undefined =
    payload?.task?.id ??
    payload?.task_id ??
    payload?.event?.task_id ??
    payload?.history_items?.[0]?.task_id;

  console.log('Zjištěný taskId z payloadu:', taskId);

  // 5) Volitelný TEST napojení na ClickUp API – jen log, nic víc
  const clickupToken = process.env.CLICKUP_API_TOKEN;

  if (!clickupToken) {
    console.warn('CLICKUP_API_TOKEN není nastavený. Přeskočím test volání ClickUp API.');
  } else if (taskId) {
    try {
      const resp = await fetch(`https://api.clickup.com/api/v2/task/${taskId}`, {
        headers: {
          Authorization: clickupToken, // musí být přímo pk_..., žádné "Bearer"
        },
      });

      const text = await resp.text();

      console.log('Výsledek volání ClickUp API: status', resp.status);
      console.log('Tělo odpovědi z ClickUp API:', text);

      if (!resp.ok) {
        // Necháme request projít, jen logujeme
        console.warn('ClickUp API vrátilo chybu', resp.status);
      }
    } catch (err) {
      console.error('Chyba při volání ClickUp API:', err);
    }
  } else {
    console.log('Nemám taskId, přeskočím test volání ClickUp API.');
  }

  // 6) Finální odpověď webhooku
  return NextResponse.json({ ok: true });
}
