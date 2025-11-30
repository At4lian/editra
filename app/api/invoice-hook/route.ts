/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";

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
// Invoice Number (short_text) – číslo faktury, které doplníme do PROJECTS tasků
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
const CF_INVOICE_NUMBER_ID = "82a5d55e-dadc-4978-bb1c-6d7b3c837acd"; // Invoice Number (short_text) – stejný field jako u Projects
const CF_INVOICE_ISSUE_DATE_ID = "872b7d98-e277-43ac-87e1-f5048fb4ad9c"; // Issue Date (date)
const CF_INVOICE_PDF_LINK_ID = "97a94428-dd1e-4c4b-b176-76b99de1c877"; // PDF Link (url)
const CF_INVOICE_INVOICED_ID = "c1aefd2b-2894-4e45-9edf-0e484a85bc86"; // Invoiced (checkbox)
const CF_INVOICE_PAID_ID = "cfd3baf0-35b2-4f2b-8d75-f7e0341dc322"; // Paid (checkbox)

// Resend / mail – zatím jen stub
const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const INVOICE_SENDER = process.env.INVOICE_SENDER_EMAIL ?? "";
const INVOICE_BCC = process.env.INVOICE_BCC_EMAIL ?? "";

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

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}

async function getTasksInList(listId: string): Promise<ClickUpTask[]> {
  const data = await clickUpFetch(`/list/${listId}/task?archived=false`);
  return (data as any).tasks ?? [];
}

// Dotažení jednoho tasku včetně všech custom_fields
async function getTaskById(taskId: string): Promise<ClickUpTask> {
  const data = await clickUpFetch(`/task/${taskId}`);
  return data as ClickUpTask;
}

async function updateTask(taskId: string, body: any) {
  const data = await clickUpFetch(`/task/${taskId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
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
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return { id: (data as any).id as string };
}

// Načtení dropdown options pro Client (Projects list)
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

// Z raw value (0, 'uuid', 'Jakub Nitran') udělá jednotnou reprezentaci
function resolveClientOption(
  rawValue: any,
  meta: ClientDropdownMeta
): { key: string; label: string } | null {
  if (rawValue === undefined || rawValue === null) return null;

  if (typeof rawValue === "number") {
    const found = meta.byOrderIndex.get(rawValue);
    if (!found) {
      console.warn(
        "[DropdownMeta] No option for numeric value",
        rawValue,
        "– returning null"
      );
      return null;
    }
    return { key: found.id, label: found.name };
  }

  if (typeof rawValue === "string") {
    const byId = meta.byOptionId.get(rawValue);
    if (byId) return { key: rawValue, label: byId.name };

    const allById = Array.from(meta.byOptionId.entries());
    const byName = allById.find(([, v]) => v.name === rawValue);
    if (byName) {
      return { key: byName[0], label: byName[1].name };
    }

    console.warn(
      "[DropdownMeta] String client value nezapadá ani jako ID ani jako name:",
      rawValue
    );
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

// ============ PDF GENERATION ============

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
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const { client, invoiceMeta, items } = args;

    // Header
    doc.fontSize(20).text(`Invoice ${invoiceMeta.invoiceName}`, { align: "right" });
    doc.moveDown();

    doc.fontSize(10);
    doc.text(`Invoice number: ${invoiceMeta.invoiceNumber}`);
    doc.text(
      `Issue date: ${invoiceMeta.issueDate.toLocaleDateString("cs-CZ")}`
    );
    doc.text(`Due date: ${invoiceMeta.dueDate.toLocaleDateString("cs-CZ")}`);
    doc.moveDown();

    // Client block
    doc.fontSize(12).text("Bill To:", { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(10);
    doc.text(client.name);
    doc.text(client.address);
    if (client.ico) doc.text(`IČ: ${client.ico}`);
    if (client.dic) doc.text(`DIČ: ${client.dic}`);
    doc.moveDown();

    // Items
    doc.fontSize(12).text("Items", { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(10);
    items.forEach((item) => {
      doc.text(item.name, { continued: false });
      doc.text(`Hourly rate: ${item.hourlyRate.toFixed(2)} Kč`, { indent: 10 });
      doc.text(`Total: ${item.totalPrice.toFixed(2)} Kč`, { indent: 10 });
      doc.moveDown(0.5);
    });

    doc.moveDown();
    doc.fontSize(12).text(
      `Total: ${invoiceMeta.total.toFixed(2)} Kč`,
      { align: "right" }
    );

    doc.end();
  });
}

// ============ ATTACH PDF TO CLICKUP TASK ============

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
    headers: {
      Authorization: CLICKUP_API_TOKEN,
      // Content-Type necháme na fetchu – nastaví boundary sám
    },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[ClickUp] attachment error", res.status, text);
    return null;
  }

  const data = (await res.json()) as any;
  // Response struktura není úplně jasná, zalogujeme
  console.info("[Webhook] Attachment response:", data);

  const url =
    data?.attachment?.url ??
    data?.attachment?.thumb_url ??
    data?.url ??
    null;

  console.info("[Webhook] Attachment created for invoice:", {
    taskId,
    url,
  });

  return url;
}

// ============ EMAIL / RESEND (STUB) ============

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
}): Promise<void> {
  console.info("[Invoice] Sending email (stub)", {
    to: args.client.email,
    invoice: args.invoiceMeta.invoiceName,
    total: args.invoiceMeta.total,
    items: args.items.length,
    pdfUrl: args.pdfUrl,
  });

  // Tady si později přidáš reálný Resend call s PDF přílohou
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

    // 2) Kandidáti = všechno, co má Invoiced=true a Invoice Number prázdné
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

    // 4) Pro každého kandidáta zjistíme client (option value)
    const candidateClientResolved: {
      taskId: string;
      rawValue: any;
      resolved: { key: string; label: string } | null;
    }[] = [];

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

      candidateClientResolved.push({
        taskId: t.id,
        rawValue,
        resolved,
      });
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
        tasksMissingClient.map((t) => t.taskId)
      );
      return NextResponse.json({ ok: true });
    }

    const clientKeys = candidateClientResolved.map(
      (c) => c.resolved!.key
    );
    const uniqueClientKeys = Array.from(new Set(clientKeys));

    if (uniqueClientKeys.length > 1) {
      console.warn(
        "[Webhook] Kandidáti mají různé klienty (po resolve) – nechci míchat více klientů do jedné faktury. Končím.",
        { uniqueClientKeys, candidateClientResolved }
      );
      return NextResponse.json({ ok: true });
    }

    const sharedClientKey = uniqueClientKeys[0];
    const anyResolved = candidateClientResolved[0].resolved!;
    const clientName = anyResolved.label;

    console.info(
      "[Webhook] Shared client key:",
      sharedClientKey,
      "client name:",
      clientName
    );

    const candidates = allCandidates;

    // 5) Hlavní trigger – aby se faktura negenerovala víckrát
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

    // 6) Najdi klienta v Clients listu
    const client = await findClientByName(clientName);
    if (!client) {
      console.warn(
        "[Webhook] Klient nenalezen v Clients listu podle name:",
        clientName
      );
      return NextResponse.json({ ok: true });
    }

    const clientPayload = buildClientPayload(client);

    // 7) Připrav položky faktury z kandidátů
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

    // 9) PDF FACTURA
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

    // 10) Vytvořit task v Invoices listu (zatím bez PDF Link)
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

    // 11) Nahrát PDF jako attachment k faktuře
    const pdfUrl = await attachPdfToTask(
      invoiceTask.id,
      pdfBuffer,
      `${invoiceName}.pdf`
    );

    // 12) Dopsat PDF Link, pokud máme URL
    if (pdfUrl) {
      await updateTask(invoiceTask.id, {
        custom_fields: [{ id: CF_INVOICE_PDF_LINK_ID, value: pdfUrl }],
      });
      console.info("[Webhook] PDF Link updated on invoice:", pdfUrl);
    }

    // 13) Odeslat e-mail (zatím stub)
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

    // 14) Aktualizace PROJECTS tasků – Invoice Number + Invoiced=false
    for (const item of invoiceItems) {
      console.info(
        "[Webhook] Updating project task",
        item.taskId,
        "with invoice number",
        nextInvoiceNumber
      );

      await updateTask(item.taskId, {
        custom_fields: [
          {
            id: CF_PROJECT_INVOICE_NUMBER_ID,
            value: String(nextInvoiceNumber),
          },
          { id: CF_READY_TO_INVOICE_ID, value: false },
        ],
      });

      // Debug: přečteme task po update a zalogujeme hodnoty
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
