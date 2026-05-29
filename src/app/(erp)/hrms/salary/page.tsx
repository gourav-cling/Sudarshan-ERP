"use client";

import Link from "next/link";
import { Button } from "antd";
import {
  TeamOutlined,
  DollarOutlined,
  MinusCircleOutlined,
  WalletOutlined,
  TableOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import {
  getPayrollSheetDummy,
  getPayrollSheetKpi,
  formatPayrollInr,
} from "@/lib/payroll-sheet-dummy";

const FEATURE_CARDS = [
  {
    href: "/hrms/salary/monthly",
    title: "Monthly salary",
    description: "Generate, approve and export monthly salary sheets from attendance",
    icon: CalendarOutlined,
  },
  {
    href: "/hrms/salary/bulk",
    title: "Payroll sheet — bulk view",
    description: "Wide register with bank, statutory, attendance and pay components per employee",
    icon: TableOutlined,
  },
  {
    href: "/hrms/salary/daily-wage",
    title: "Daily wage payroll",
    description: "Daily-wage workers register and disbursement batch",
    icon: WalletOutlined,
  },
];

export default function SalaryIndexPage() {
  const rows = getPayrollSheetDummy();
  const kpi = getPayrollSheetKpi(rows);

  return (
    <div className="attendance-reports-page">
      <PageHeader
        title="Salary & payroll"
        subtitle="Salary sheets, statutory deductions, bank disbursement and payroll runs"
      />

      <div className="attendance-kpi-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <StatCard icon={TeamOutlined} label="Employees on sheet" value={String(kpi.employees)} hint="Mar 2026 payroll preview" />
        <StatCard icon={DollarOutlined} label="Total gross" value={formatPayrollInr(kpi.gross)} hint="Before deductions" />
        <StatCard icon={MinusCircleOutlined} label="Total deductions" value={formatPayrollInr(kpi.deductions)} hint="PF, ESI, TDS, LWP" hintTone="warning" />
        <StatCard icon={WalletOutlined} label="Net pay" value={formatPayrollInr(kpi.netPay)} hint="Disbursal amount" hintTone="positive" />
      </div>

      <div className="salary-feature-grid">
        {FEATURE_CARDS.map((card) => (
          <Link key={card.href} href={card.href} className="salary-feature-card">
            <card.icon style={{ fontSize: 22, color: "#374d95" }} />
            <div>
              <div className="salary-feature-card__title">{card.title}</div>
              <div className="salary-feature-card__desc">{card.description}</div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Link href="/hrms/salary/bulk">
          <Button type="primary" style={{ background: "#374d95", borderColor: "#374d95" }}>
            Open bulk payroll sheet
          </Button>
        </Link>
        <Link href="/hrms/salary/monthly">
          <Button>Monthly salary (API)</Button>
        </Link>
        <Link href="/hrms/payroll">
          <Button>Payroll module</Button>
        </Link>
      </div>
    </div>
  );
}
