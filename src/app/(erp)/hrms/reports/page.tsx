"use client";

import { Button, DatePicker, Select, Table, Tag, Tabs, message } from "antd";
import {
  DownloadOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useEffect, useState, useMemo } from "react";
import EmployeeSelect from "@/components/erp/EmployeeSelect";

type SummaryRow = {
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  primaryShift: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  totalWorkedHours: number;
  totalShortfall: number;
  totalOvertime: number;
};

type DailyRow = {
  employeeId: string;
  employeeName: string;
  department: string;
  day: string;
  inAt: string | null;
  outAt: string | null;
  present: boolean;
  absent: boolean;
  late: boolean;
  workedHours: number;
  shortfall: number;
  overtime: number;
};

type KPI = {
  totalEmployees: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  totalShortfall: number;
  totalOvertime: number;
};

function fmtTime(iso: string | null) {
  if (!iso) return "—";
  return dayjs(iso).format("HH:mm");
}

export default function HrReportsPage() {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);
  const [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf("month"),
    dayjs().endOf("month"),
  ]);
  const [dept, setDept] = useState<string>("");
  const [shift, setShift] = useState<string>("");
  const [empId, setEmpId] = useState<string>("");
  const [kpi, setKpi] = useState<KPI | null>(null);
  const [summary, setSummary] = useState<SummaryRow[]>([]);
  const [daily, setDaily] = useState<DailyRow[]>([]);

  useEffect(() => {
    fetch("/api/hrms/departments")
      .then((r) => r.json())
      .then((j) => setDepartments(j?.data || []));
  }, []);

  const buildUrl = () => {
    const params = new URLSearchParams({
      from: range[0].format("YYYY-MM-DD"),
      to: range[1].format("YYYY-MM-DD"),
    });
    if (dept)  params.set("department", dept);
    if (shift) params.set("shift", shift);
    if (empId) params.set("employeeId", empId);
    return params;
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/hrms/attendance/report/extended?${buildUrl()}`);
      const json = await res.json();
      if (!res.ok || json?.error) throw new Error(json?.error || "Failed");
      setKpi(json.data.kpi);
      setSummary(json.data.summary);
      setDaily(json.data.daily);
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const summaryColumns = [
    { title: "Emp ID", dataIndex: "employeeId", key: "eid", width: 100, render: (v: string) => <span style={{ fontFamily: "monospace", fontWeight: 600, fontSize: 12 }}>{v}</span> },
    { title: "Name", dataIndex: "employeeName", key: "name", render: (v: string) => <span style={{ fontWeight: 600 }}>{v}</span> },
    { title: "Dept", dataIndex: "department", key: "dept", width: 130 },
    { title: "Shift", dataIndex: "primaryShift", key: "shift", width: 180, render: (v: string) => <span style={{ fontSize: 11, color: "#71717a" }}>{v || "—"}</span> },
    { title: "Present", dataIndex: "presentDays", key: "present", width: 80, render: (v: number) => <span style={{ color: "#059669", fontWeight: 700 }}>{v}</span> },
    { title: "Absent", dataIndex: "absentDays", key: "absent", width: 80, render: (v: number) => <span style={{ color: v > 0 ? "#e11d48" : "#a1a1aa", fontWeight: 700 }}>{v}</span> },
    { title: "Late", dataIndex: "lateDays", key: "late", width: 70, render: (v: number) => <span style={{ color: v > 0 ? "#d97706" : "#a1a1aa", fontWeight: 700 }}>{v}</span> },
    { title: "Worked (h)", dataIndex: "totalWorkedHours", key: "worked", width: 90, render: (v: number) => v.toFixed(2) },
    { title: "Shortfall (h)", dataIndex: "totalShortfall", key: "shortfall", width: 100, render: (v: number) => <span style={{ color: v > 0 ? "#d97706" : "#a1a1aa" }}>{v.toFixed(2)}</span> },
    { title: "OT (h)", dataIndex: "totalOvertime", key: "ot", width: 80, render: (v: number) => <span style={{ color: v > 0 ? "#2563eb" : "#a1a1aa" }}>{v.toFixed(2)}</span> },
  ];

  const dailyColumns = [
    { title: "Date", dataIndex: "day", key: "day", width: 110 },
    { title: "Emp ID", dataIndex: "employeeId", key: "eid", width: 100, render: (v: string) => <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 600 }}>{v}</span> },
    { title: "Name", dataIndex: "employeeName", key: "name", render: (v: string) => <span style={{ fontWeight: 600 }}>{v}</span> },
    { title: "Dept", dataIndex: "department", key: "dept", width: 120 },
    { title: "In", dataIndex: "inAt", key: "in", width: 80, render: (v: string | null) => <span style={{ color: "#059669", fontWeight: 600 }}>{fmtTime(v)}</span> },
    { title: "Out", dataIndex: "outAt", key: "out", width: 80, render: (v: string | null) => <span style={{ color: "#e11d48", fontWeight: 600 }}>{fmtTime(v)}</span> },
    { title: "Worked (h)", dataIndex: "workedHours", key: "worked", width: 90, render: (v: number) => v.toFixed(2) },
    {
      title: "Status", key: "status", width: 160,
      render: (_: any, row: DailyRow) => (
        <div style={{ display: "flex", gap: 4 }}>
          {row.absent  && <Tag color="red"    style={{ borderRadius: 20, border: 0, fontSize: 11 }}>Absent</Tag>}
          {row.present && <Tag color="green"  style={{ borderRadius: 20, border: 0, fontSize: 11 }}>Present</Tag>}
          {row.late    && <Tag color="orange" style={{ borderRadius: 20, border: 0, fontSize: 11 }}>Late</Tag>}
        </div>
      ),
    },
    { title: "Shortfall", dataIndex: "shortfall", key: "sf", width: 90, render: (v: number) => <span style={{ color: v > 0 ? "#d97706" : "#a1a1aa" }}>{v.toFixed(2)}h</span> },
    { title: "OT", dataIndex: "overtime", key: "ot", width: 70, render: (v: number) => <span style={{ color: v > 0 ? "#2563eb" : "#a1a1aa" }}>{v.toFixed(2)}h</span> },
  ];

  const statCards = kpi
    ? [
        { label: "Total Employees", value: kpi.totalEmployees, color: "#2563eb", bg: "#dbeafe" },
        { label: "Present Days", value: kpi.presentDays, color: "#059669", bg: "#d1fae5" },
        { label: "Absent Days", value: kpi.absentDays, color: "#e11d48", bg: "#ffe4e6" },
        { label: "Late Days", value: kpi.lateDays, color: "#d97706", bg: "#fef3c7" },
        { label: "Shortfall (h)", value: kpi.totalShortfall.toFixed(2), color: "#7c3aed", bg: "#ede9fe" },
        { label: "Overtime (h)", value: kpi.totalOvertime.toFixed(2), color: "#0891b2", bg: "#cffafe" },
      ]
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#09090b", margin: 0, lineHeight: 1 }}>Attendance Reports</h1>
          <p style={{ color: "#71717a", fontSize: 13, margin: "6px 0 0" }}>Present / Absent / Late / Shortfall / Overtime</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <DatePicker.RangePicker
            value={range}
            onChange={(v) => { if (v && v[0] && v[1]) setRange([v[0], v[1]]); }}
            allowClear={false}
          />
          <Select
            placeholder="Department"
            allowClear
            style={{ width: 160 }}
            value={dept || undefined}
            onChange={(v) => setDept(v || "")}
          >
            {departments.map((d) => <Select.Option key={d} value={d}>{d}</Select.Option>)}
          </Select>
          <Select
            placeholder="Shift"
            allowClear
            style={{ width: 130 }}
            value={shift || undefined}
            onChange={(v) => setShift(v || "")}
          >
            {["Shift A", "Shift B", "Shift C"].map((s) => <Select.Option key={s} value={s}>{s}</Select.Option>)}
          </Select>
          <div style={{ width: 200 }}>
            <EmployeeSelect
              value={empId || undefined}
              onChange={(v) => setEmpId(v || "")}
              placeholder="Filter by employee"
              allowClear
            />
          </div>
          <Button icon={<ReloadOutlined />} type="primary" loading={loading} onClick={load}>
            Run Report
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={() => {
              const p = buildUrl();
              window.open(`/api/hrms/attendance/report.csv?${p}`, "_blank");
            }}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI row */}
      {kpi && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10 }}>
          {statCards.map((c) => (
            <div key={c.label} style={{ background: "#fff", border: "1px solid #e4e4e7", borderTop: `3px solid ${c.color}`, borderRadius: 10, padding: "12px 14px" }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#a1a1aa", margin: "0 0 4px" }}>{c.label}</p>
              <p style={{ fontSize: 26, fontWeight: 800, color: c.color, margin: 0, lineHeight: 1 }}>{c.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: 12, overflow: "hidden" }}>
        <Tabs
          defaultActiveKey="summary"
          style={{ padding: "0 20px" }}
          items={[
            {
              key: "summary",
              label: `Summary (${summary.length})`,
              children: (
                <div style={{ padding: "0 0 16px" }}>
                  <Table
                    loading={loading}
                    dataSource={summary}
                    columns={summaryColumns as any}
                    rowKey="employeeId"
                    size="small"
                    scroll={{ x: 900 }}
                    pagination={{ pageSize: 15, showSizeChanger: true, showTotal: (t) => `${t} employees` }}
                  />
                </div>
              ),
            },
            {
              key: "daily",
              label: `Daily Detail (${daily.length})`,
              children: (
                <div style={{ padding: "0 0 16px" }}>
                  <Table
                    loading={loading}
                    dataSource={daily}
                    columns={dailyColumns as any}
                    rowKey={(r: DailyRow) => `${r.employeeId}|${r.day}`}
                    size="small"
                    scroll={{ x: 1000 }}
                    pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (t) => `${t} records` }}
                  />
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
