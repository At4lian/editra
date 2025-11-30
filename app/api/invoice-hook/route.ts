/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/clickup-webhook/route.ts
import { NextRequest, NextResponse } from "next/server";

// ====== CONFIG – DOPLŇ SI VLASTNÍ HODNOTY ======

// ClickUp API
const CLICKUP_API_TOKEN = process.env.CLICKUP_API_TOKEN!;
const CLICKUP_API_BASE = "https://api.clickup.com/api/v2";

// List IDs – doplň si svoje
const PROJECTS_LIST_ID = process.env.CLICKUP_PROJECTS_LIST_ID!; // list s položkami k fakturaci (tam chodí webhook)
const CLIENTS_LIST_ID = process.env.CLICKUP_CLIENTS_LIST_ID!;   // list "Clients"
const INVOICES_LIST_ID = process.env.CLICKUP_INVOICES_LIST_ID!; // list "Invoices"

// Custom field IDs v PROJECTS listu
const CF_TOTAL_PRICE_ID = "4f368785-f1ac-490e-9131-581c56e110a0"; // Number – totalPrice
const CF_HOURLY_RATE_ID = "7ed74ee6-bacf-4526-aaa9-1580c689712b"; // Number – hourlyRate
const CF_READY_TO_INVOICE_ID = "c1aefd2b-2894-4e45-9edf-0e484a85bc86"; // Bool – ReadyToInvoice
const CF_PROJECT_CLIENT_NAME_ID = "586f7811-79a0-40a6-ad55-324b98a53824"; // Dropdown/Text – jméno klienta v Projects
const CF_PROJECT_INVOICE_NUMBER_ID = process.env
  .CLICKUP_CF_PROJECT_INVOICE_NUMBER_ID!; // Text/Number field v Projects pro číslo faktury

// Custom field IDs v CLIENTS listu
const CF_CLIENT_SHORT_CODE_ID = process.env
  .CLICKUP_CF_CLIENT_SHORT_CODE_ID!; // např. "JK" – kratší kód klienta
const CF_CLIENT_STREET_ID = process.env.CLICKUP_CF_CLIENT_STREET_ID!;
const CF_CLIENT_CITY_ID = process.env.CLICKUP_CF_CLIENT_CITY_ID!;
const CF_CLIENT_ZIP_ID = process.env.CLICKUP_CF_CLIENT_ZIP_ID!;
const CF_CLIENT_COUNTRY_ID = process.env.CLICKUP_CF_CLIENT_COUNTRY_ID!;
const CF_CLIENT_ICO_ID = process.env.CLICKUP_CF_CLIENT_ICO_ID!;
const CF_CLIENT_DIC_ID = process.env.CLICKUP_CF_CLIENT_DIC_ID!;
const CF_CLIENT_EMAIL_ID = process.env.CLICKUP_CF_CLIENT_EMAIL_ID!;
const CF_CLIENT_DEFAULT_DUE_DAYS_ID = process.env
  .CLICKUP_CF_CLIENT_DEFAULT_DUE_DAYS_ID!;

// Custom field IDs v INVOICES listu
const CF_INVOICE_NUMBER_ID = process.env.CLICKUP_CF_INVOICE_NUMBER_ID!; // Number / Text
const CF_INVOICE_CLIENT_NAME_ID = process.env
  .CLICKUP_CF_INVOICE_CLIENT_NAME_ID!;
const CF_INVOICE_TOTAL_ID = process.env.CLICKUP_CF_INVOICE_TOTAL_ID!;
const CF_INVOICE_ISSUE_DATE_ID = process.env.CLICKUP_CF_INVOICE_ISSUE_DATE_ID!;
const CF_INVOICE_DUE_DATE_ID = process.env.CLICKUP_CF_INVOICE_DUE_DATE_ID!;
const CF_INVOICE_PAID_ID = process.env.CLICKUP_CF_INVOICE_PAID_ID!;
const CF_INVOICE_PDF_LINK_ID = process.env.CLICKUP_CF_INVOICE_PDF_LINK_ID!;

// Resend / email
const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const INVOICE_SENDER = process.env.INVOICE_SENDER_EMAIL!; // např. "faktury@tvoje-domena.cz"
const INVOICE_BCC = process.env.INVOICE_BCC_EMAIL || "";  // třeba tvůj vlastní mail

// ====== TYPY ======

type ClickUpWebhookBody = {
  payload: {
    id: string;
    subcategory?: string; // list_id
    lists?: { list_id: string; type: string }[];
    name: string;
    fields?: {
      field_id: string;
      value: any;
    }[];
  };
};

type ClickUpTask = {
  id: string;
  name: string;
  custom_fields?: {
    id: string;
    value: any;
  }[];
};

// ====== HELPERY ======

function getFieldValueFromWebhook(
  body: ClickUpWebhookBody,
  fieldId: string
): any | undefined {
  return body.payload.fields?.find((f) => f.field_id === fieldId)?.value;
}

function getFieldValueFromTask(task: ClickUpTask, fieldId: string): any {
  return (
    task.custom_fields?.find((f) => f.id === fieldId)?.value ?? undefined
  );
}

// Čisté zaokrouhlení na 2 desetinná místa
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function padNumber(n: number, digits: number): string {
  return n.toString().padStart(digits, "0");
}

// ====== CLICKUP API CALLS ======

async function clickUpFetch(path: string, init?: RequestInit) {
  const url = `${CLICKUP_API_BASE}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: CLICKUP_API_TOKEN,
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[ClickUp] error", res.status, text);
    throw new Error(`ClickUp API error ${res.status}`);
  }

  return res.json();
}

async function getTasksInList(listId: string): Promise<ClickUpTask[]> {
  const data = await clickUpFetch(`/list/${listId}/task?archived=false`);
  return data.tasks as ClickUpTask[];
}

async function updateTask(taskId: string, body: any) {
  await clickUpFetch(`/task/${taskId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

async function createInvoiceTask(payload: {
  name: string;
  custom_fields: { id: string; value: any }[];
}): Promise<{ id: string }> {
  const data = await clickUpFetch(`/list/${INVOICES_LIST_ID}/task`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return { id: data.id };
}

// ====== DOMÉNOVÁ LOGIKA ======

// 1) Najdi další číslo faktury (max+1)
async function getNextInvoiceNumber(): Promise<number> {
  const tasks = await getTasksInList(INVOICES_LIST_ID);

  const numbers = tasks
    .map((t) => getFieldValueFromTask(t, CF_INVOICE_NUMBER_ID))
    .filter((v) => v !== undefined && v !== null)
    .map((v) => Number(v))
    .filter((n) => !Number.isNaN(n));

  if (numbers.length === 0) return 1;

  const max = Math.max(...numbers);
  return max + 1;
}

// 2) Najdi klienta podle jména (Clients list)
async function findClientByName(clientName: string) {
  const tasks = await getTasksInList(CLIENTS_LIST_ID);

  const clientTask = tasks.find((t) => t.name === clientName);
  if (!clientTask) return null;

  const get = (id: string) => getFieldValueFromTask(clientTask, id);

  return {
    taskId: clientTask.id,
    name: clientTask.name,
    shortCode: (get(CF_CLIENT_SHORT_CODE_ID) as string) || "",
    street: (get(CF_CLIENT_STREET_ID) as string) || "",
    city: (get(CF_CLIENT_CITY_ID) as string) || "",
    zip: (get(CF_CLIENT_ZIP_ID) as string) || "",
    country: (get(CF_CLIENT_COUNTRY_ID) as string) || "",
    ico: (get(CF_CLIENT_ICO_ID) as string) || "",
    dic: (get(CF_CLIENT_DIC_ID) as string) || "",
    email: (get(CF_CLIENT_EMAIL_ID) as string) || "",
    defaultDueDays:
      Number(get(CF_CLIENT_DEFAULT_DUE_DAYS_ID) as number | string) || 14,
  };
}

// 3) Pošli fakturu mailem (Resend) – jen skeleton, logiku emailu si už máš
async function sendInvoiceEmail(args: {
  client: ReturnType<typeof buildClientPayload>;
  invoiceMeta: {
    invoiceName: string;
    invoiceNumber: number;
    total: number;
    issueDate: Date;
    dueDate: Date;
  };
  items: {
    name: string;
    hourlyRate: number;
    totalPrice: number;
  }[];
}): Promise<{ pdfUrl?: string }> {
  // Sem si dej svojí logiku (tvorba PDF, Resend, apod.)
  // Tady jen placeholder, který loguje:
  console.info("[Invoice] Sending email", {
    to: args.client.email,
    invoice: args.invoiceMeta.invoiceName,
    total: args.invoiceMeta.total,
  });

  // TODO: tady vytvoř PDF, nahraj někam a vrať url
  const fakeUrl = "https://example.com/faktura.pdf";
  return { pdfUrl: fakeUrl };
}

// helper na payload klienta pro email
function buildClientPayload(client: NonNullable<Awaited<ReturnType<typeof findClientByName>>>) {
  return {
    name: client.name,
    email: client.email,
    address: `${client.street}, ${client.zip} ${client.city}, ${client.country}`,
    ico: client.ico,
    dic: client.dic,
  };
}

// ====== ROUTE HANDLER ======

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ClickUpWebhookBody;
    const triggerTaskId = body.payload.id;
    const listIdFromPayload =
      body.payload.subcategory || body.payload.lists?.[0]?.list_id;

    console.info("[Webhook] Trigger taskId:", triggerTaskId);
    console.info("[Webhook] ListId from payload:", listIdFromPayload);

    // Pokud webhook není z Projects listu, ignoruj (nebo podle potřeby)
    if (!listIdFromPayload || listIdFromPayload !== PROJECTS_LIST_ID) {
      console.info("[Webhook] Ignoring – not from Projects list");
      return NextResponse.json({ ok: true });
    }

    // 1) Načti všechny tasky v tomhle listu
    const allTasks = await getTasksInList(PROJECTS_LIST_ID);
    console.info("[Webhook] Tasks in list:", allTasks.length);

    // Najdi trigger task i v seznamu, ať máš jeho custom fields
    const triggerTask = allTasks.find((t) => t.id === triggerTaskId);
    if (!triggerTask) {
      console.warn("[Webhook] Trigger task not found in list");
      return NextResponse.json({ ok: true });
    }

    // 2) Kandidáti pro fakturaci:
    // ReadyToInvoice = true && InvoiceNumber prázdný
    const allCandidates = allTasks.filter((t) => {
      const ready = !!getFieldValueFromTask(t, CF_READY_TO_INVOICE_ID);
      const invoiceNumber = getFieldValueFromTask(
        t,
        CF_PROJECT_INVOICE_NUMBER_ID
      );
      return ready && (invoiceNumber === null || invoiceNumber === undefined);
    });

    console.info(
      "[Webhook] Kandidáti pro fakturaci (vše):",
      allCandidates.map((t) => t.id)
    );

    if (allCandidates.length === 0) {
      console.info("[Webhook] Žádní kandidáti – končím.");
      return NextResponse.json({ ok: true });
    }

    // 3) Omez kandidáty na stejného klienta jako má triggerTask
    const triggerClientName = getFieldValueFromTask(
      triggerTask,
      CF_PROJECT_CLIENT_NAME_ID
    ) as string | undefined;

    if (!triggerClientName) {
      console.warn(
        "[Webhook] Trigger task nemá nastaveného klienta – končím bez faktury."
      );
      return NextResponse.json({ ok: true });
    }

    const candidates = allCandidates.filter(
      (t) =>
        getFieldValueFromTask(t, CF_PROJECT_CLIENT_NAME_ID) ===
        triggerClientName
    );

    console.info(
      "[Webhook] Kandidáti pro fakturaci (stejný klient):",
      candidates.map((t) => t.id)
    );

    if (candidates.length === 0) {
      console.info(
        "[Webhook] Žádní kandidáti pro stejného klienta – končím."
      );
      return NextResponse.json({ ok: true });
    }

    // 4) Hlavní trigger – aby se faktura negenerovala víckrát
    const sortedCandidateIds = [...candidates]
      .map((t) => t.id)
      .sort((a, b) => a.localeCompare(b));
    const mainTriggerId = sortedCandidateIds[0];

    if (triggerTaskId !== mainTriggerId) {
      console.info(
        "[Webhook] Přeskakuju fakturaci v tomhle webhooku, hlavní trigger je",
        mainTriggerId,
        "aktuální je",
        triggerTaskId
      );
      return NextResponse.json({ ok: true });
    }

    // 5) Najdi klienta v Clients listu
    const client = await findClientByName(triggerClientName);
    if (!client) {
      console.warn(
        "[Webhook] Klient nenalezen v Clients listu:",
        triggerClientName
      );
      return NextResponse.json({ ok: true });
    }
    const clientPayload = buildClientPayload(client);

    // 6) Připrav položky faktury
    const invoiceItems = candidates.map((t) => {
      const hourlyRate =
        Number(getFieldValueFromTask(t, CF_HOURLY_RATE_ID)) || 0;
      const totalPrice =
        Number(getFieldValueFromTask(t, CF_TOTAL_PRICE_ID)) || 0;
      return {
        taskId: t.id,
        name: t.name,
        hourlyRate,
        totalPrice: round2(totalPrice),
      };
    });

    const total = round2(
      invoiceItems.reduce((sum, i) => sum + i.totalPrice, 0)
    );

    console.info("[Webhook] Invoice items:", invoiceItems);

    // 7) Vygeneruj číslo faktury
    const nextInvoiceNumber = await getNextInvoiceNumber();
    const now = new Date();
    const year = now.getFullYear();
    const humanNumber = `${year}-${padNumber(nextInvoiceNumber, 3)}`;

    const shortCode = client.shortCode || "CL";
    const invoiceName = `F${humanNumber}_${shortCode}`;

    const issueDate = now;
    const dueDate = new Date(
      now.getTime() + client.defaultDueDays * 24 * 60 * 60 * 1000
    );

    // 8) Pošli fakturu (email + případné PDF)
    const emailResult = await sendInvoiceEmail({
      client: clientPayload,
      invoiceMeta: {
        invoiceName,
        invoiceNumber: nextInvoiceNumber,
        total,
        issueDate,
        dueDate,
      },
      items: invoiceItems,
    });

    // 9) Vytvoř task v Invoices listu
    const invoiceTask = await createInvoiceTask({
      name: invoiceName,
      custom_fields: [
        { id: CF_INVOICE_NUMBER_ID, value: nextInvoiceNumber },
        { id: CF_INVOICE_CLIENT_NAME_ID, value: client.name },
        { id: CF_INVOICE_TOTAL_ID, value: total },
        { id: CF_INVOICE_ISSUE_DATE_ID, value: issueDate.getTime() },
        { id: CF_INVOICE_DUE_DATE_ID, value: dueDate.getTime() },
        { id: CF_INVOICE_PAID_ID, value: false },
        ...(emailResult.pdfUrl
          ? [{ id: CF_INVOICE_PDF_LINK_ID, value: emailResult.pdfUrl }]
          : []),
      ],
    });

    console.info("[Webhook] Invoice task created:", invoiceTask.id);

    // 🔟 Aktualizuj PROJECT tasks – nastav Invoice number + ReadyToInvoice=false
    for (const item of invoiceItems) {
      await updateTask(item.taskId, {
        custom_fields: [
          { id: CF_PROJECT_INVOICE_NUMBER_ID, value: nextInvoiceNumber },
          { id: CF_READY_TO_INVOICE_ID, value: false },
        ],
      });
    }

    console.info(
      "[Webhook] Custom fields aktualizovány pro fakturované tasky:",
      invoiceItems.map((i) => i.taskId)
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Webhook] ERROR:", err);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}
