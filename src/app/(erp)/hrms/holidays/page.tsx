"use client";

import { Table, Button, Modal, Form, Input, Select, DatePicker, message, Tag } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

const TYPE_COLOR: Record<string, string> = { national: "red", regional: "blue", optional: "default" };

export default function HolidaysPage() {
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/hrms/holidays?year=${year}`);
      const json = await res.json();
      setHolidays(json.data || []);
    } catch { message.error("Failed to load holidays"); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [year]);

  const addHoliday = async (values: any) => {
    try {
      const res = await fetch("/api/hrms/holidays", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...values, date: values.date.format("YYYY-MM-DD") }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed");
      message.success("Holiday added");
      setOpen(false);
      form.resetFields();
      void load();
    } catch (e) { message.error(e instanceof Error ? e.message : "Failed"); }
  };

  const deleteHoliday = async (id: string) => {
    try {
      const res = await fetch(`/api/hrms/holidays/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed");
      message.success("Deleted");
      void load();
    } catch (e) { message.error(e instanceof Error ? e.message : "Failed"); }
  };

  const columns = [
    {
      title: "Date", dataIndex: "date", key: "date", width: 120,
      render: (v: string) => <strong>{dayjs(v).format("DD MMM YYYY")}</strong>,
      sorter: (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    { title: "Day", dataIndex: "date", key: "dow", width: 90, render: (v: string) => dayjs(v).format("ddd") },
    { title: "Holiday Name", dataIndex: "name", key: "name", render: (v: string) => <span style={{ fontWeight: 600 }}>{v}</span> },
    {
      title: "Type", dataIndex: "type", key: "type", width: 110,
      render: (v: string) => <Tag color={TYPE_COLOR[v] || "default"} style={{ borderRadius: 20, border: 0, textTransform: "capitalize" }}>{v}</Tag>,
    },
    { title: "Description", dataIndex: "description", key: "desc", ellipsis: true },
    {
      title: "", key: "actions", width: 60,
      render: (_: any, row: any) => (
        <Button size="small" danger icon={<DeleteOutlined />} onClick={() => deleteHoliday(row._id)} />
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#09090b", margin: 0 }}>Holiday Calendar</h1>
          <p style={{ color: "#71717a", fontSize: 13, margin: "6px 0 0" }}>Manage national, regional and optional holidays</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Select value={year} onChange={setYear} style={{ width: 100 }}>
            {[2024, 2025, 2026, 2027].map((y) => <Select.Option key={y} value={y}>{y}</Select.Option>)}
          </Select>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>Add Holiday</Button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {[
          { label: "National", color: "#e11d48", bg: "#ffe4e6", count: holidays.filter((h) => h.type === "national").length },
          { label: "Regional", color: "#2563eb", bg: "#dbeafe", count: holidays.filter((h) => h.type === "regional").length },
          { label: "Optional", color: "#71717a", bg: "#f4f4f5", count: holidays.filter((h) => h.type === "optional").length },
        ].map((c) => (
          <div key={c.label} style={{ background: "#fff", border: "1px solid #e4e4e7", borderLeft: `4px solid ${c.color}`, borderRadius: 10, padding: "12px 16px" }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#a1a1aa", margin: "0 0 4px" }}>{c.label}</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: c.color, margin: 0 }}>{c.count}</p>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: 12, overflow: "hidden" }}>
        <Table
          loading={loading}
          dataSource={holidays}
          columns={columns as any}
          rowKey="_id"
          size="middle"
          pagination={{ pageSize: 20, showTotal: (n) => `${n} holidays` }}
          locale={{ emptyText: <div style={{ padding: "32px 0", textAlign: "center", color: "#a1a1aa" }}>No holidays for {year}</div> }}
        />
      </div>

      <Modal title="Add Holiday" open={open} onCancel={() => { setOpen(false); form.resetFields(); }} footer={null} width={420}>
        <Form form={form} layout="vertical" onFinish={addHoliday} style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Holiday Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Republic Day" />
          </Form.Item>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Form.Item name="date" label="Date" rules={[{ required: true }]}>
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="type" label="Type" initialValue="national">
              <Select>
                <Select.Option value="national">National</Select.Option>
                <Select.Option value="regional">Regional</Select.Option>
                <Select.Option value="optional">Optional</Select.Option>
              </Select>
            </Form.Item>
          </div>
          <Form.Item name="description" label="Description">
            <Input />
          </Form.Item>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">Add</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
