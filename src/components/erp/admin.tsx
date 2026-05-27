// @ts-nocheck
'use client';


import React, { useState } from "react";
import { Icon } from "./icons";
import { useDATA } from "./data";
import { Btn, Badge, StatusBadge, Avatar, Bar, Sparkline, Kpi, Modal, fmtINR, fmtINRFull, fmtNum, AreaChart, BarChart, Donut } from "./ui";
import { EntityFormModal, FormField, FormGrid, FormInput, FormSelect, useFormState, requireFields } from "@/components/forms";
import { useEntityMutation } from "@/hooks/use-entity-mutation";
import { nextEmployeeId } from "@/lib/id-generators";

/* ============================================================
   ADMIN — Users, Permissions, Design System, Placeholders
   ============================================================ */


/* ============================================================
   USER MANAGEMENT + PERMISSION MATRIX
   ============================================================ */
const PermLabel = { F: "Full", E: "Edit", V: "View", "-": "" };
const PermClass = { F: "perm-full", E: "perm-edit", V: "perm-view", "-": "perm-none" };

const UserManagement = () => {
  const DATA = useDATA();
  const { append, update, createUser, saving, error, clearError } = useEntityMutation();
  const [tab, setTab] = useState("matrix");
  const [editPerm, setEditPerm] = useState(null);
  const [permLevel, setPermLevel] = useState("F");
  const [addUser, setAddUser] = useState(false);
  const userForm = useFormState({ name: "", email: "", role: DATA.ROLES[0]?.key ?? "admin", employeeId: "" });

  const savePermission = async () => {
    if (!editPerm) return;
    const roleKey = DATA.ROLES.find((r) => r.label === editPerm.role)?.key;
    if (!roleKey) throw new Error("Unknown role");
    await update("permissions", editPerm.module, { [roleKey]: permLevel }, "module");
    setEditPerm(null);
  };

  const inviteUser = async () => {
    const err = requireFields(userForm.values, ["name", "email"]);
    if (err) throw new Error(err);
    const empId = userForm.values.employeeId || nextEmployeeId(DATA.EMPLOYEES);
    await createUser({
      email: userForm.values.email.trim(),
      name: userForm.values.name.trim(),
      role: userForm.values.role,
      employeeId: empId,
    });
    await append("employees", {
      id: empId,
      name: userForm.values.name.trim(),
      role: userForm.values.role,
      dept: "Operations",
      status: "active",
      since: String(new Date().getFullYear()),
    });
    setAddUser(false);
    userForm.reset({ name: "", email: "", role: DATA.ROLES[0]?.key ?? "admin", employeeId: "" });
  };

  return (
    <>
      <DashHead title="User Management" sub="Roles, permissions, and access across both companies">
        <Btn icon="upload" size="sm">Import users</Btn>
        <Btn variant="primary" size="sm" icon="plus" onClick={() => setAddUser(true)}>Add user</Btn>
      </DashHead>

      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <div className="kpi"><div className="kpi-label"><Icon name="users" size={13} className="ico" />Total users</div><div className="kpi-value tabular">{DATA.EMPLOYEES.length}</div><div style={{ fontSize: 11, color: "var(--fg-muted)" }}>Across SMI + Microns</div></div>
        <div className="kpi"><div className="kpi-label"><Icon name="shield" size={13} className="ico" />Active roles</div><div className="kpi-value tabular">{DATA.ROLES.length}</div><div style={{ fontSize: 11, color: "var(--fg-muted)" }}>2 with full access</div></div>
        <div className="kpi"><div className="kpi-label"><Icon name="check" size={13} className="ico" />Active sessions</div><div className="kpi-value tabular">48</div><div style={{ fontSize: 11, color: "var(--success)" }}>+12% today</div></div>
        <div className="kpi"><div className="kpi-label"><Icon name="alert" size={13} className="ico" />Pending requests</div><div className="kpi-value" style={{ color: "var(--warning)" }}>3</div><div style={{ fontSize: 11, color: "var(--fg-muted)" }}>Permission changes</div></div>
      </div>

      <div className="card">
        <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center" }}>
          <div className="tabs" style={{ border: "none", marginBottom: -1 }}>
            <span className={`tab ${tab === "matrix" ? "active" : ""}`} onClick={() => setTab("matrix")}>Permission Matrix</span>
            <span className={`tab ${tab === "users" ? "active" : ""}`} onClick={() => setTab("users")}>Users <span className="tab-count">{DATA.EMPLOYEES.length}</span></span>
            <span className={`tab ${tab === "roles" ? "active" : ""}`} onClick={() => setTab("roles")}>Roles <span className="tab-count">{DATA.ROLES.length}</span></span>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <select className="input" style={{ width: 200, height: 30 }}>
              <option>Both companies</option><option>Sudarshan Minerals only</option><option>Sudarshan Microns only</option>
            </select>
            <Btn size="sm" icon="download">Export CSV</Btn>
          </div>
        </div>

        {tab === "matrix" && (
          <div style={{ overflowX: "auto" }}>
            <table className="perm-tbl">
              <thead>
                <tr>
                  <th>Module</th>
                  {DATA.ROLES.map((r) => <th key={r.key}>{r.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {DATA.PERMISSIONS.map((p) => (
                  <tr key={p.module}>
                    <td>{p.module}</td>
                    {DATA.ROLES.map((r) => {
                      const v = p[r.key];
                      return (
                        <td key={r.key}>
                          {v !== "-" ? (
                            <span className={`perm-cell ${PermClass[v]}`} onClick={() => { setPermLevel(v); setEditPerm({ module: p.module, role: r.label, level: v }); }} style={{ cursor: "pointer" }}>
                              {PermLabel[v]}
                            </span>
                          ) : (
                            <span className={`perm-cell perm-none`}>—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: "14px 16px", display: "flex", gap: 18, fontSize: 11, color: "var(--fg-muted)", borderTop: "1px solid var(--border)" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span className="perm-cell perm-full" style={{ minWidth: 36 }}>Full</span> Create, edit, delete, approve</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span className="perm-cell perm-edit" style={{ minWidth: 36 }}>Edit</span> Create & modify</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span className="perm-cell perm-view" style={{ minWidth: 36 }}>View</span> Read-only</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ color: "var(--fg-faint)", padding: "0 8px" }}>—</span> No access</span>
            </div>
          </div>
        )}

        {tab === "users" && (
          <div style={{ overflowX: "auto" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Employee</th><th>Role</th><th>Department</th><th>Companies</th><th>Since</th><th>Last active</th><th>Status</th><th></th>
                </tr>
              </thead>
              <tbody>
                {DATA.EMPLOYEES.map((e, i) => (
                  <tr key={e.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar name={e.name} color={(i % 5) + 1} />
                        <div>
                          <div className="strong">{e.name}</div>
                          <div className="subtle" style={{ fontSize: 11 }}>{e.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>{e.role}</td>
                    <td className="muted">{e.dept}</td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        {(i % 3 === 0) ? (
                          <><Badge tone="primary" sq>SMI</Badge><Badge tone="gold" sq>Microns</Badge></>
                        ) : (i % 2 === 0 ? <Badge tone="primary" sq>SMI</Badge> : <Badge tone="gold" sq>Microns</Badge>)}
                      </div>
                    </td>
                    <td className="muted">{e.since}</td>
                    <td className="muted">{i === 0 ? "Active now" : `${i * 3 + 2}h ago`}</td>
                    <td><Badge tone="success" dot>Active</Badge></td>
                    <td>
                      <Btn variant="ghost" size="sm" iconRight="chevRight">Edit</Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "roles" && (
          <div style={{ padding: 16, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {DATA.ROLES.map((r, i) => {
              const moduleCount = DATA.PERMISSIONS.filter(p => p[r.key] !== "-").length;
              const userCount = [3, 1, 1, 1, 1, 1, 1, 1, 2][i];
              return (
                <div key={r.key} className="card" style={{ borderRadius: 8 }}>
                  <div className="card-body" style={{ padding: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600 }}>{r.label}</div>
                      <button className="tb-iconbtn"><Icon name="moreV" size={13} /></button>
                    </div>
                    <div style={{ display: "flex", gap: 14, marginBottom: 12 }}>
                      <div>
                        <div className="subtle" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Users</div>
                        <div className="mono" style={{ fontSize: 16, fontWeight: 600 }}>{userCount}</div>
                      </div>
                      <div>
                        <div className="subtle" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Modules</div>
                        <div className="mono" style={{ fontSize: 16, fontWeight: 600 }}>{moduleCount}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {DATA.PERMISSIONS.filter(p => p[r.key] !== "-").slice(0, 4).map(p => (
                        <Badge key={p.module}>{p.module.split(" ")[0]}</Badge>
                      ))}
                      {moduleCount > 4 && <Badge>+{moduleCount - 4}</Badge>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <EntityFormModal open={!!editPerm} onClose={() => setEditPerm(null)} title={editPerm ? `Edit permission` : ""} sub={editPerm ? `${editPerm.role} → ${editPerm.module}` : ""} submitLabel="Save change" saving={saving} error={error} onSubmit={savePermission}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { v: "F", l: "Full access", d: "Create, edit, delete, approve" },
            { v: "E", l: "Edit access", d: "Create and modify items" },
            { v: "V", l: "View only", d: "Read records, no modifications" },
            { v: "-", l: "No access", d: "Module is hidden for this role" },
          ].map((o) => (
            <label key={o.v} style={{
              padding: 12, border: "1.5px solid var(--border)",
              borderRadius: 8, display: "flex", gap: 10, cursor: "pointer",
              ...(permLevel === o.v && { borderColor: "var(--primary)", background: "var(--primary-soft)" }),
            }}>
              <input type="radio" name="lv" checked={permLevel === o.v} onChange={() => setPermLevel(o.v)} style={{ accentColor: "var(--primary)" }} />
              <div>
                <div style={{ fontWeight: 500 }}>{o.l}</div>
                <div className="subtle" style={{ fontSize: 11, marginTop: 2 }}>{o.d}</div>
              </div>
            </label>
          ))}
        </div>
      </EntityFormModal>

      <EntityFormModal open={addUser} onClose={() => setAddUser(false)} title="Add user" sub="Invite a person to the ERP (default password: sudarshan123)" wide submitLabel="Send invite" saving={saving} error={error} onSubmit={inviteUser}>
        <FormGrid>
          <FormField label="Full name"><FormInput value={userForm.values.name} onChange={(v) => userForm.setField("name", v)} /></FormField>
          <FormField label="Email"><FormInput value={userForm.values.email} onChange={(v) => userForm.setField("email", v)} /></FormField>
          <FormField label="Employee ID"><FormInput value={userForm.values.employeeId} onChange={(v) => userForm.setField("employeeId", v)} placeholder={nextEmployeeId(DATA.EMPLOYEES)} /></FormField>
          <FormField label="Role">
            <FormSelect value={userForm.values.role} onChange={(v) => userForm.setField("role", v)}>
              {DATA.ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </FormSelect>
          </FormField>
        </FormGrid>
      </EntityFormModal>
    </>
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
