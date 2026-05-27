"use client";

import { ErpApp } from "@/components/erp-app";
import { use } from "react";

export default function ErpCatchAllPage({
  params,
}: {
  params: Promise<{ segments: string[] }>;
}) {
  const { segments } = use(params);
  return <ErpApp segments={segments} />;
}
