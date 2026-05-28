"use client";

import { Table, Tag, Button, Select, Modal, Form, Input, DatePicker, InputNumber, message, Tabs, Popconfirm } from "antd";
import { PlusOutlined, CheckOutlined, CloseOutlined, RollbackOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import EmployeeSelect from "@/components/erp/EmployeeSelect";

const STATUS_COLOR: Record<string, string> = {
  pending: "orange", approved: "green",
  rejected: "red", cancelled: "default", rolled_back: "purple",
};
const STATUS_LABEL: Record<string, string> = {
  pending: "Pending", approved: "HR Approved",
  rejected: "Rejected", cancelled: "Cancelled", rolled_back: "Rolled Back",
};
const LEAVE_TYPE_LABEL: Record<string, string> = {
  casual: "Casual", sick: "Sick", earned: "Earned", unpaid: "Unpaid",
};

export default function LeavePage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [rollbackOpen, setRollbackOpen] = useState(false);
  const [rollbackId, setRollbackId] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [applyForm] = Form.useForm();
  const [rollbackForm] = Form.useForm();
  const [rejectForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState("all");

  const load = async (status?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status && status !== "all") params.set("status", status);
      const res = await fetch(`/api/hrms/leave?${params}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed");
      setLeaves(json.data || []);
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(activeTab); }, [activeTab]);

  const approve = async (id: string) => {
    try {
      const res = await fetch(`/api/hrms/leave/${id}/approve`, { method: "PATCH" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed");
      message.success("Approved");
      void load(activeTab);
    } catch (e) { message.error(e instanceof Error ? e.message : "Failed"); }
  };

  const handleReject = async (values: { reason: string }) => {
    if (!rejectId) return;
    try {
      const res = await fetch(`/api/hrms/leave/${rejectId}/reject`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reason: values.reason }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed");
      message.success("Rejected");
      setRejectOpen(false);
      rejectForm.resetFields();
      void load(activeTab);
    } catch (e) { message.error(e instanceof Error ? e.message : "Failed"); }
  };

  const handleRollback = async (values: { reason: string }) => {
    if (!rollbackId) return;
    try {
      const res = await fetch(`/api/hrms/leave/${rollbackId}/rollback`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reason: values.reason }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed");
      message.success("Rolled back");
      setRollbackOpen(false);
      rollbackForm.resetFields();
      void load(activeTab);
    } catch (e) { message.error(e instanceof Error ? e.message : "Failed"); }
  };

  const bulkAction = async (action: "approve" | "reject") => {
    if (selectedRowKeys.length === 0) { message.warning("Select at least one row"); return; }
    try {
      const res = await fetch("/api/hrms/leave/bulk-action", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ids: selectedRowKeys, action }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed");
      message.success(`${json.data.processed} records ${action}d`);
      setSelectedRowKeys([]);
      void load(activeTab);
    } catch (e) { message.error(e instanceof Error ? e.message : "Failed"); }
  };

  const applyLeave = async (values: any) => {
    try {
      const fromDate = values.fromDate.format("YYYY-MM-DD");
      const toDate   = values.toDate.format("YYYY-MM-DD");
      const days = values.toDate.diff(values.fromDate, "day") + 1;
      const res = await fetch("/api/hrms/leave", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...values, fromDate, toDate, days }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed");
      message.success("Leave applied successfully");
      setApplyOpen(false);
      applyForm.resetFields();
      void load(activeTab);
    } catch (e) { message.error(e instanceof Error ? e.message : "Failed"); }
  };

  const columns = [
    { title: "Emp ID", dataIndex: "employeeId", key: "eid", width: 100, render: (v: string) => <span style={{ fontFamily: "monospace", fontWeight: 600, fontSize: 12 }}>{v}</span> },
    { title: "Name", dataIndex: "employeeName", key: "name", render: (v: string) => <span style={{ fontWeight: 600 }}>{v}</span> },
    { title: "Dept", dataIndex: "department", key: "dept", width: 120 },
    { title: "Type", dataIndex: "leaveType", key: "type", width: 90, render: (v: string) => LEAVE_TYPE_LABEL[v] || v },
    { title: "From", dataIndex: "fromDate", key: "from", width: 100, render: (v: string) => dayjs(v).format("DD MMM YY") },
    { title: "To", dataIndex: "toDate", key: "to", width: 100, render: (v: string) => dayjs(v).format("DD MMM YY") },
    { title: "Days", dataIndex: "days", key: "days", width: 60 },
    { title: "Reason", dataIndex: "reason", key: "reason", ellipsis: true },
    {
      title: "Status", dataIndex: "status", key: "status", width: 130,
      render: (v: string) => <Tag color={STATUS_COLOR[v] || "default"} style={{ borderRadius: 20, border: 0, fontWeight: 600 }}>{STATUS_LABEL[v] || v}</Tag>,
    },
    {
      title: "Actions", key: "actions", width: 200,
      render: (_: any, row: any) => (
        <div style={{ display: "flex", gap: 6 }}>
          {row.status === "pending" && (
            <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => approve(row._id)} style={{ background: "#059669", borderColor: "#059669" }}>
              Approve
            </Button>
          )}
          {row.status === "pending" && (
            <Button size="small" danger icon={<CloseOutlined />} onClick={() => { setRejectId(row._id); setRejectOpen(true); }}>
              Reject
            </Button>
          )}
          {row.status === "approved" && (
            <Button size="small" icon={<RollbackOutlined />} onClick={() => { setRollbackId(row._id); setRollbackOpen(true); }}>
              Rollback
            </Button>
          )}
        </div>
      ),
    },
  ];

  const tabItems = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#09090b", margin: 0, lineHeight: 1 }}>Leave Management</h1>
          <p style={{ color: "#71717a", fontSize: 13, margin: "6px 0 0" }}>Apply, approve, reject and manage employee leaves</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {selectedRowKeys.length > 0 && (
            <>
              <Button icon={<CheckOutlined />} type="primary" onClick={() => bulkAction("approve")} style={{ background: "#059669", borderColor: "#059669" }}>
                Bulk Approve ({selectedRowKeys.length})
              </Button>
              <Button icon={<CloseOutlined />} danger onClick={() => bulkAction("reject")}>
                Bulk Reject
              </Button>
            </>
          )}
          <Button icon={<ReloadOutlined />} onClick={() => load(activeTab)} loading={loading}>Refresh</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setApplyOpen(true)}>Apply Leave</Button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: 12, overflow: "hidden" }}>
        <Tabs
          activeKey={activeTab}
          onChange={(k) => { setActiveTab(k); setSelectedRowKeys([]); }}
          style={{ padding: "0 20px" }}
          items={tabItems.map((t) => ({
            key: t.key,
            label: t.label,
            children: (
              <div style={{ paddingBottom: 16 }}>
                <Table
                  loading={loading}
                  dataSource={leaves}
                  columns={columns as any}
                  rowKey="_id"
                  size="middle"
                  rowSelection={{ selectedRowKeys, onChange: (keys) => setSelectedRowKeys(keys as string[]) }}
                  pagination={{ pageSize: 15, showSizeChanger: true, showTotal: (n) => `${n} records` }}
                  scroll={{ x: 1100 }}
                  locale={{ emptyText: <div style={{ padding: "32px 0", textAlign: "center", color: "#a1a1aa" }}>No leave requests</div> }}
                />
              </div>
            ),
          }))}
        />
      </div>

      {/* Apply Leave Modal */}
      <Modal title="Apply for Leave" open={applyOpen} onCancel={() => { setApplyOpen(false); applyForm.resetFields(); }} footer={null} width={480}>
        <Form form={applyForm} layout="vertical" onFinish={applyLeave} style={{ marginTop: 16 }}>
          <Form.Item name="employeeId" label="Employee" rules={[{ required: true, message: "Please select an employee" }]}>
            <EmployeeSelect placeholder="Search by name or ID" allowClear={false} />
          </Form.Item>
          <Form.Item name="leaveType" label="Leave Type" rules={[{ required: true }]}>
            <Select>
              {Object.entries(LEAVE_TYPE_LABEL).map(([k, v]) => <Select.Option key={k} value={k}>{v}</Select.Option>)}
            </Select>
          </Form.Item>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Form.Item name="fromDate" label="From Date" rules={[{ required: true }]}>
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="toDate" label="To Date" rules={[{ required: true }]}>
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </div>
          <Form.Item name="reason" label="Reason">
            <Input.TextArea rows={3} placeholder="Reason for leave" />
          </Form.Item>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={() => { setApplyOpen(false); applyForm.resetFields(); }}>Cancel</Button>
            <Button type="primary" htmlType="submit">Submit</Button>
          </div>
        </Form>
      </Modal>

      {/* Reject Modal */}
      <Modal title="Reject Leave" open={rejectOpen} onCancel={() => { setRejectOpen(false); rejectForm.resetFields(); }} footer={null} width={400}>
        <Form form={rejectForm} layout="vertical" onFinish={handleReject} style={{ marginTop: 16 }}>
          <Form.Item name="reason" label="Rejection Reason" rules={[{ required: true, message: "Reason is required" }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={() => { setRejectOpen(false); rejectForm.resetFields(); }}>Cancel</Button>
            <Button danger htmlType="submit">Reject</Button>
          </div>
        </Form>
      </Modal>

      {/* Rollback Modal */}
      <Modal title="Rollback Approved Leave" open={rollbackOpen} onCancel={() => { setRollbackOpen(false); rollbackForm.resetFields(); }} footer={null} width={400}>
        <Form form={rollbackForm} layout="vertical" onFinish={handleRollback} style={{ marginTop: 16 }}>
          <Form.Item name="reason" label="Rollback Reason" rules={[{ required: true, message: "Reason is required" }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={() => { setRollbackOpen(false); rollbackForm.resetFields(); }}>Cancel</Button>
            <Button htmlType="submit" style={{ background: "#7c3aed", borderColor: "#7c3aed", color: "#fff" }}>Rollback</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
