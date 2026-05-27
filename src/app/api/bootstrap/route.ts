import { loadErpDataFromDb } from "@/lib/db-entities";
import { EMPTY_ERP_DATA } from "@/lib/empty-erp-data";
import { buildBootstrapMeta, useMockDataEnabled } from "@/lib/bootstrap-meta";
import { isDbConfigured } from "@/lib/mongodb";
import { fail } from "@/lib/api-response";
import { SEED_DATA } from "@/lib/seed-data";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    if (!isDbConfigured()) {
      const data = useMockDataEnabled() ? SEED_DATA : EMPTY_ERP_DATA;
      const source = useMockDataEnabled() ? "mock" : "empty";
      const meta = buildBootstrapMeta(data, source);
      return NextResponse.json({ data, error: null, meta });
    }

    const data = await loadErpDataFromDb();
    const meta = buildBootstrapMeta(data, "mongodb");
    return NextResponse.json({ data, error: null, meta });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load data";
    return fail(message, 500);
  }
}
