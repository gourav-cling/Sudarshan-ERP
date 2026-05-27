import { EntityStore } from "@/models/EntityStore";
import type { ErpData } from "@/lib/seed-data";
import { SEED_DATA } from "@/lib/seed-data";
import { EMPTY_ERP_DATA } from "@/lib/empty-erp-data";
import { connectDB } from "@/lib/mongodb";

const KEY_MAP: Record<Exclude<keyof ErpData, "USERS">, string> = {
  COMPANIES: "companies",
  RAW_MATERIALS: "rawMaterials",
  PACKAGING: "packaging",
  SPARE_PARTS: "spareParts",
  SPARE_CATEGORIES: "spareCategories",
  VENDORS: "vendors",
  PURCHASE_ORDERS: "purchaseOrders",
  CUSTOMERS: "customers",
  ORDERS: "orders",
  INVOICES: "invoices",
  DISPATCHES: "dispatches",
  EMPLOYEES: "employees",
  PERMISSIONS: "permissions",
  ROLES: "roles",
  NOTIFS: "notifications",
  REVENUE_DATA: "revenueData",
  PRODUCTION_DATA: "productionData",
  FIELD_VISITS: "fieldVisits",
  ATTENDANCE_TODAY: "attendanceToday",
};

const REVERSE_KEY_MAP: Record<string, keyof ErpData> = Object.fromEntries(
  Object.entries(KEY_MAP).map(([field, key]) => [key, field as keyof ErpData])
) as Record<string, keyof ErpData>;

function docToField(
  doc: { key: string; items?: unknown[]; meta?: unknown }
): Partial<ErpData> {
  const field = REVERSE_KEY_MAP[doc.key];
  if (!field) return {};
  if (field === "ATTENDANCE_TODAY") {
    return { ATTENDANCE_TODAY: (doc.meta ?? EMPTY_ERP_DATA.ATTENDANCE_TODAY) as ErpData["ATTENDANCE_TODAY"] };
  }
  return { [field]: (doc.items ?? []) } as Partial<ErpData>;
}

/** Load ERP entities from MongoDB only — never injects in-memory seed data. */
export async function loadErpDataFromDb(): Promise<ErpData> {
  await connectDB();
  const docs = await EntityStore.find({}).lean();

  if (docs.length === 0) {
    return { ...EMPTY_ERP_DATA };
  }

  const result: ErpData = { ...EMPTY_ERP_DATA };
  for (const doc of docs) {
    Object.assign(result, docToField(doc));
  }
  return result;
}

export async function seedEntities(): Promise<{ seeded: boolean; counts: Record<string, number> }> {
  await connectDB();
  await EntityStore.deleteMany({});

  const counts: Record<string, number> = {};
  for (const [field, key] of Object.entries(KEY_MAP)) {
    if (field === "USERS") continue;
    const value = SEED_DATA[field as keyof ErpData];
    if (key === "attendanceToday") {
      await EntityStore.create({ key, meta: value, items: [] });
      counts[key] = 1;
    } else if (Array.isArray(value)) {
      await EntityStore.create({ key, items: value });
      counts[key] = value.length;
    }
  }
  return { seeded: true, counts };
}

export async function upsertEntity(
  key: string,
  items: unknown[] | Record<string, unknown>
) {
  await connectDB();
  if (key === "attendanceToday" && !Array.isArray(items)) {
    await EntityStore.findOneAndUpdate(
      { key },
      { meta: items, items: [] },
      { upsert: true, new: true }
    );
    return;
  }
  await EntityStore.findOneAndUpdate(
    { key },
    { items },
    { upsert: true, new: true }
  );
}

export async function getEntityItems<T = unknown>(key: string): Promise<T[]> {
  await connectDB();
  const doc = await EntityStore.findOne({ key }).lean();
  if (!doc) return [];
  return (doc.items as T[]) ?? [];
}

/** Entities keyed by `code` instead of `id`. */
const CODE_KEY_ENTITIES = new Set([
  "rawMaterials",
  "packaging",
  "spareParts",
]);

export function getEntityIdField(key: string): "id" | "code" | "module" {
  if (CODE_KEY_ENTITIES.has(key)) return "code";
  if (key === "permissions") return "module";
  return "id";
}

function matchItem(
  item: Record<string, unknown>,
  idField: string,
  id: string
): boolean {
  return String(item[idField] ?? "") === id;
}

export async function appendEntityItem(key: string, item: Record<string, unknown>) {
  if (key === "attendanceToday") {
    await upsertEntity(key, item);
    return item;
  }
  const items = (await getEntityItems<Record<string, unknown>>(key)) ?? [];
  const next = [...items, item];
  await upsertEntity(key, next);
  return item;
}

export async function updateEntityItem(
  key: string,
  id: string,
  patch: Record<string, unknown>,
  idField?: string
) {
  const field = idField ?? getEntityIdField(key);
  if (key === "attendanceToday") {
    const doc = await EntityStore.findOne({ key }).lean();
    const meta = { ...(doc?.meta as Record<string, unknown>), ...patch };
    await upsertEntity(key, meta);
    return meta;
  }
  const items = await getEntityItems<Record<string, unknown>>(key);
  let found = false;
  const next = items.map((item) => {
    if (!matchItem(item, field, id)) return item;
    found = true;
    return { ...item, ...patch };
  });
  if (!found) throw new Error(`Record not found: ${id}`);
  await upsertEntity(key, next);
  return next.find((item) => matchItem(item, field, id));
}

export async function removeEntityItem(
  key: string,
  id: string,
  idField?: string
) {
  const field = idField ?? getEntityIdField(key);
  const items = await getEntityItems<Record<string, unknown>>(key);
  const next = items.filter((item) => !matchItem(item, field, id));
  if (next.length === items.length) throw new Error(`Record not found: ${id}`);
  await upsertEntity(key, next);
}

export { KEY_MAP };
