// @ts-nocheck
'use client';


import React, { useState } from "react";
import { Icon } from "./icons";
import { useDATA } from "./data";
import { DashHead } from "./dashboards";
import { Btn, Badge, StatusBadge, Avatar, Bar, Sparkline, Kpi, Modal, fmtINR, fmtINRFull, fmtNum, AreaChart, BarChart, Donut } from "./ui";
import { EntityFormModal, FormField, FormGrid, FormInput, FormSelect, useFormState, requireFields } from "@/components/forms";
import { useEntityMutation } from "@/hooks/use-entity-mutation";
import { nextEmployeeId } from "@/lib/id-generators";
import { useEffect, useCallback } from "react";
import { Tabs, Table, Badge as AntBadge, Button, Avatar as AntAvatar, Drawer, Checkbox, Spin, Tag, message, Tooltip, Divider, Input } from "antd";
import { LockOutlined, SafetyOutlined, UserAddOutlined, KeyOutlined, EditOutlined, CheckCircleFilled, MinusCircleFilled, PlusOutlined, SafetyCertificateOutlined, CrownOutlined, EyeOutlined, PlusCircleOutlined, ExportOutlined, FileDoneOutlined, TeamOutlined, IdcardOutlined } from "@ant-design/icons";
import StatCard from "@/components/common/StatCard";
/* ============================================================
   ADMIN — Users, Permissions, Design System, Placeholders
   ============================================================ */


/* ============================================================
   USER MANAGEMENT + PERMISSION MATRIX
   ============================================================ */
// ─── Types ────────────────────────────────────────────────────────────────────
const MODULE_KEYS = [
  "dashboard", "hr", "payroll",
  "inventory_raw", "inventory_packaging", "inventory_spares",
  "procurement_vendors", "procurement_po", "procurement_invoice",
  "sales_customers", "sales_orders",
  "operations_production", "operations_quality",
  "dispatch", "settings", "user_management", "reports",
] as const;
type ModuleKey = (typeof MODULE_KEYS)[number];
type PermAction = "view" | "add" | "edit" | "approve" | "export";

const MODULE_LABELS: Record<ModuleKey, string> = {
  dashboard: "Dashboard",
  hr: "HR & Attendance",
  payroll: "Payroll",
  inventory_raw: "Inventory: Raw Material",
  inventory_packaging: "Inventory: Packaging",
  inventory_spares: "Inventory: Spare Parts",
  procurement_vendors: "Procurement: Vendors",
  procurement_po: "Procurement: Purchase Orders",
  procurement_invoice: "Procurement: Invoice Verify",
  sales_customers: "Sales: Customers",
  sales_orders: "Sales: Orders",
  operations_production: "Operations: Production",
  operations_quality: "Operations: Quality",
  dispatch: "Dispatch",
  settings: "Settings",
  user_management: "User Management",
  reports: "Reports",
};

const MODULE_GROUPS = [
  { label: "Core", keys: ["dashboard", "reports"] },
  { label: "HRMS", keys: ["hr", "payroll"] },
  { label: "Inventory", keys: ["inventory_raw", "inventory_packaging", "inventory_spares"] },
  { label: "Procurement", keys: ["procurement_vendors", "procurement_po", "procurement_invoice"] },
  { label: "Sales", keys: ["sales_customers", "sales_orders"] },
  { label: "Operations", keys: ["operations_production", "operations_quality"] },
  { label: "Logistics", keys: ["dispatch"] },
  { label: "Administration", keys: ["settings", "user_management"] },
] as const;

const PERM_ACTIONS: PermAction[] = ["view", "add", "edit", "approve", "export"];

type ModulePerm = { view: boolean; add: boolean; edit: boolean; approve: boolean; export: boolean };
type PermissionsMap = Record<ModuleKey, ModulePerm>;

interface Role {
  _id: string;
  roleKey: string;
  label: string;
  description: string;
  isSystem: boolean;
  permissions: PermissionsMap;
}

// ─── Role Badge Color Map ─────────────────────────────────────────────────────
const ROLE_COLORS: Record<string, string> = {
  owner: "#374d95",
  admin: "#6d28d9",
  procurement: "#0369a1",
  "rm-procurement": "#0f766e",
  "packaging-procurement": "#15803d",
  "spare-parts-procurement": "#92400e",
  production: "#b45309",
  dispatch: "#c2410c",
  store: "#374151",
  hr: "#be185d",
};

const getRoleColor = (key: string) => ROLE_COLORS[key] ?? "#374d95";

// ─── Component ────────────────────────────────────────────────────────────────
const UserManagement = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editPerms, setEditPerms] = useState<PermissionsMap | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const loadData = useCallback(async () => {
    try {
      setRolesLoading(true);
      setUsersLoading(true);
      
      const [rolesRes, employeesRes] = await Promise.all([
        fetch("/api/system/roles"),
        fetch("/api/hrms/employees")
      ]);
      
      const rolesData = await rolesRes.json();
      const employeesData = await employeesRes.json();
      
      let fetchedRoles: Role[] = [];
      if (rolesData.success) {
        fetchedRoles = rolesData.data;
        setRoles(fetchedRoles);
      }
      
      if (employeesData.success) {
        const employeeUsers = employeesData.data.map((emp: any) => {
          const roleLabel = fetchedRoles.find((r) => r.roleKey === emp.department)?.label || emp.department || "No Role";
          return {
            key: emp.employeeId || emp._id,
            name: emp.fullName || "Unknown",
            email: emp.officialEmail || emp.personalEmail || "N/A",
            role: roleLabel,
            status: emp.status || "Active",
            scope: "Global (All entities)",
          };
        });
        setUsers(employeeUsers);
      }
    } catch {
      messageApi.error("Failed to load data");
    } finally {
      setRolesLoading(false);
      setUsersLoading(false);
    }
  }, [messageApi]);

  useEffect(() => { loadData(); }, [loadData]);

  const openDrawer = (role: Role) => {
    setIsCreatingRole(false);
    setEditingRole(role);
    setEditPerms(JSON.parse(JSON.stringify(role.permissions))); // deep clone
    setEditLabel(role.label);
    setEditDesc(role.description);
    setDrawerOpen(true);
  };

  const openCreateDrawer = () => {
    setIsCreatingRole(true);
    setEditingRole(null);
    setEditLabel("");
    setEditDesc("");
    const emptyPerms = {} as PermissionsMap;
    MODULE_KEYS.forEach((key) => {
      emptyPerms[key] = { view: false, add: false, edit: false, approve: false, export: false };
    });
    setEditPerms(emptyPerms);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingRole(null);
    setEditPerms(null);
    setIsCreatingRole(false);
  };

  const togglePerm = (mod: ModuleKey, action: PermAction) => {
    if (!editPerms) return;
    setEditPerms((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [mod]: {
          ...prev[mod],
          [action]: !prev[mod][action],
        },
      };
    });
  };

  const saveRole = async () => {
    if (!editLabel.trim()) {
      messageApi.error("Role label is required");
      return;
    }
    if (!editPerms) return;
    setSaving(true);
    try {
      if (isCreatingRole) {
        const roleKey = editLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        const res = await fetch(`/api/system/roles`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roleKey,
            label: editLabel,
            description: editDesc,
            permissions: editPerms,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create role");
        messageApi.success("Role created successfully!");
      } else {
        if (!editingRole) return;
        const res = await fetch(`/api/system/roles/${editingRole.roleKey}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            label: editLabel,
            description: editDesc,
            permissions: editPerms,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to save");
        messageApi.success("Role permissions saved successfully!");
      }
      await loadData();
      closeDrawer();
    } catch (err: any) {
      messageApi.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ─── Count perms summary ────────────────────────────────────────────────────
  const countPerms = (perms: PermissionsMap) => {
    let total = 0;
    MODULE_KEYS.forEach((mod) => {
      PERM_ACTIONS.forEach((act) => {
        if (perms[mod]?.[act]) total++;
      });
    });
    return total;
  };

  // ─── Users tab columns ──────────────────────────────────────────────────────
  const userColumns = [
    {
      title: "User Profile",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: any) => (
        <div className="flex items-center gap-3">
          <AntAvatar icon={<SafetyOutlined />} style={{ backgroundColor: "#374d95" }} />
          <div>
            <div className="font-bold text-zinc-900">{text}</div>
            <div className="text-zinc-400 text-xs">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "System Role",
      dataIndex: "role",
      key: "role",
      render: (text: string) => {
        const matched = roles.find((r) => r.label === text);
        const color = matched ? getRoleColor(matched.roleKey) : "#374d95";
        return (
          <Tag style={{ backgroundColor: color + "18", color, borderColor: color + "40", fontWeight: 600 }}>
            {text}
          </Tag>
        );
      },
    },
    { title: "Access Scope", dataIndex: "scope", key: "scope" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text: string) => <AntBadge status="success" text={<span className="text-emerald-600 font-semibold">{text}</span>} />,
    },
    {
      title: "",
      key: "action",
      render: () => <Button type="link" size="small" icon={<KeyOutlined />}>Permissions</Button>,
      align: "right" as const,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {contextHolder}
      <DashHead
        title="User Access Management"
        sub="Control permissions, system accounts, and security privileges"
      >
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          style={{ height: 38, borderRadius: 6, background: "#374d95", border: "none", fontWeight: 600, fontSize: 13 }}
        >
          Add System Account
        </Button>
      </DashHead>

      {/* Summary Cards */}
      <div className="grid grid-3" style={{ gap: 16 }}>
        {[
          { label: "Active System Users", icon: TeamOutlined, value: users.length.toString(), hint: "Maximum allowed: 10 admin seats", hintTone: "default" },
          { label: "MFA Status", icon: SafetyCertificateOutlined, value: "Enabled", hint: "Enforced across all administration endpoints", hintTone: "positive" },
          { label: "Active Roles", icon: IdcardOutlined, value: roles.length.toString(), hint: `${roles.filter(r => r.isSystem).length} system + ${roles.filter(r => !r.isSystem).length} custom roles`, hintTone: "default" },
        ].map((card) => (
          <StatCard
            key={card.label}
            icon={card.icon}
            label={card.label}
            value={card.value}
            hint={card.hint}
            hintTone={card.hintTone as any}
          />
        ))}
      </div>

      {/* Tabs */}
      <div className="card" style={{ padding: 16, overflow: "visible" }}>
        <Tabs
          defaultActiveKey="users"
          items={[
            {
              key: "users",
              label: <span className="font-semibold p-4">System Users</span>,
              children: (
                <div className="px-5 pb-6 pt-2">
                  <Table dataSource={users} columns={userColumns} loading={usersLoading} pagination={false} bordered={false} />
                </div>
              ),
            },
            {
              key: "roles",
              label: (
                <span className="font-semibold flex items-center gap-1.5">
                  <SafetyCertificateOutlined className="text-[12px]" />
                  Roles & Permissions
                </span>
              ),
              children: (
                <div className="px-5 pt-2">
                  {rolesLoading ? (
                    <div className="flex items-center justify-center py-16"><Spin size="large" /></div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-center" style={{ marginBottom: 16 }}>
                        <p className="text-zinc-500 text-sm" style={{ margin: 0 }}>
                          {roles.length} roles defined — click any card to view and edit permissions.
                        </p>
                        <Button
                          icon={<PlusOutlined />}
                          size="small"
                          onClick={openCreateDrawer}
                          style={{ fontWeight: 600, borderRadius: 6 }}
                        >
                          New Custom Role
                        </Button>
                      </div>
                      <div className="grid grid-3" style={{ gap: 16 }}>
                        {roles.map((role) => {
                          const color = getRoleColor(role.roleKey);
                          const permCount = countPerms(role.permissions);
                          return (
                            <div
                              key={role.roleKey}
                              onClick={() => openDrawer(role)}
                              style={{ padding: 20, cursor: "pointer", position: "relative" }}
                              className="card group hover:shadow-sm transition-all duration-150"
                            >
                              <div className="flex items-start justify-between mb-3" style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                                <div className="flex items-center gap-2" style={{ display: "flex", gap: 8 }}>
                                  <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[11px] font-black"
                                    style={{ background: color, width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}
                                  >
                                    {role.isSystem ? <CrownOutlined /> : <LockOutlined />}
                                  </div>
                                  <div>
                                    <div className="font-bold text-zinc-900 text-sm leading-none" style={{ fontWeight: 700, fontSize: 14 }}>{role.label}</div>
                                    <div className="text-[10px] text-zinc-400 font-mono uppercase mt-0.5 tracking-wider" style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--fg-muted)", marginTop: 2, textTransform: "uppercase" }}>{role.roleKey}</div>
                                  </div>
                                </div>
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<EditOutlined />}
                                  style={{ color, opacity: 0.7 }}
                                />
                              </div>
                              <p className="text-zinc-500 text-[12px] leading-relaxed line-clamp-2 mb-3" style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 12 }}>{role.description}</p>
                              <div className="flex items-center justify-between pt-3 border-t border-zinc-100" style={{ display: "flex", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                                <div className="text-[11px] text-zinc-400" style={{ fontSize: 11, color: "var(--fg-muted)" }}>
                                  <span className="font-bold text-zinc-700" style={{ fontWeight: 700, color: "var(--fg)" }}>{permCount}</span> permissions granted
                                </div>
                                {role.isSystem ? (
                                  <Tag style={{ fontSize: 10, lineHeight: "16px", borderRadius: 4 }} color="blue">System</Tag>
                                ) : (
                                  <Tag style={{ fontSize: 10, lineHeight: "16px", borderRadius: 4 }} color="default">Custom</Tag>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* Permission Edit Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-3" style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
              style={{ background: isCreatingRole ? "#10b981" : (editingRole ? getRoleColor(editingRole.roleKey) : "#374d95"), width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}
            >
              <SafetyCertificateOutlined />
            </div>
            <div>
              <div className="font-bold text-zinc-900 text-base leading-none" style={{ fontWeight: 700, fontSize: 16 }}>
                {isCreatingRole ? "Create New Role" : `${editingRole?.label ?? "Role"} — Permissions`}
              </div>
              {!isCreatingRole && <div className="text-[11px] text-zinc-400 font-mono mt-0.5" style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--fg-muted)", marginTop: 2 }}>{editingRole?.roleKey}</div>}
            </div>
          </div>
        }
        open={drawerOpen}
        onClose={closeDrawer}
        width={640}
        footer={
          <div className="flex justify-end gap-3 py-1" style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "4px 0" }}>
            <Button onClick={closeDrawer} disabled={saving} style={{ fontWeight: 500 }}>Cancel</Button>
            <Button
              type="primary"
              onClick={saveRole}
              loading={saving}
              style={{ background: "#374d95", border: "none", fontWeight: 600, borderRadius: 6 }}
            >
              Save Permissions
            </Button>
          </div>
        }
      >
        {editPerms && (
          <div className="flex flex-col gap-5" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Label & Desc */}
            <div className="flex flex-col gap-3 p-4 bg-zinc-50 border border-zinc-200 rounded-xl" style={{ display: "flex", flexDirection: "column", gap: 12, padding: 16, background: "var(--bg-sunken)", border: "1px solid var(--border)", borderRadius: 12 }}>
              <div>
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block" style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4, display: "block" }}>Role Label</label>
                <Input
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  disabled={!isCreatingRole && editingRole?.isSystem ? true : false}
                  style={{ height: 36 }}
                  placeholder="e.g. Field Engineer"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block" style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4, display: "block" }}>Description</label>
                <Input.TextArea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            {/* Permission Matrix */}
            <div>
              <div className="flex items-center gap-2 mb-3" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <LockOutlined style={{ color: "var(--fg-muted)", fontSize: 14 }} />
                <span className="font-bold text-zinc-800 text-sm" style={{ fontWeight: 700, fontSize: 14 }}>Permission Matrix</span>
              </div>

              {/* Action Header */}
              <div className="grid grid-cols-[1fr_40px_40px_40px_40px_40px] gap-0 mb-1 px-1" style={{ display: "grid", gridTemplateColumns: "1fr 40px 40px 40px 40px 40px", gap: 0, marginBottom: 4, padding: "0 4px" }}>
                <div />
                {([
                  { key: "view",    icon: <EyeOutlined />,           title: "View" },
                  { key: "add",     icon: <PlusCircleOutlined />,    title: "Add" },
                  { key: "edit",    icon: <EditOutlined />,          title: "Edit" },
                  { key: "approve", icon: <FileDoneOutlined />,      title: "Approve" },
                  { key: "export",  icon: <ExportOutlined />,        title: "Export" },
                ] as const).map(({ key, icon, title }) => (
                  <Tooltip key={key} title={title} placement="top">
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", fontSize: 13, color: "var(--fg-muted)" }}>
                      {icon}
                    </div>
                  </Tooltip>
                ))}
              </div>

              {/* Module Groups */}
              {MODULE_GROUPS.map((group) => (
                <div key={group.label} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 4px", marginBottom: 4, marginTop: 8 }}>{group.label}</div>
                  {(group.keys as unknown as ModuleKey[]).map((modKey) => {
                    const perm = editPerms[modKey] ?? { view: false, add: false, edit: false, approve: false, export: false };
                    const hasAny = PERM_ACTIONS.some((a) => perm[a]);
                    return (
                      <div
                        key={modKey}
                        style={{ display: "grid", gridTemplateColumns: "1fr 40px 40px 40px 40px 40px", alignItems: "center", gap: 0, padding: "8px 4px", borderRadius: 8, opacity: hasAny ? 1 : 0.5, transition: "background 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--bg-sunken)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Tooltip title={hasAny ? "Has permissions" : "No permissions"}>
                            {hasAny
                              ? <CheckCircleFilled style={{ color: "#16a34a", fontSize: 12 }} />
                              : <MinusCircleFilled style={{ color: "#d4d4d8", fontSize: 12 }} />
                            }
                          </Tooltip>
                          <span style={{ fontSize: 12.5, color: "var(--fg)", fontWeight: 500 }}>{MODULE_LABELS[modKey]}</span>
                        </div>
                        {PERM_ACTIONS.map((act) => (
                          <div key={act} style={{ display: "flex", justifyContent: "center" }}>
                            <Checkbox
                              checked={perm[act]}
                              onChange={() => togglePerm(modKey, act)}
                            />
                          </div>
                        ))}
                      </div>
                    );
                  })}
                  <Divider style={{ margin: "8px 0", borderColor: "var(--border)" }} />
                </div>
              ))}

              {/* Legend */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 11, color: "var(--fg-muted)", marginTop: 12, padding: "0 4px" }}>
                {([
                  { key: "view",    icon: <EyeOutlined />,           label: "View" },
                  { key: "add",     icon: <PlusCircleOutlined />,    label: "Add" },
                  { key: "edit",    icon: <EditOutlined />,          label: "Edit" },
                  { key: "approve", icon: <FileDoneOutlined />,      label: "Approve" },
                  { key: "export",  icon: <ExportOutlined />,        label: "Export" },
                ] as const).map(({ key, icon, label }) => (
                  <span key={key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 12 }}>{icon}</span>
                    <span>{label}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

/* ============================================================
   DESIGN SYSTEM SHOWCASE
   ============================================================ */
const DesignSystem = () => (
  <>
    <DashHead title="Design System" sub="Sudarshan ERP · Foundations, components, motion">
      <Btn icon="external" size="sm">Open in Figma</Btn>
      <Btn icon="download" size="sm">Download tokens</Btn>
    </DashHead>

    <div className="grid grid-2" style={{ marginBottom: 20 }}>
      <div className="card">
        <div className="card-head"><div className="card-title">Brand colors</div></div>
        <div className="card-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <ColorSwatch label="Primary" value="#374d95" sub="Indigo · brand action" />
          <ColorSwatch label="Secondary" value="#e8a901" sub="Gold · accent, highlights" />
        </div>
      </div>

      <div className="card">
        <div className="card-head"><div className="card-title">Semantic colors</div></div>
        <div className="card-body" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          <ColorSwatch label="Success" value="#168a52" sm />
          <ColorSwatch label="Warning" value="#b86a00" sm />
          <ColorSwatch label="Danger" value="#c41e3a" sm />
          <ColorSwatch label="Info" value="#1965c0" sm />
        </div>
      </div>
    </div>

    <div className="card" style={{ marginBottom: 20 }}>
      <div className="card-head"><div className="card-title">Surfaces & borders</div></div>
      <div className="card-body" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
        {[
          { l: "Background", v: "#fbfbfa" },
          { l: "Elevated",   v: "#ffffff" },
          { l: "Sunken",     v: "#f4f4f1" },
          { l: "Hover",      v: "#f0f0ec" },
          { l: "Border",     v: "#ececea" },
        ].map(s => (
          <div key={s.l} style={{
            padding: 14, background: s.v, border: "1px solid var(--border)",
            borderRadius: 8, fontSize: 12,
          }}>
            <div style={{ fontWeight: 500 }}>{s.l}</div>
            <div className="mono subtle" style={{ fontSize: 11, marginTop: 2 }}>{s.v}</div>
          </div>
        ))}
      </div>
    </div>

    <div className="grid grid-2" style={{ marginBottom: 20 }}>
      <div className="card">
        <div className="card-head"><div className="card-title">Typography</div></div>
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <TypeRow label="Display · 32" sample="Sudarshan ERP" size={32} family="display" weight={600} />
          <TypeRow label="Title · 22"   sample="Master Dashboard" size={22} family="display" weight={600} />
          <TypeRow label="Heading · 14" sample="Inventory value" size={14} family="display" weight={600} />
          <TypeRow label="Body · 13"    sample="The quick brown fox jumps over the lazy dog" size={13} family="sans" weight={400} />
          <TypeRow label="Small · 12"   sample="Updated 4 minutes ago · Plant A" size={12} family="sans" weight={400} />
          <TypeRow label="Mono · 12"    sample="PO-2026-0142 · ₹18,40,000" size={12} family="mono" weight={500} />
        </div>
      </div>

      <div className="card">
        <div className="card-head"><div className="card-title">Buttons</div></div>
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Btn variant="primary">Primary</Btn>
            <Btn>Default</Btn>
            <Btn variant="ghost">Ghost</Btn>
            <Btn variant="secondary">Secondary</Btn>
            <Btn variant="danger">Danger</Btn>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Btn variant="primary" icon="plus">With icon</Btn>
            <Btn icon="download">Export</Btn>
            <Btn iconRight="chevRight">Continue</Btn>
            <Btn icon="check" size="sm">Small</Btn>
            <Btn size="lg" variant="primary">Large</Btn>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <Btn icon="search" /><Btn icon="settings" /><Btn icon="more" /><Btn icon="filter" />
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <Badge>Default</Badge>
            <Badge tone="primary" dot>Primary</Badge>
            <Badge tone="success" dot>Success</Badge>
            <Badge tone="warning" dot>Warning</Badge>
            <Badge tone="danger" dot>Danger</Badge>
            <Badge tone="info" dot>Info</Badge>
            <Badge tone="gold" dot>Gold</Badge>
          </div>
        </div>
      </div>
    </div>

    <div className="card">
      <div className="card-head"><div className="card-title">Icons (subset)</div></div>
      <div className="card-body" style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 12 }}>
        {["home", "dashboard", "factory", "truck", "box", "package", "wrench", "users", "cart", "invoice",
          "money", "chart", "pieChart", "bell", "pin", "map", "filter", "plus", "check", "alert",
          "shield", "settings", "calendar", "clock", "search", "download", "upload", "edit", "trash", "bolt"].map(n => (
          <div key={n} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
            padding: 10, border: "1px solid var(--border)", borderRadius: 8,
          }}>
            <Icon name={n} size={18} />
            <span className="mono subtle" style={{ fontSize: 10 }}>{n}</span>
          </div>
        ))}
      </div>
    </div>
  </>
);

const ColorSwatch = ({ label, value, sub, sm }) => (
  <div style={{
    border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden",
  }}>
    <div style={{ background: value, height: sm ? 56 : 86 }}></div>
    <div style={{ padding: 10 }}>
      <div style={{ fontWeight: 500, fontSize: 13 }}>{label}</div>
      <div className="mono subtle" style={{ fontSize: 11, marginTop: 2 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--fg-muted)", marginTop: 4 }}>{sub}</div>}
    </div>
  </div>
);

const TypeRow = ({ label, sample, size, family, weight }) => (
  <div>
    <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--fg-subtle)", marginBottom: 4, fontWeight: 500 }}>{label}</div>
    <div style={{
      fontSize: size,
      fontFamily: family === "display" ? "var(--font-display)" : family === "mono" ? "var(--font-mono)" : "var(--font-sans)",
      fontWeight: weight,
      letterSpacing: size > 20 ? "-0.025em" : "-0.01em",
      color: "var(--fg)",
    }}>
      {sample}
    </div>
  </div>
);

/* ============================================================
   GENERIC PLACEHOLDER SCREENS (for modules we won't fully detail)
   ============================================================ */
const Placeholder = ({ title, sub, icon = "layers", children }) => (
  <>
    <DashHead title={title} sub={sub}>
      <Btn size="sm" icon="filter">Filters</Btn>
      <Btn variant="primary" size="sm" icon="plus">New</Btn>
    </DashHead>
    {children || (
      <div className="card" style={{ padding: 80, textAlign: "center" }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14, background: "var(--primary-soft)",
          color: "var(--primary)", display: "grid", placeItems: "center", margin: "0 auto 16px",
        }}>
          <Icon name={icon} size={26} />
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, marginBottom: 6 }}>
          {title}
        </div>
        <div style={{ fontSize: 13, color: "var(--fg-muted)", maxWidth: 420, margin: "0 auto 20px" }}>
          {sub} — module designed; not detailed in this preview. Build follows the same patterns shown in the 3 hero modules.
        </div>
        <Btn variant="primary" size="sm" icon="plus">Add first record</Btn>
      </div>
    )}
  </>
);

export { UserManagement, DesignSystem, Placeholder };
