"use client";

import { useErpData as useErpDataHook } from "@/context/erp-data-provider";

export { useErpData, useData } from "@/context/erp-data-provider";
export type { ErpData } from "@/lib/seed-data";
export { SEED_DATA } from "@/lib/seed-data";

/** Shorthand for `useErpData().data` in screen components */
export function useDATA() {
  return useErpDataHook().data;
}
