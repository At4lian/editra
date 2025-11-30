/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";


// ============ CONFIG ============

// ClickUp
const CLICKUP_API_TOKEN = process.env.CLICKUP_API_TOKEN!;
const CLICKUP_API_BASE = "https://api.clickup.com/api/v2";

// List IDs (Video Production space)
const PROJECTS_LIST_ID = "901518258148";
const CLIENTS_LIST_ID = "901518279818";
const INVOICES_LIST_ID = "901518279874";

// --- Custom fields: PROJECTS ("Projects" list) ---

// Total Price (formula)
const CF_TOTAL_PRICE_ID = "4f368785-f1ac-490e-9131-581c56e110a0";
// Client (drop_down)
const CF_PROJECT_CLIENT_NAME_ID = "586f7811-79a0-40a6-ad55-324b98a53824";
// Hourly Rate (currency)
const CF_HOURLY_RATE_ID = "7ed74ee6-bacf-4526-aaa9-1580c689712b";
// Invoice Number (short_text) – číslo faktury na PROJECTS tasku
const CF_PROJECT_INVOICE_NUMBER_ID = "82a5d55e-dadc-4978-bb1c-6d7b3c837acd";
// Invoiced (checkbox) – používáme jako "ReadyToInvoice"
const CF_READY_TO_INVOICE_ID = "c1aefd2b-2894-4e45-9edf-0e484a85bc86";
// Paid (checkbox) – zatím nepoužíváme
const CF_PROJECT_PAID_ID = "cfd3baf0-35b2-4f2b-8d75-f7e0341dc322";

// --- Custom fields: CLIENTS ("Clients" list) ---

const CF_CLIENT_CITY_ID = "05cf75ed-65a2-45db-aeda-a689bc5470bb"; // City
const CF_CLIENT_DEFAULT_DUE_DAYS_ID = "108f4b6c-95ac-49a2-b2df-b5a6ee18fddd"; // Default due days
const CF_CLIENT_COUNTRY_ID = "11757f3e-55dc-451b-b571-dcea25a27160"; // Country
const CF_CLIENT_EMAIL_ID = "1a73a54e-969e-4de5-80e3-c5ca081a52c9"; // Email
const CF_CLIENT_DIC_ID = "8c6e2257-37d2-46fc-b5f4-347a6e4e8c7c"; // DIČ
const CF_CLIENT_STREET_ID = "8d338e58-d810-499d-9b73-f920cfceb9ed"; // Street
const CF_CLIENT_ZIP_ID = "ad5270c3-b0cd-487f-9430-80d898067a2f"; // ZIP
const CF_CLIENT_ICO_ID = "ca5af7da-40cb-4f34-9902-1f88bb360e5d"; // IČ
const CF_CLIENT_SHORT_CODE_ID = "fc6f7b03-7a31-4c04-ae7d-b5a0c0653f49"; // Short code

// --- Custom fields: INVOICES ("Invoices" list) ---

const CF_INVOICE_TOTAL_ID = "2f695604-81dc-4cf3-a279-b5ab0a81f35f"; // Total (currency)
const CF_INVOICE_DUE_DATE_ID = "4cb58b5f-4f97-4aca-8169-2ee0e1c91e91"; // Due Date (date)
const CF_INVOICE_CLIENT_NAME_ID = "7d9683e2-9305-456c-8f4d-0ed4fe181b00"; // Client (short_text)
const CF_INVOICE_NUMBER_ID = "82a5d55e-dadc-4978-bb1c-6d7b3c837acd"; // Invoice Number (short_text)
const CF_INVOICE_ISSUE_DATE_ID = "872b7d98-e277-43ac-87e1-f5048fb4ad9c"; // Issue Date (date)
const CF_INVOICE_PDF_LINK_ID = "97a94428-dd1e-4c4b-b176-76b99de1c877"; // PDF Link (url)
const CF_INVOICE_INVOICED_ID = "c1aefd2b-2894-4e45-9edf-0e484a85bc86"; // Invoiced (checkbox)
const CF_INVOICE_PAID_ID = "cfd3baf0-35b2-4f2b-8d75-f7e0341dc322"; // Paid (checkbox)

// ============ TYPY ============

type ClickUpWebhookBody = {
  payload: {
    id: string;
    name: string;
    subcategory?: string; // list_id
    lists?: { list_id: string; type: string }[];
  };
};

type ClickUpCustomField = {
  id: string;
  value: any;
  type?: string;
  type_config?: any;
};

type ClickUpTask = {
  id: string;
  name: string;
  custom_fields?: ClickUpCustomField[];
};

type ClientRecord = {
  taskId: string;
  name: string;
  shortCode: string;
  street: string;
  city: string;
  zip: string;
  country: string;
  ico: string;
  dic: string;
  email: string;
  defaultDueDays: number;
};

type InvoiceItem = {
  taskId: string;
  name: string;
  hourlyRate: number;
  totalPrice: number;
};

type ClientDropdownMeta = {
  byOptionId: Map<string, { name: string; orderindex: number }>;
  byOrderIndex: Map<number, { id: string; name: string }>;
};

// ============ HELPERY ============

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function padNumber(n: number, digits: number): string {
  return n.toString().padStart(digits, "0");
}

function getFieldValueFromTask(task: ClickUpTask, fieldId: string): any {
  return task.custom_fields?.find((f) => f.id === fieldId)?.value ?? undefined;
}

function getFieldObjectFromTask(
  task: ClickUpTask,
  fieldId: string
): ClickUpCustomField | undefined {
  return task.custom_fields?.find((f) => f.id === fieldId);
}

function cleanText(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return "";
  return String(value);
}

let invoiceFontBytesCache: Uint8Array | null = null;

async function getInvoiceFontBytes(): Promise<Uint8Array> {
  if (invoiceFontBytesCache) return invoiceFontBytesCache;

  const fontPath = path.join(process.cwd(), "public", "fonts", "DejaVuSans.ttf");
  const data = await fs.promises.readFile(fontPath);
  invoiceFontBytesCache = data;
  return invoiceFontBytesCache;
}



async function updateTaskCustomField(
  taskId: string,
  fieldId: string,
  value: any
) {
  const data = await clickUpFetch(`/task/${taskId}/field/${fieldId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value }),
  });

  return data;
}


async function clickUpFetch(path: string, init?: RequestInit) {
  const url = `${CLICKUP_API_BASE}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: CLICKUP_API_TOKEN,
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[ClickUp] error", res.status, text);
    throw new Error(`ClickUp API error ${res.status}`);
  }

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

async function getTasksInList(listId: string): Promise<ClickUpTask[]> {
  const data = await clickUpFetch(`/list/${listId}/task?archived=false`);
  return (data as any).tasks ?? [];
}

async function getTaskById(taskId: string): Promise<ClickUpTask> {
  const data = await clickUpFetch(`/task/${taskId}`);
  return data as ClickUpTask;
}

async function updateTask(taskId: string, body: any) {
  const data = await clickUpFetch(`/task/${taskId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return data;
}

async function createInvoiceTask(payload: {
  name: string;
  custom_fields: { id: string; value: any }[];
}): Promise<{ id: string }> {
  const data = await clickUpFetch(`/list/${INVOICES_LIST_ID}/task`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return { id: (data as any).id as string };
}

// Dropdown metadata
async function getClientDropdownMeta(): Promise<ClientDropdownMeta> {
  const data = await clickUpFetch(`/list/${PROJECTS_LIST_ID}/field`);
  const field = (data as any).fields?.find(
    (f: any) => f.id === CF_PROJECT_CLIENT_NAME_ID
  );

  if (!field || !field.type_config || !field.type_config.options) {
    throw new Error("Client dropdown field has no options config");
  }

  const options = field.type_config.options as any[];

  const byOptionId = new Map<string, { name: string; orderindex: number }>();
  const byOrderIndex = new Map<number, { id: string; name: string }>();

  for (const opt of options) {
    const id = String(opt.id);
    const name = String(opt.name);
    const orderindex =
      typeof opt.orderindex === "number"
        ? opt.orderindex
        : parseInt(String(opt.orderindex ?? "0"), 10);

    byOptionId.set(id, { name, orderindex });
    byOrderIndex.set(orderindex, { id, name });
  }

  console.info("[DropdownMeta] Options:", options);
  return { byOptionId, byOrderIndex };
}

function resolveClientOption(
  rawValue: any,
  meta: ClientDropdownMeta
): { key: string; label: string } | null {
  if (rawValue === undefined || rawValue === null) return null;

  if (typeof rawValue === "number") {
    const found = meta.byOrderIndex.get(rawValue);
    if (!found) {
      console.warn("[DropdownMeta] No option for numeric value", rawValue);
      return null;
    }
    return { key: found.id, label: found.name };
  }

  if (typeof rawValue === "string") {
    const byId = meta.byOptionId.get(rawValue);
    if (byId) return { key: rawValue, label: byId.name };

    const allById = Array.from(meta.byOptionId.entries());
    const byName = allById.find(([, v]) => v.name === rawValue);
    if (byName) return { key: byName[0], label: byName[1].name };

    return { key: rawValue, label: rawValue };
  }

  return { key: String(rawValue), label: String(rawValue) };
}

// klient podle jména (Clients list)
async function findClientByName(clientName: string): Promise<ClientRecord | null> {
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

// další číslo faktury = max(CF_INVOICE_NUMBER_ID) + 1
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

function buildClientPayload(client: ClientRecord) {
  return {
    name: client.name,
    email: client.email,
    address: `${client.street}, ${client.zip} ${client.city}, ${client.country}`,
    ico: client.ico,
    dic: client.dic,
  };
}

// ============ PDF (pdf-lib) ============
async function generateInvoicePdfBuffer(args: {
  client: ReturnType<typeof buildClientPayload>;
  invoiceMeta: {
    invoiceName: string;
    invoiceNumber: number;
    total: number;
    issueDate: Date;
    dueDate: Date;
  };
  items: InvoiceItem[];
}): Promise<Buffer> {
  const { client, invoiceMeta, items } = args;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width } = page.getSize();

  // >>> tady embedneme náš TTF font
  const fontBytes = await getInvoiceFontBytes();
  const font = await pdfDoc.embedFont(fontBytes);

  let y = 800;

  const drawText = (
    text: string,
    options: { x?: number; y?: number; size?: number } = {}
  ) => {
    const size = options.size ?? 10;
    const x = options.x ?? 50;
    const yy = options.y ?? y;

    const txt = cleanText(text);

    page.drawText(txt, {
      x,
      y: yy,
      size,
      font,
      color: rgb(0, 0, 0),
    });
    y = yy - size - 4;
  };

  // Header
  drawText(`Invoice ${invoiceMeta.invoiceName}`, {
    x: width - 250,
    y,
    size: 18,
  });
  drawText(`Invoice number: ${invoiceMeta.invoiceNumber}`);
  drawText(
    `Issue date: ${invoiceMeta.issueDate.toLocaleDateString("cs-CZ")}`
  );
  drawText(`Due date: ${invoiceMeta.dueDate.toLocaleDateString("cs-CZ")}`);
  y -= 10;

  // Client
  drawText("Bill To:", { size: 12 });
  drawText(client.name);
  drawText(client.address);
  if (client.ico) drawText(`IČ: ${client.ico}`);
  if (client.dic) drawText(`DIČ: ${client.dic}`);
  y -= 10;

  // Items
  drawText("Items:", { size: 12 });
  for (const item of items) {
    drawText(item.name, { size: 11 });
    drawText(`Hourly rate: ${item.hourlyRate.toFixed(2)} Kč`, { x: 60 });
    drawText(`Total: ${item.totalPrice.toFixed(2)} Kč`, { x: 60 });
    y -= 4;
  }

  y -= 10;
  drawText(`Total: ${invoiceMeta.total.toFixed(2)} Kč`, {
    x: width - 200,
    size: 12,
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}



// ============ Attach PDF to ClickUp task ============

async function attachPdfToTask(
  taskId: string,
  pdfBuffer: Buffer,
  filename: string
): Promise<string | null> {
  const form = new FormData();
  const blob = new Blob([new Uint8Array(pdfBuffer)], { type: "application/pdf" });
  form.append("attachment", blob, filename);

  const res = await fetch(`${CLICKUP_API_BASE}/task/${taskId}/attachment`, {
    method: "POST",
    headers: { Authorization: CLICKUP_API_TOKEN },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[ClickUp] attachment error", res.status, text);
    return null;
  }

  const data = (await res.json()) as any;
  console.info("[Webhook] Attachment response:", data);

  const url =
    data?.attachment?.url ??
    data?.attachment?.thumb_url ??
    data?.url ??
    null;

  console.info("[Webhook] Attachment created for invoice:", { taskId, url });
  return url;
}

// ============ EMAIL (zatím stub) ============

async function sendInvoiceEmail(args: {
  client: ReturnType<typeof buildClientPayload>;
  invoiceMeta: {
    invoiceName: string;
    invoiceNumber: number;
    total: number;
    issueDate: Date;
    dueDate: Date;
  };
  items: InvoiceItem[];
  pdfBuffer: Buffer;
  pdfUrl?: string | null;
}) {
  console.info("[Invoice] Sending email (stub)", {
    to: args.client.email,
    invoice: args.invoiceMeta.invoiceName,
    total: args.invoiceMeta.total,
    items: args.items.length,
    pdfUrl: args.pdfUrl,
  });
}

// ============ ROUTE HANDLER ============

export async function POST(req: NextRequest) {
  try {
    if (!CLICKUP_API_TOKEN) {
      console.error("Missing CLICKUP_API_TOKEN");
      return NextResponse.json(
        { ok: false, error: "Missing CLICKUP_API_TOKEN" },
        { status: 500 }
      );
    }

    const body = (await req.json()) as ClickUpWebhookBody;
    const triggerTaskId = body.payload.id;
    const listIdFromPayload =
      body.payload.subcategory || body.payload.lists?.[0]?.list_id;

    console.info("[Webhook] Trigger taskId:", triggerTaskId);
    console.info("[Webhook] ListId from payload:", listIdFromPayload);

    if (!listIdFromPayload || listIdFromPayload !== PROJECTS_LIST_ID) {
      console.info("[Webhook] Ignoring – not from Projects list");
      return NextResponse.json({ ok: true });
    }

    // 1) Všechny tasky v Projects listu
    const allTasks = await getTasksInList(PROJECTS_LIST_ID);
    console.info("[Webhook] Tasks in Projects list:", allTasks.length);

    const triggerTask = allTasks.find((t) => t.id === triggerTaskId);
    if (!triggerTask) {
      console.warn("[Webhook] Trigger task not found in Projects list");
      return NextResponse.json({ ok: true });
    }

    // 2) Kandidáti = Invoiced=true a Invoice Number prázdné
    const allCandidates = allTasks.filter((t) => {
      const ready = !!getFieldValueFromTask(t, CF_READY_TO_INVOICE_ID);
      const invoiceNumber = getFieldValueFromTask(
        t,
        CF_PROJECT_INVOICE_NUMBER_ID
      );
      const hasInvoiceNumber =
        invoiceNumber !== undefined &&
        invoiceNumber !== null &&
        String(invoiceNumber).trim() !== "";

      return ready && !hasInvoiceNumber;
    });

    console.info(
      "[Webhook] Candidates (ready & no invoice number):",
      allCandidates.map((t) => t.id)
    );

    if (allCandidates.length === 0) {
      console.info("[Webhook] Žádní kandidáti – nic k fakturaci.");
      return NextResponse.json({ ok: true });
    }

    // 3) Dropdown metadata
    const dropdownMeta = await getClientDropdownMeta();

    // 4) Vyřešit klienta pro každého kandidáta
    const candidateClientResolved = [];
    for (const t of allCandidates) {
      let field = getFieldObjectFromTask(t, CF_PROJECT_CLIENT_NAME_ID);

      if (!field) {
        console.info(
          "[Webhook] Client field object not in list-task for",
          t.id,
          "– fetching full task"
        );
        const full = await getTaskById(t.id);
        field = getFieldObjectFromTask(full, CF_PROJECT_CLIENT_NAME_ID);
      }

      const rawValue = field?.value;
      console.info(
        "[Webhook] Raw client value for task",
        t.id,
        "=",
        rawValue,
        "type:",
        typeof rawValue
      );

      const resolved = resolveClientOption(rawValue, dropdownMeta);
      console.info("[Webhook] Resolved client for task", t.id, "=", resolved);

      candidateClientResolved.push({ taskId: t.id, rawValue, resolved });
    }

    console.info(
      "[Webhook] Candidate client options (resolved):",
      candidateClientResolved
    );

    const tasksMissingClient = candidateClientResolved.filter(
      (c) => c.resolved === null
    );
    if (tasksMissingClient.length > 0) {
      console.warn(
        "[Webhook] Některé kandidátní tasky NEMÁJÍ klienta ani po resolve – končím.",
        tasksMissingClient.map((t: any) => t.taskId)
      );
      return NextResponse.json({ ok: true });
    }

    const clientKeys = candidateClientResolved.map(
      (c: any) => c.resolved!.key
    );
    const uniqueClientKeys = Array.from(new Set(clientKeys));

    if (uniqueClientKeys.length > 1) {
      console.warn(
        "[Webhook] Kandidáti mají různé klienty – nechci míchat více klientů do jedné faktury.",
        { uniqueClientKeys, candidateClientResolved }
      );
      return NextResponse.json({ ok: true });
    }

    const sharedClientKey = uniqueClientKeys[0];
    const anyResolved = (candidateClientResolved as any)[0].resolved!;
    const clientName = anyResolved.label;

    console.info(
      "[Webhook] Shared client key:",
      sharedClientKey,
      "client name:",
      clientName
    );

    const candidates = allCandidates;

    // 5) Hlavní trigger, ať se faktura nevytvoří víckrát
    const sortedCandidateIds = [...candidates]
      .map((t) => t.id)
      .sort((a, b) => a.localeCompare(b));
    const mainTriggerId = sortedCandidateIds[0];

    if (triggerTaskId !== mainTriggerId) {
      console.info(
        "[Webhook] Skipping this webhook, main trigger is",
        mainTriggerId,
        "current is",
        triggerTaskId
      );
      return NextResponse.json({ ok: true });
    }

    // 6) Klient v Clients listu
    const client = await findClientByName(clientName);
    if (!client) {
      console.warn(
        "[Webhook] Klient nenalezen v Clients listu podle name:",
        clientName
      );
      return NextResponse.json({ ok: true });
    }

    const clientPayload = buildClientPayload(client);

    // 7) Položky faktury
    const invoiceItems: InvoiceItem[] = candidates.map((t) => {
      const hourlyRate =
        Number(getFieldValueFromTask(t, CF_HOURLY_RATE_ID)) || 0;
      const totalPrice =
        Number(getFieldValueFromTask(t, CF_TOTAL_PRICE_ID)) || 0;
      return {
        taskId: t.id,
        name: t.name,
        hourlyRate: round2(hourlyRate),
        totalPrice: round2(totalPrice),
      };
    });

    const total = round2(
      invoiceItems.reduce((sum, i) => sum + i.totalPrice, 0)
    );

    console.info("[Webhook] Invoice items:", invoiceItems);
    console.info("[Webhook] Invoice total:", total);

    if (total <= 0) {
      console.warn("[Webhook] Total <= 0 – nebudu generovat fakturu.");
      return NextResponse.json({ ok: true });
    }

    // 8) Číslo faktury
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

    // 9) PDF
    const pdfBuffer = await generateInvoicePdfBuffer({
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

    // 10) Vytvořit invoice task
    const invoiceTask = await createInvoiceTask({
      name: invoiceName,
      custom_fields: [
        { id: CF_INVOICE_NUMBER_ID, value: String(nextInvoiceNumber) },
        { id: CF_INVOICE_CLIENT_NAME_ID, value: client.name },
        { id: CF_INVOICE_TOTAL_ID, value: total },
        { id: CF_INVOICE_ISSUE_DATE_ID, value: issueDate.getTime() },
        { id: CF_INVOICE_DUE_DATE_ID, value: dueDate.getTime() },
        { id: CF_INVOICE_INVOICED_ID, value: true },
        { id: CF_INVOICE_PAID_ID, value: false },
      ],
    });

    console.info("[Webhook] Invoice task created:", invoiceTask.id);

    // 11) Nahrát PDF jako attachment
    const pdfUrl = await attachPdfToTask(
      invoiceTask.id,
      pdfBuffer,
      `${invoiceName}.pdf`
    );

    if (pdfUrl) {
      await updateTaskCustomField(
        invoiceTask.id,
        CF_INVOICE_PDF_LINK_ID,
        pdfUrl
      );
      console.info("[Webhook] PDF Link updated on invoice:", pdfUrl);
    }


    // 12) E-mail (zatím stub)
    await sendInvoiceEmail({
      client: clientPayload,
      invoiceMeta: {
        invoiceName,
        invoiceNumber: nextInvoiceNumber,
        total,
        issueDate,
        dueDate,
      },
      items: invoiceItems,
      pdfBuffer,
      pdfUrl,
    });

    // 13) Update PROJECTS tasků – Invoice Number + Invoiced=false
    for (const item of invoiceItems) {
      console.info(
        "[Webhook] Updating project task",
        item.taskId,
        "with invoice number",
        nextInvoiceNumber
      );

      // Invoice Number na PROJECT task
      await updateTaskCustomField(
        item.taskId,
        CF_PROJECT_INVOICE_NUMBER_ID,
        String(nextInvoiceNumber)
      );

      // „Invoiced“ (náš ReadyToInvoice) zpátky na false
      await updateTaskCustomField(
        item.taskId,
        CF_READY_TO_INVOICE_ID,
        false
      );

      const updated = await getTaskById(item.taskId);
      const invNumAfter = getFieldValueFromTask(
        updated,
        CF_PROJECT_INVOICE_NUMBER_ID
      );
      const readyAfter = !!getFieldValueFromTask(
        updated,
        CF_READY_TO_INVOICE_ID
      );

      console.info(
        "[Webhook] After update task",
        item.taskId,
        "InvoiceNumber=",
        invNumAfter,
        "ReadyToInvoice=",
        readyAfter
      );
    }


    console.info(
      "[Webhook] Custom fields aktualizovány pro fakturované tasky:",
      invoiceItems.map((i) => i.taskId)
    );

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[Webhook] ERROR:", err?.message ?? err);
    return NextResponse.json(
      { ok: false, error: "Internal error" },
      { status: 500 }
    );
  }
}
