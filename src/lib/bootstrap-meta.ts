import type { ErpData } from "@/lib/seed-data";
import { isErpDataEmpty } from "@/lib/empty-erp-data";
import { isDbConfigured } from "@/lib/mongodb";

export type BootstrapSource = "mongodb" | "empty" | "mock";

export type BootstrapMeta = {
  source: BootstrapSource;
  dbConfigured: boolean;
  isEmpty: boolean;
  warning?: string;
};

export function useMockDataEnabled(): boolean {
  return process.env.USE_MOCK_DATA === "true";
}

export function buildBootstrapMeta(
  data: ErpData,
  source: BootstrapSource
): BootstrapMeta {
  const dbConfigured = isDbConfigured();
  const isEmpty = isErpDataEmpty(data);
  let warning: string | undefined;

  if (!dbConfigured && source === "mock") {
    warning =
      "MONGODB_URI is not set. Showing demo data (USE_MOCK_DATA=true). Set MONGODB_URI and run npm run seed for real data.";
  } else if (!dbConfigured) {
    warning =
      "MONGODB_URI is not set. No ERP data loaded. Add MONGODB_URI to .env.local and run npm run seed — or set USE_MOCK_DATA=true for demo data only.";
  } else if (isEmpty) {
    warning =
      "Database has no ERP entities. Run npm run seed to load demo data, or add records via the API.";
  }

  return { source, dbConfigured, isEmpty, warning };
}
