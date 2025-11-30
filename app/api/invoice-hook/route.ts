// app/api/invoice-hook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-webhook-secret');

  if (!secret || secret !== process.env.INVOICE_WEBHOOK_SECRET) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const payload = await req.json();

  // Zatím jen log a basic odpověď – pro otestování
  console.log('ClickUp webhook payload:', JSON.stringify(payload, null, 2));

  return NextResponse.json({ ok: true });
}
