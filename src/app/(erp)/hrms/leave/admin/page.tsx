"use client";

import { useState } from "react";
import {
  Tabs,
  Table,
  Tag,
  Button,
  Switch,
  Input,
  Select,
  InputNumber,
} from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import PageHeader from "@/components/common/PageHeader";
import ReportSection from "@/components/hrms/ReportSection";
import { getLeaveDummy, leaveTypeColor } from "@/lib/leave-dummy";
import { LeavePolicyEditor } from "@/components/hrms/LeavePolicyEditor";
import { HolidaysEditor } from "@/components/hrms/HolidaysEditor";

export default function LeaveAdminPage() {
  const demo = getLeaveDummy();
  const [tab, setTab] = useState("types");

  const typeColumns = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      render: (c: string) => <Tag color={leaveTypeColor(c)}>{c}</Tag>,
    },
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Yearly",
      dataIndex: "yearly",
      key: "yearly",
      render: (v: string) => <Input size="small" defaultValue={v} style={{ width: 72 }} />,
    },
    {
      title: "Accrual",
      dataIndex: "accrual",
      key: "accrual",
      render: (v: string) => (
        <Select size="small" defaultValue={v} style={{ minWidth: 160 }} options={[{ value: v, label: v }]} />
      ),
    },
    {
      title: "Carry fwd (max)",
      dataIndex: "carryFwd",
      key: "cf",
      render: (v: string) => <Input size="small" defaultValue={v} style={{ width: 88 }} />,
    },
    {
      title: "Encashable",
      dataIndex: "encashable",
      key: "enc",
      render: (v: boolean) => <Switch size="small" defaultChecked={v} />,
    },
    {
      title: "Half-day",
      dataIndex: "halfDay",
      key: "hd",
      render: (v: boolean) => <Switch size="small" defaultChecked={v} />,
    },
    {
      title: "Doc reqd?",
      dataIndex: "docRequired",
      key: "doc",
      render: (v: boolean) => <Switch size="small" defaultChecked={v} />,
    },
    { title: "Applies to", dataIndex: "appliesTo", key: "app" },
    {
      title: "Active",
      dataIndex: "active",
      key: "active",
      render: (v: boolean) => <Switch size="small" defaultChecked={v} />,
    },
    {
      title: "",
      key: "act",
      render: () => <Button size="small">Edit</Button>,
    },
  ];

  const holidayColumns = [
    { title: "Date", dataIndex: "date", key: "date" },
    { title: "Holiday", dataIndex: "name", key: "name" },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (t: string) => (
        <Tag color={t === "public" ? "blue" : "orange"}>
          {t === "public" ? "Public" : "Optional"}
        </Tag>
      ),
    },
  ];

  return (
    <div className="attendance-reports-page">
      <PageHeader
        title="Leave admin"
        subtitle="Leave types, policy rules, holiday calendar and accrual settings"
      />

      <Tabs
        activeKey={tab}
        onChange={setTab}
        items={[
          {
            key: "types",
            label: "Leave types",
            children: (
              <ReportSection title="Leave types — master">
                <div className="flex justify-end mb-3">
                  <Button type="primary" icon={<PlusOutlined />}>
                    Add leave type
                  </Button>
                </div>
                <Table
                  dataSource={demo.leaveTypes}
                  columns={typeColumns as never}
                  rowKey="code"
                  pagination={false}
                  scroll={{ x: 1100 }}
                  className="attendance-report-table"
                  size="middle"
                />
              </ReportSection>
            ),
          },
          {
            key: "policy",
            label: "Policy & rules",
            children: (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <ReportSection title="Policy & rules">
                    <div className="grid gap-4 text-[13px]">
                      <div>
                        <div className="font-semibold text-zinc-900">Leave year (financial)</div>
                        <div className="text-zinc-500 text-[12px] mb-1">Balances reset / carry-over basis</div>
                        <Select defaultValue="apr-mar" style={{ width: "100%" }} options={[{ value: "apr-mar", label: "Apr–Mar" }]} />
                      </div>
                      <div className="flex justify-between gap-4">
                        <div>
                          <div className="font-semibold">Allow back-dated application</div>
                          <div className="text-zinc-500 text-[12px]">SL up to 7 days back</div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div>
                        <div className="font-semibold">Min advance notice (PL)</div>
                        <InputNumber min={0} defaultValue={3} className="w-full mt-1" />
                      </div>
                      <div>
                        <div className="font-semibold">Max consecutive days (PL)</div>
                        <InputNumber min={1} defaultValue={10} className="w-full mt-1" />
                      </div>
                      <div className="flex justify-between gap-4">
                        <div>
                          <div className="font-semibold">Auto-deduct LWP if no balance</div>
                          <div className="text-zinc-500 text-[12px]">When PL/CL/SL exhausted</div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </ReportSection>
                  <ReportSection title="Encashment & carry-forward">
                    <div className="grid gap-4 text-[13px]">
                      <div className="flex justify-between gap-4 items-start">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-zinc-900">PL encashment frequency</div>
                        </div>
                        <Select
                          defaultValue="ye-mar"
                          style={{ width: 220, flexShrink: 0 }}
                          options={[{ value: "ye-mar", label: "Year-end after Mar" }]}
                        />
                      </div>
                      <div className="flex justify-between gap-4 items-start">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-zinc-900">Min PL balance to keep</div>
                          <div className="text-zinc-500 text-[12px]">Minimum PL days employee must retain</div>
                        </div>
                        <InputNumber defaultValue={5} min={0} style={{ width: 120, flexShrink: 0 }} />
                      </div>
                      <div className="flex justify-between gap-4 items-start">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-zinc-900">Max encashment in a year</div>
                          <div className="text-zinc-500 text-[12px]">Maximum PL days encashable per year</div>
                        </div>
                        <InputNumber defaultValue={15} min={0} style={{ width: 120, flexShrink: 0 }} />
                      </div>
                      <div className="flex justify-between gap-4 items-start">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-zinc-900">Encashment basis</div>
                        </div>
                        <Select
                          defaultValue="basic"
                          style={{ width: 220, flexShrink: 0 }}
                          options={[{ value: "basic", label: "Basic" }]}
                        />
                      </div>
                      <div className="flex justify-between gap-4 items-start">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-zinc-900">Carry-forward cap (PL)</div>
                          <div className="text-zinc-500 text-[12px]">Max PL days carried to next year</div>
                        </div>
                        <InputNumber defaultValue={30} min={0} style={{ width: 120, flexShrink: 0 }} />
                      </div>
                      <div className="flex justify-between gap-4 items-center">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-zinc-900">Lapse CL/SL at year end?</div>
                          <div className="text-zinc-500 text-[12px]">Unused CL/SL forfeited 31-Mar</div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex justify-between gap-4 items-start">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-zinc-900">Comp.Off expiry (days)</div>
                          <div className="text-zinc-500 text-[12px]">Days within which Comp.Off must be availed</div>
                        </div>
                        <InputNumber defaultValue={90} min={1} style={{ width: 120, flexShrink: 0 }} />
                      </div>
                    </div>
                  </ReportSection>
                </div>
                <ReportSection title="Policy records (database)">
                  <LeavePolicyEditor />
                </ReportSection>
              </div>
            ),
          },
          {
            key: "holidays",
            label: "Holiday calendar",
            children: (
              <div className="flex flex-col gap-4">
                <ReportSection title="Holiday calendar 2025–26 (preview)">
                  <div className="flex justify-end gap-2 mb-3">
                    <Button icon={<UploadOutlined />}>Import</Button>
                    <Button type="primary" icon={<PlusOutlined />}>
                      Add holiday
                    </Button>
                  </div>
                  <Table
                    dataSource={demo.holidays}
                    columns={holidayColumns as never}
                    rowKey="date"
                    pagination={false}
                    className="attendance-report-table"
                    size="middle"
                  />
                </ReportSection>
                <ReportSection title="Holiday records (database)">
                  <HolidaysEditor />
                </ReportSection>
              </div>
            ),
          },
          {
            key: "workflow",
            label: "Approval workflow",
            children: (
              <ReportSection title="Approval workflow">
                <p className="text-[13px] text-zinc-600 mb-3 mt-0">
                  Configure approvers and SLA by leave type. HR can override on the{" "}
                  <a href="/hrms/leave/approval">Leave approval</a> screen.
                </p>
                <Table
                  dataSource={demo.approvalWorkflow}
                  rowKey="id"
                  pagination={false}
                  scroll={{ x: 1100 }}
                  className="attendance-report-table"
                  size="middle"
                  columns={[
                    {
                      title: "Leave type",
                      dataIndex: "leaveType",
                      key: "type",
                      render: (c: string) => <Tag color={leaveTypeColor(c)}>{c}</Tag>,
                    },
                    { title: "Days range", dataIndex: "daysRange", key: "range" },
                    { title: "L1 approver", dataIndex: "l1Approver", key: "l1" },
                    { title: "L2 approver", dataIndex: "l2Approver", key: "l2" },
                    { title: "L3 escalation", dataIndex: "l3Escalation", key: "l3" },
                    {
                      title: "SLA days",
                      dataIndex: "slaDays",
                      key: "sla",
                      width: 100,
                      render: (v: number) => <InputNumber size="small" min={1} defaultValue={v} style={{ width: 72 }} />,
                    },
                    {
                      title: "Auto-approve after SLA?",
                      dataIndex: "autoApproveAfterSla",
                      key: "auto",
                      width: 180,
                      render: (v: boolean) => <Switch size="small" defaultChecked={v} />,
                    },
                  ]}
                />
              </ReportSection>
            ),
          },
        ]}
      />
    </div>
  );
}
