"use client";

import dynamic from "next/dynamic";
import { ErpDataProvider } from "@/context/erp-data-provider";

const MobileCanvasRoot = dynamic(
  () =>
    import("@/components/mobile-canvas").then((m) => m.MobileCanvasRoot),
  { ssr: false }
);

export function MobileClient() {
  return (
    <ErpDataProvider>
      <MobileCanvasRoot />
    </ErpDataProvider>
  );
}
