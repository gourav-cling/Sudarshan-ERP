"use client";

import { Table, Button, Tag, message, Tooltip, DatePicker } from "antd";
import { DownloadOutlined, ThunderboltOutlined, CheckOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

const STATUS_COLOR: Record<string, string> = { draft: "orange", approved: "green", disbursed: "blue" };
const fmt = (n: number) => `₹${(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;

export default function SalaryPage() {
  const [sheets, setSheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [approving, setApproving] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  const [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf("month"),
    dayjs().endOf("month"),
  ]);

  // Derive a display label for the current range
  const cycleLabel = range[0].format("MMM YYYY") === range[1].format("MMM YYYY")
    ? range[0].format("MMMM YYYY")
    : `${range[0].format("DD MMM")} – ${range[1].format("DD MMM YYYY")}`;

  // Cycle key to query stored sheets (YYYY-MM of start date)
  const cycleKey = range[0].format("YYYY-MM");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/hrms/salary?cycle=${cycleKey}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed");
      setSheets(json.data || []);
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [cycleKey]);

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/hrms/salary/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          from: range[0].format("YYYY-MM-DD"),
          to:   range[1].format("YYYY-MM-DD"),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed");
      message.success(
        `Generated ${json.data.generated} sheets for ${cycleLabel} (${json.data.workingDays} working days)`
      );
      void load();
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Generate failed");
    } finally {
      setGenerating(false);
    }
  };

  const bulkApprove = async () => {
    setApproving(true);
    try {
      const body = selectedRowKeys.length > 0
        ? { ids: selectedRowKeys }
        : { cycle: cycleKey };

      const res = await fetch("/api/hrms/salary/bulk-approve", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed");
      message.success(`Approved ${json.data.approved} salary sheets`);
      setSelectedRowKeys([]);
      void load();
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Approve failed");
    } finally {
      setApproving(false);
    }
  };

  const summary = {
    total: sheets.length,
    approved: sheets.filter((s) => s.status === "approved").length,
    totalNet: sheets.reduce((a, s) => a + (s.netPayable || 0), 0),
    totalGross: sheets.reduce((a, s) => a + (s.grossSalary || 0), 0),
  };

  const columns = [
    {
      title: "Emp ID", dataIndex: "employeeId", key: "eid", width: 100,
      render: (v: string) => <span style={{ fontFamily: "monospace", fontWeight: 600, fontSize: 12 }}>{v}</span>,
    },
    {
      title: "Name", dataIndex: "employeeName", key: "name",
      render: (v: string) => <span style={{ fontWeight: 600 }}>{v}</span>,
    },
    { title: "Dept", dataIndex: "department", key: "dept", width: 120 },
    {
      title: "Gross Salary", dataIndex: "grossSalary", key: "gross", width: 130,
      render: (v: number) => <span style={{ color: "#059669", fontWeight: 700 }}>{fmt(v)}</span>,
    },
    {
      title: "Attendance", key: "att", width: 110,
      render: (_: any, r: any) => (
        <Tooltip title={`Present: ${r.daysPresent} | Paid Leave: ${r.leaveDays || 0} | Absent: ${Math.max(0, (r.workingDays || 0) - (r.daysPresent || 0) - (r.leaveDays || 0))} | Unpaid: ${r.unpaidLeaveDays || 0}`}>
          <span style={{ cursor: "help" }}>
            <span style={{ color: "#059669", fontWeight: 700 }}>{r.daysPresent}</span>
            <span style={{ color: "#a1a1aa" }}> / {r.workingDays}</span>
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Leave Deduction", key: "leaveded", width: 140,
      render: (_: any, r: any) => {
        const absentDays = Math.max(0, (r.workingDays || 0) - (r.daysPresent || 0) - (r.leaveDays || 0));
        const totalDeductDays = absentDays + (r.unpaidLeaveDays || 0);
        return (
          <Tooltip title={`Absent days: ${absentDays} | Unpaid leave: ${r.unpaidLeaveDays || 0} | Total deduct days: ${totalDeductDays}`}>
            <span style={{ color: r.leaveDeduction > 0 ? "#e11d48" : "#a1a1aa", fontWeight: 600, cursor: "help" }}>
              {r.leaveDeduction > 0 ? `– ${fmt(r.leaveDeduction)}` : "—"}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: "PF + ESI", key: "pf", width: 110,
      render: (_: any, r: any) => (
        <Tooltip title={`PF (Employee): ${fmt(r.pfEmployee)} | PF (Employer): ${fmt(r.pfEmployer)} | ESI: ${fmt(r.esi)} | TDS: ${fmt(r.tds)}`}>
          <span style={{ color: "#d97706", fontWeight: 600, cursor: "help" }}>
            – {fmt((r.pfEmployee || 0) + (r.esi || 0))}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Overtime", dataIndex: "overtimeAmount", key: "ot", width: 100,
      render: (v: number, r: any) => v > 0
        ? <Tooltip title={`${r.overtimeHours}h OT`}><span style={{ color: "#2563eb", fontWeight: 600, cursor: "help" }}>+ {fmt(v)}</span></Tooltip>
        : <span style={{ color: "#a1a1aa" }}>—</span>,
    },
    {
      title: "Net Payable", dataIndex: "netPayable", key: "net", width: 130,
      render: (v: number) => <span style={{ fontWeight: 800, fontSize: 14, color: "#09090b" }}>{fmt(v)}</span>,
    },
    {
      title: "Status", dataIndex: "status", key: "status", width: 100,
      render: (v: string) => (
        <Tag color={STATUS_COLOR[v] || "default"} style={{ borderRadius: 20, border: 0, fontWeight: 600, textTransform: "capitalize" }}>{v}</Tag>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#09090b", margin: 0, lineHeight: 1 }}>Monthly Salary</h1>
          <p style={{ color: "#71717a", fontSize: 13, margin: "6px 0 0" }}>
            CTC breakdown · leave & absent deductions · overtime · net payable
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <DatePicker.RangePicker
            value={range}
            onChange={(v) => { if (v && v[0] && v[1]) setRange([v[0], v[1]]); }}
            allowClear={false}
            format="DD MMM YYYY"
          />
          <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>Refresh</Button>
          <Button
            icon={<ThunderboltOutlined />}
            onClick={generate}
            loading={generating}
            style={{ background: "#7c3aed", borderColor: "#7c3aed", color: "#fff" }}
          >
            Generate
          </Button>
          <Button
            icon={<CheckOutlined />}
            onClick={bulkApprove}
            loading={approving}
            type="primary"
            style={{ background: "#059669", borderColor: "#059669" }}
          >
            {selectedRowKeys.length > 0 ? `Approve (${selectedRowKeys.length})` : "Approve All"}
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={() => window.open(`/api/hrms/salary/export.csv?cycle=${cycleKey}`, "_blank")}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { label: "Total Employees", value: summary.total, color: "#2563eb" },
          { label: "Approved", value: summary.approved, color: "#059669" },
          { label: "Total Gross", value: fmt(summary.totalGross), color: "#d97706" },
          { label: "Total Net Payable", value: fmt(summary.totalNet), color: "#7c3aed" },
        ].map((c) => (
          <div key={c.label} style={{ background: "#fff", border: "1px solid #e4e4e7", borderLeft: `4px solid ${c.color}`, borderRadius: 10, padding: "12px 16px" }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#a1a1aa", margin: "0 0 4px" }}>{c.label}</p>
            <p style={{ fontSize: typeof c.value === "string" && c.value.startsWith("₹") ? 18 : 28, fontWeight: 800, color: c.color, margin: 0, lineHeight: 1 }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #f4f4f5", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontWeight: 700, color: "#09090b", margin: 0 }}>
              Salary Sheets — {cycleLabel}
            </p>
            <p style={{ color: "#a1a1aa", fontSize: 12, margin: "2px 0 0" }}>{sheets.length} records · Hover on a cell for breakdown</p>
          </div>
        </div>
        <Table
          loading={loading}
          dataSource={sheets}
          columns={columns as any}
          rowKey="_id"
          size="middle"
          rowSelection={{ selectedRowKeys, onChange: (keys) => setSelectedRowKeys(keys as string[]) }}
          pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (n) => `${n} employees` }}
          scroll={{ x: 1100 }}
          locale={{
            emptyText: (
              <div style={{ padding: "48px 0", textAlign: "center" }}>
                <p style={{ color: "#71717a", fontWeight: 600, margin: 0 }}>No salary sheets for this period</p>
                <p style={{ color: "#a1a1aa", fontSize: 12, marginTop: 4 }}>Select a date range and click Generate</p>
              </div>
            ),
          }}
        />
      </div>
    </div>
  );
}
