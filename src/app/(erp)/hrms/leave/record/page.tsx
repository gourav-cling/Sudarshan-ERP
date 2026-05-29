"use client";

import { useState } from "react";
import { Button, Select, Tag, Segmented } from "antd";
import {
  PlusOutlined,
  DownloadOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import Link from "next/link";

import PageHeader from "@/components/common/PageHeader";
import CommonTable, {
  type CommonTableColumn,
} from "@/components/common/CommonTable";
import ReportSection from "@/components/hrms/ReportSection";
import {
  getLeaveDummy,
  type LeaveHistoryRow,
  type LeaveLedgerRow,
} from "@/lib/leave-dummy";

const STATUS_COLOR = {
  Approved: "success",
  Pending: "processing",
  Cancelled: "error",
} as const;

export default function LeaveRecordPage() {
  const demo = getLeaveDummy();
  const [company, setCompany] = useState("smi");
  const [employee, setEmployee] = useState("EMP-2048");
  const [year, setYear] = useState("2025");
  const [typeFilter, setTypeFilter] = useState("All");

  const filteredHistory =
    typeFilter === "All"
      ? demo.history
      : demo.history.filter((h) => h.type === typeFilter);

  const tableProps = {
    bordered: true as const,
    size: "middle" as const,
    className: "attendance-report-table",
  };

  const historyColumns: CommonTableColumn<LeaveHistoryRow>[] = [
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (t: string, r) => <Tag color={r.typeColor}>{t}</Tag>,
    },
    {
      title: "From",
      dataIndex: "from",
      key: "from",
    },
    {
      title: "To",
      dataIndex: "to",
      key: "to",
    },
    { title: "Days", dataIndex: "days", key: "days" },
    { title: "Reason", dataIndex: "reason", key: "reason" },
    { title: "Approver", dataIndex: "approver", key: "approver" },
    { title: "Applied on", dataIndex: "appliedOn", key: "applied" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s: LeaveHistoryRow["status"]) => (
        <Tag color={STATUS_COLOR[s]}>{s}</Tag>
      ),
    },
  ];

  const ledgerColumns: CommonTableColumn<LeaveLedgerRow>[] = [
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (t: string, r) => <Tag color={r.typeColor}>{t}</Tag>,
    },
    { title: "Opening (1-Apr-24)", dataIndex: "opening", key: "open" },
    { title: "Earned / allotted", dataIndex: "earned", key: "earned" },
    { title: "Used", dataIndex: "used", key: "used" },
    { title: "Encashed", dataIndex: "encashed", key: "enc" },
    { title: "Lapsed", dataIndex: "lapsed", key: "lap" },
    { title: "Carry-fwd", dataIndex: "carryFwd", key: "cf" },
    {
      title: "Closing",
      dataIndex: "closing",
      key: "close",
      render: (v) => <span className="font-bold">{v}</span>,
    },
  ];

  const { employee: emp } = demo;

  return (
    <div className="attendance-reports-page">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-[13px] text-amber-900">
        Sample leave record data for preview.
      </div>

      <PageHeader
        title="Leave record"
        subtitle="Employee leave balance, history and year-on-year ledger"
        actions={
          <>
            <Link href="/hrms/leave/apply">
              <Button type="primary" icon={<PlusOutlined />}>
                Apply leave
              </Button>
            </Link>
            <Button icon={<DownloadOutlined />}>Export</Button>
          </>
        }
      />

      <ReportSection title="Filters">
        <div className="attendance-filters-grid">
          <div>
            <span className="text-[11px] font-bold uppercase text-zinc-500 block mb-2">
              Company / unit
            </span>
            <Select
              className="w-full"
              value={company}
              onChange={setCompany}
              options={demo.companies}
            />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-zinc-500 block mb-2">
              Employee
            </span>
            <Select
              className="w-full"
              value={employee}
              onChange={setEmployee}
              options={demo.employees}
            />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-zinc-500 block mb-2">
              Leave year
            </span>
            <Select
              className="w-full"
              value={year}
              onChange={setYear}
              options={demo.leaveYears}
            />
          </div>
        </div>
      </ReportSection>

      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-zinc-900 m-0">
                {emp.name}
              </h2>
              <Tag color="green">{emp.badge}</Tag>
            </div>
            <p className="text-[13px] text-zinc-500 mt-1 mb-0">
              {emp.id} · {emp.department} · {emp.shift} · DOJ {emp.doj} ·
              Confirmed {emp.confirmed}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/hrms/leave/apply">
              <Button type="primary" icon={<PlusOutlined />}>
                Apply leave
              </Button>
            </Link>
            <Button icon={<DownloadOutlined />}>Export</Button>
          </div>
        </div>
      </div>

      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        }}
      >
        {demo.balances.map((b) => (
          <div
            key={b.code}
            className="rounded-xl border border-zinc-200 bg-white p-4"
          >
            <p className="text-[11px] font-bold uppercase text-zinc-500 m-0">
              {b.name}
            </p>
            <p
              className="text-3xl font-extrabold m-1"
              style={{ color: b.color }}
            >
              {b.balance}
            </p>
            <p className="text-[12px] text-zinc-500 m-0 mb-3">{b.detail}</p>
            <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${b.progress}%`,
                  background: b.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <ReportSection
        title="Leave history"
        meta={`FY ${year}`}
        flush
      >
        <div className="px-5 pt-4 pb-2 flex justify-end">
          <Segmented
            options={["All", "PL", "CL", "SL", "Comp.Off", "OD"]}
            value={typeFilter}
            onChange={setTypeFilter}
          />
        </div>
        <CommonTable
          {...tableProps}
          columns={historyColumns}
          dataSource={filteredHistory}
          rowKey="id"
          pagination={false}
        />
      </ReportSection>

      <ReportSection title="Year-on-year ledger" flush>
        <CommonTable
          {...tableProps}
          columns={ledgerColumns}
          dataSource={demo.ledger}
          rowKey="type"
          pagination={false}
        />
      </ReportSection>
    </div>
  );
}
