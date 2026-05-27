import { ErpApp } from "@/components/erp-app";
import { ReactNode } from "react";

export default function HrmsLayout({ children }: { children: ReactNode }) {
  return <ErpApp>{children}</ErpApp>;
}
