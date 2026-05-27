import mongoose, { Schema, models, model } from "mongoose";

/** Generic document store for ERP entity arrays keyed by collection name. */
const EntityStoreSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    items: { type: Schema.Types.Mixed, default: [] },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const EntityStore =
  models.EntityStore || model("EntityStore", EntityStoreSchema);

export const ENTITY_KEYS = [
  "companies",
  "rawMaterials",
  "packaging",
  "spareParts",
  "spareCategories",
  "vendors",
  "purchaseOrders",
  "customers",
  "orders",
  "invoices",
  "dispatches",
  "employees",
  "permissions",
  "roles",
  "notifications",
  "revenueData",
  "productionData",
  "fieldVisits",
  "attendanceToday",
] as const;

export type EntityKey = (typeof ENTITY_KEYS)[number];
