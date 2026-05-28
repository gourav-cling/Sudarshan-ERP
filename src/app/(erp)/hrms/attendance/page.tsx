"use client";

import { Table, Badge, Button, DatePicker, message, Tag } from "antd";
import {
  ClockCircleOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  DownloadOutlined,
  ReloadOutlined,
  UserOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";

export default function AttendancePage() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [statsRows, setStatsRows] = useState<any[]>([]);
  const [punching, setPunching] = useState<"in" | "out" | null>(null);
  const [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>(() => [
    dayjs().startOf("month"),
    dayjs().endOf("month"),
  ]);

  const loadStats = async () => {
    try {
      const res = await fetch("/api/hrms/attendance/today", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || json?.error) throw new Error(json?.error || "Failed to load");
      setStatsRows(json.data.rows || []);
    } catch {
      /* stats are non-blocking */
    }
  };

  const loadLog = async () => {
    setLoading(true);
    try {
      const from = range[0].format("YYYY-MM-DD");
      const to   = range[1].format("YYYY-MM-DD");
      const res = await fetch(`/api/hrms/attendance/log?from=${from}&to=${to}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || json?.error) throw new Error(json?.error || "Failed to load");
      setRows(json.data.rows || []);
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  const refreshAll = async () => {
    await Promise.all([loadStats(), loadLog()]);
  };

  useEffect(() => { void loadStats(); }, []);

  useEffect(() => { void loadLog(); }, [range[0].format("YYYY-MM-DD"), range[1].format("YYYY-MM-DD")]);

  const getLocation = () =>
    new Promise<{ lat: number; lng: number; accuracy?: number }>((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error("GPS not supported in this browser"));
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
        (err) => reject(new Error(err.message || "Failed to get location")),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });

  const punch = async (type: "in" | "out") => {
    setPunching(type);
    try {
      message.loading({ content: "Getting your location…", key: "punch", duration: 0 });
      const coords = await getLocation();

      message.loading({ content: "Saving punch…", key: "punch", duration: 0 });
      const endpoint = type === "in" ? "/api/hrms/attendance/punch-in" : "/api/hrms/attendance/punch-out";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ location: coords }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.error) throw new Error(json?.error || "Punch failed");

      const loc = json?.data?.punch?.location;
      const addr = loc?.city && loc?.state
        ? `${loc.city}, ${loc.state}`
        : loc?.address?.split(",").slice(-3, -1).join(", ").trim() || "";

      const label = type === "in" ? "Punched In" : "Punched Out";
      message.success({
        content: addr ? `${label} · ${addr}` : label,
        key: "punch",
        duration: 5,
      });
      await refreshAll();
    } catch (e) {
      message.error({ content: e instanceof Error ? e.message : "Punch failed", key: "punch" });
    } finally {
      setPunching(null);
    }
  };

  const stats = useMemo(() => {
    const present = statsRows.filter((r) => r.inTime).length;
    const inNow = statsRows.filter((r) => r.status === "In").length;
    const out = statsRows.filter((r) => r.status === "Out").length;
    const totalWorked = statsRows.reduce(
      (sum, r) => sum + (typeof r.workedHours === "number" ? r.workedHours : 0), 0
    );
    return { present, inNow, out, totalWorked: Math.round(totalWorked * 100) / 100 };
  }, [statsRows]);

  const AddressCell = ({ short, full, lat, lng }: { short: string; full: string; lat?: number | null; lng?: number | null }) => {
    if (!short && !full) return <span style={{ color: "#a1a1aa", fontSize: 12 }}>—</span>;
    const href = (typeof lat === "number" && typeof lng === "number") ? `https://www.google.com/maps?q=${lat},${lng}` : null;
    const content = (
      <span title={full || short} style={{ display: "flex", alignItems: "flex-start", gap: 4, cursor: full ? "help" : "default", fontSize: 12, color: href ? "#2563eb" : "#3f3f46" }}>
        <EnvironmentOutlined style={{ color: "#e11d48", fontSize: 11, marginTop: 2, flexShrink: 0 }} />
        <span style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{full || short}</span>
      </span>
    );
    return href
      ? <a href={href} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>{content}</a>
      : content;
  };

  const columns = [
    {
      title: "Emp ID", dataIndex: "id", key: "id", width: 100,
      render: (text: string) => (
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <UserOutlined style={{ color: "#a1a1aa", fontSize: 11 }} />
          <span style={{ fontFamily: "monospace", fontWeight: 600, fontSize: 12, color: "#3f3f46" }}>{text}</span>
        </span>
      ),
    },
    {
      title: "Name", dataIndex: "name", key: "name",
      render: (text: string) => <span style={{ fontWeight: 600, color: "#18181b" }}>{text}</span>,
    },
    {
      title: "Date", dataIndex: "date", key: "date", width: 115,
      render: (v: string) => <span style={{ fontWeight: 600, color: "#3f3f46", fontSize: 12 }}>{v}</span>,
    },
    {
      title: "Punch In", key: "in", width: 130,
      render: (_: any, r: any) => r.inTime
        ? <span style={{ color: "#059669", fontWeight: 700, fontSize: 12 }}>{r.inTime}</span>
        : <span style={{ color: "#a1a1aa" }}>—</span>,
    },
    {
      title: "In Location", key: "inLoc",
      render: (_: any, r: any) => <AddressCell short={r.inAddress} full={r.inFullAddress} lat={r.inLat} lng={r.inLng} />,
    },
    {
      title: "Punch Out", key: "out", width: 130,
      render: (_: any, r: any) => r.outTime
        ? <span style={{ color: "#e11d48", fontWeight: 700, fontSize: 12 }}>{r.outTime}</span>
        : <span style={{ color: "#a1a1aa" }}>—</span>,
    },
    {
      title: "Out Location", key: "outLoc",
      render: (_: any, r: any) => <AddressCell short={r.outAddress} full={r.outFullAddress} lat={r.outLat} lng={r.outLng} />,
    },
    {
      title: "Worked", dataIndex: "workedHours", key: "workedHours", width: 80,
      render: (v: number) => <span style={{ fontWeight: 700, color: v > 0 ? "#18181b" : "#a1a1aa" }}>{v ? `${v.toFixed(2)}h` : "—"}</span>,
    },
    {
      title: "Status", dataIndex: "status", key: "status", width: 90,
      render: (status: string) =>
        status === "In"
          ? <Tag color="blue"  style={{ borderRadius: 20, fontWeight: 600, border: 0 }}>● In</Tag>
          : status === "Out"
          ? <Tag color="green" style={{ borderRadius: 20, fontWeight: 600, border: 0 }}>✓ Out</Tag>
          : <Tag color="default" style={{ borderRadius: 20, fontWeight: 600 }}>{status}</Tag>,
    },
    {
      title: "Method", dataIndex: "method", key: "method", width: 90,
      render: (v: string) => <span style={{ fontSize: 12, color: "#71717a" }}>{v}</span>,
    },
  ];

  const expandedRowRender = (record: any) => {
    const log: { type: string; time: string; dateTime?: string; address: string; fullAddress: string }[] = record.punchLog || [];
    if (log.length === 0) return <p style={{ color: "#a1a1aa", margin: "8px 0" }}>No punch log available.</p>;

    return (
      <div style={{ padding: "8px 16px 12px" }}>
        <p style={{ fontWeight: 700, fontSize: 12, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 10px" }}>
          Punch Log — {log.length} event{log.length !== 1 ? "s" : ""}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, position: "relative" }}>
          {/* Vertical timeline line */}
          <div style={{ position: "absolute", left: 10, top: 10, bottom: 10, width: 2, background: "#e4e4e7", zIndex: 0 }} />
          {log.map((entry, i) => {
            const isIn = entry.type === "in";
            const dotColor = isIn ? "#059669" : "#e11d48";
            return (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, position: "relative", zIndex: 1 }}>
                {/* Dot */}
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: dotColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 0 0 3px ${isIn ? "#d1fae5" : "#ffe4e6"}` }}>
                  <EnvironmentOutlined style={{ color: "#fff", fontSize: 10 }} />
                </div>
                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontWeight: 700, fontSize: 12, color: dotColor, textTransform: "uppercase" }}>
                      {isIn ? "Punch In" : "Punch Out"}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: 13, color: "#09090b" }}>{entry.dateTime || entry.time}</span>
                  </div>
                  {(entry.address || entry.fullAddress)
                    ? <p title={entry.fullAddress} style={{ margin: "2px 0 0", fontSize: 12, color: "#71717a", cursor: entry.fullAddress ? "help" : "default" }}>
                        📍 {entry.address || entry.fullAddress.split(",").slice(-3).join(",").trim()}
                      </p>
                    : <p style={{ margin: "2px 0 0", fontSize: 12, color: "#a1a1aa" }}>Location not available</p>
                  }
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#09090b", margin: 0, lineHeight: 1 }}>
            Attendance
          </h1>
          <p style={{ color: "#71717a", fontSize: 13, margin: "6px 0 0", lineHeight: 1 }}>
            {dayjs().format("dddd, D MMMM YYYY")} &nbsp;·&nbsp; GPS punch-in/out
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Button icon={<ReloadOutlined />} onClick={refreshAll} loading={loading}>
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<EnvironmentOutlined />}
            loading={punching === "in"}
            onClick={() => punch("in")}
            style={{ background: "#059669", borderColor: "#059669" }}
          >
            Punch In
          </Button>
          <Button
            danger
            icon={<EnvironmentOutlined />}
            loading={punching === "out"}
            onClick={() => punch("out")}
          >
            Punch Out
          </Button>
        </div>
      </div>

      {/* Stat cards — 4 in one row using inline flex so Tailwind purge cannot break it */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>

        {/* Card 1 — Present */}
        <div style={{ background: "#fff", border: "1px solid #e4e4e7", borderLeft: "4px solid #059669", borderRadius: 12, padding: "16px 18px", cursor: "default" }}>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#a1a1aa", margin: "0 0 6px" }}>
            Present Today
          </p>
          <p style={{ fontSize: 32, fontWeight: 800, color: "#059669", margin: "0 0 4px", lineHeight: 1 }}>
            {stats.present}
          </p>
          <p style={{ fontSize: 11, color: "#a1a1aa", margin: 0 }}>employees with punch</p>
          <div style={{ marginTop: 10, width: 36, height: 36, borderRadius: 10, background: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#059669" }}>
            <CheckCircleOutlined />
          </div>
        </div>

        {/* Card 2 — Currently In */}
        <div style={{ background: "#fff", border: "1px solid #e4e4e7", borderLeft: "4px solid #2563eb", borderRadius: 12, padding: "16px 18px", cursor: "default" }}>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#a1a1aa", margin: "0 0 6px" }}>
            Currently In
          </p>
          <p style={{ fontSize: 32, fontWeight: 800, color: "#2563eb", margin: "0 0 4px", lineHeight: 1 }}>
            {stats.inNow}
          </p>
          <p style={{ fontSize: 11, color: "#a1a1aa", margin: 0 }}>punched in, not out</p>
          <div style={{ marginTop: 10, width: 36, height: 36, borderRadius: 10, background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#2563eb" }}>
            <ThunderboltOutlined />
          </div>
        </div>

        {/* Card 3 — Checked Out */}
        <div style={{ background: "#fff", border: "1px solid #e4e4e7", borderLeft: "4px solid #7c3aed", borderRadius: 12, padding: "16px 18px", cursor: "default" }}>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#a1a1aa", margin: "0 0 6px" }}>
            Checked Out
          </p>
          <p style={{ fontSize: 32, fontWeight: 800, color: "#7c3aed", margin: "0 0 4px", lineHeight: 1 }}>
            {stats.out}
          </p>
          <p style={{ fontSize: 11, color: "#a1a1aa", margin: 0 }}>completed shift</p>
          <div style={{ marginTop: 10, width: 36, height: 36, borderRadius: 10, background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#7c3aed" }}>
            <CalendarOutlined />
          </div>
        </div>

        {/* Card 4 — Worked Hours */}
        <div style={{ background: "#fff", border: "1px solid #e4e4e7", borderLeft: "4px solid #d97706", borderRadius: 12, padding: "16px 18px", cursor: "default" }}>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#a1a1aa", margin: "0 0 6px" }}>
            Worked Hours
          </p>
          <p style={{ fontSize: 32, fontWeight: 800, color: "#d97706", margin: "0 0 4px", lineHeight: 1 }}>
            {stats.totalWorked.toFixed(2)}
          </p>
          <p style={{ fontSize: 11, color: "#a1a1aa", margin: 0 }}>total today</p>
          <div style={{ marginTop: 10, width: 36, height: 36, borderRadius: 10, background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#d97706" }}>
            <ClockCircleOutlined />
          </div>
        </div>

      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #f4f4f5", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div>
            <p style={{ fontWeight: 700, color: "#09090b", margin: 0, fontSize: 14 }}>Attendance Log</p>
            <p style={{ color: "#a1a1aa", fontSize: 12, margin: "2px 0 0" }}>
              {range[0].format("DD MMM")} – {range[1].format("DD MMM YYYY")} · {rows.length} record{rows.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <DatePicker.RangePicker
              value={range}
              onChange={(v) => { if (v && v[0] && v[1]) setRange([v[0], v[1]]); }}
              allowClear={false}
              size="small"
            />
            <Button
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => {
                const from = range[0].format("YYYY-MM-DD");
                const to = range[1].format("YYYY-MM-DD");
                window.open(
                  `/api/hrms/attendance/report.csv?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
                  "_blank"
                );
              }}
            >
              Export CSV
            </Button>
          </div>
        </div>
        <Table
          loading={loading}
          dataSource={rows}
          columns={columns as any}
          rowKey="key"
          size="middle"
          scroll={{ x: 900 }}
          expandable={{
            expandedRowRender,
            rowExpandable: (r) => r.punchLog && r.punchLog.length > 0,
            expandRowByClick: true,
          }}
          onRow={(r) => ({
            style: r.punchLog?.length ? { cursor: "pointer" } : undefined,
          })}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `${t} records` }}
          locale={{
            emptyText: (
              <div style={{ padding: "48px 0", textAlign: "center" }}>
                <ClockCircleOutlined style={{ fontSize: 36, color: "#d4d4d8", display: "block", marginBottom: 10 }} />
                <p style={{ color: "#71717a", fontWeight: 600, margin: 0 }}>No punch records in this period</p>
                <p style={{ color: "#a1a1aa", fontSize: 12, marginTop: 4 }}>Use Punch In to record your first entry</p>
              </div>
            ),
          }}
        />
      </div>
    </div>
  );
}
