// @ts-nocheck
'use client';


import React, { useState } from "react";
import { Icon } from "./icons";
import { useDATA } from "./data";
import { Btn, Badge, StatusBadge, Avatar, Bar, Sparkline, Kpi, Modal, fmtINR, fmtINRFull, fmtNum, AreaChart, BarChart, Donut } from "./ui";
import {
  EntityFormModal,
  FormField,
  FormGrid,
  FormInput,
  FormSelect,
  useFormState,
  requireFields,
} from "@/components/forms";
import { useEntityMutation } from "@/hooks/use-entity-mutation";
import { nextCustomerId, nextOrderId, nextFieldVisitId, nextInvoiceId, formatDueDate, formatDisplayDate } from "@/lib/id-generators";
import { DashHead, SectionH } from "./dashboards";

/* ============================================================
   MODULES PART 2 — Customers, Orders, Field Sales, Invoice Verify
   ============================================================ */


/* ============================================================
   CUSTOMERS
   ============================================================ */
const customerFormInit = {
  name: "",
  companyType: "Private Limited",
  gstin: "",
  pan: "",
  contact: "",
  phone: "",
  email: "",
  city: "",
  terms: "Net 30",
  creditLimit: "2500000",
  assignedTo: "",
  appliesTo: "Both",
};

const Customers = () => {
  const DATA = useDATA();
  const { append, saving, error, clearError } = useEntityMutation();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("all");
  const form = useFormState(customerFormInit);
  const salesReps = DATA.EMPLOYEES.filter((e) => e.dept === "Sales");

  const activeCount = DATA.CUSTOMERS.filter((c) => (c.status ?? "active") === "active").length;
  const holdCount = DATA.CUSTOMERS.filter((c) => c.status === "hold").length;
  const receivables = DATA.CUSTOMERS.reduce((s, c) => s + Math.round(c.ytd * 0.18), 0);

  const filtered =
    tab === "all"
      ? DATA.CUSTOMERS
      : tab === "hold"
        ? DATA.CUSTOMERS.filter((c) => c.status === "hold")
        : tab === "active"
          ? DATA.CUSTOMERS.filter((c) => (c.status ?? "active") === "active")
          : DATA.CUSTOMERS.filter((c) => c.status === "prospect");

  const saveCustomer = async () => {
    const err = requireFields(form.values, ["name", "city"]);
    if (err) throw new Error(err);
    const rep = form.values.assignedTo || salesReps[0]?.name || "—";
    await append("customers", {
      id: nextCustomerId(DATA.CUSTOMERS),
      name: form.values.name.trim(),
      city: form.values.city.trim(),
      orders: 0,
      ytd: 0,
      terms: form.values.terms,
      status: "active",
      gstin: form.values.gstin,
      pan: form.values.pan,
      contact: form.values.contact,
      phone: form.values.phone,
      email: form.values.email,
      creditLimit: Number(form.values.creditLimit) || 0,
      assignedTo: rep,
      appliesTo: form.values.appliesTo,
    });
    form.reset(customerFormInit);
    setOpen(false);
  };

  return (
    <>
      <DashHead title="Customers" sub="Customer master · contacts · credit terms · order history">
        <Btn icon="upload" size="sm">Import CSV</Btn>
        <Btn variant="primary" size="sm" icon="plus" onClick={() => { clearError(); setOpen(true); }}>Add customer</Btn>
      </DashHead>

      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <div className="kpi"><div className="kpi-label"><Icon name="users" size={13} className="ico" />Total customers</div><div className="kpi-value tabular">{DATA.CUSTOMERS.length}</div><div style={{ fontSize: 11, color: "var(--fg-muted)" }}>{activeCount} active</div></div>
        <div className="kpi"><div className="kpi-label"><Icon name="cart" size={13} className="ico" />With orders</div><div className="kpi-value tabular">{DATA.CUSTOMERS.filter((c) => c.orders > 0).length}</div><div style={{ fontSize: 11, color: "var(--success)" }}>From database</div></div>
        <div className="kpi"><div className="kpi-label"><Icon name="money" size={13} className="ico" />Receivables</div><div className="kpi-value">{fmtINR(receivables)}</div><div style={{ fontSize: 11, color: "var(--warning)" }}>Est. 18% of YTD</div></div>
        <div className="kpi"><div className="kpi-label"><Icon name="alert" size={13} className="ico" />Credit holds</div><div className="kpi-value" style={{ color: holdCount ? "var(--danger)" : undefined }}>{holdCount}</div><div style={{ fontSize: 11, color: "var(--fg-muted)" }}>Review required</div></div>
      </div>

      <div className="card">
        <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center" }}>
          <div className="tabs" style={{ border: "none", marginBottom: -1 }}>
            <span className={`tab ${tab === "all" ? "active" : ""}`} onClick={() => setTab("all")}>All <span className="tab-count">{DATA.CUSTOMERS.length}</span></span>
            <span className={`tab ${tab === "active" ? "active" : ""}`} onClick={() => setTab("active")}>Active <span className="tab-count">{activeCount}</span></span>
            <span className={`tab ${tab === "hold" ? "active" : ""}`} onClick={() => setTab("hold")}>On hold <span className="tab-count">{holdCount}</span></span>
            <span className={`tab ${tab === "prospect" ? "active" : ""}`} onClick={() => setTab("prospect")}>Prospects <span className="tab-count">{DATA.CUSTOMERS.filter((c) => c.status === "prospect").length}</span></span>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <input className="input" placeholder="Search customers…" style={{ height: 30, width: 220 }} />
            <Btn size="sm" icon="filter">Filter</Btn>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>City</th>
                <th>Terms</th>
                <th style={{ textAlign: "right" }}>Orders</th>
                <th style={{ textAlign: "right" }}>YTD revenue</th>
                <th style={{ textAlign: "right" }}>Open AR</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="muted" style={{ textAlign: "center", padding: 24 }}>No customers yet. Add one or run npm run seed.</td></tr>
              ) : null}
              {filtered.map((c, i) => (
                <tr key={c.id}>
                  <td className="mono strong">{c.id}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={c.name} color={(i % 5) + 1} />
                      <div className="strong">{c.name}</div>
                    </div>
                  </td>
                  <td className="muted">{c.city}</td>
                  <td><Badge sq>{c.terms}</Badge></td>
                  <td className="num">{c.orders}</td>
                  <td className="num">{fmtINR(c.ytd)}</td>
                  <td className="num">{fmtINR(Math.round(c.ytd * 0.18))}</td>
                  <td>
                    {c.status === "hold"
                      ? <Badge tone="warning" dot>Hold</Badge>
                      : c.status === "prospect"
                        ? <Badge tone="info" dot>Prospect</Badge>
                        : <Badge tone="success" dot>Active</Badge>}
                  </td>
                  <td>
                    <Btn variant="ghost" size="sm" iconRight="chevRight">View</Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <EntityFormModal
        open={open}
        onClose={() => setOpen(false)}
        title="Add customer"
        wide
        submitLabel="Save customer"
        saving={saving}
        error={error}
        onSubmit={saveCustomer}
      >
        <FormGrid>
          <FormField label="Customer name">
            <FormInput value={form.values.name} onChange={(v) => form.setField("name", v)} />
          </FormField>
          <FormField label="Company type">
            <FormSelect value={form.values.companyType} onChange={(v) => form.setField("companyType", v)}>
              <option>Private Limited</option><option>Public Limited</option><option>LLP</option><option>Proprietorship</option>
            </FormSelect>
          </FormField>
          <FormField label="GSTIN">
            <FormInput value={form.values.gstin} onChange={(v) => form.setField("gstin", v)} placeholder="27AAAAA0000A1Z5" />
          </FormField>
          <FormField label="PAN">
            <FormInput value={form.values.pan} onChange={(v) => form.setField("pan", v)} />
          </FormField>
          <FormField label="Primary contact">
            <FormInput value={form.values.contact} onChange={(v) => form.setField("contact", v)} />
          </FormField>
          <FormField label="Phone">
            <FormInput value={form.values.phone} onChange={(v) => form.setField("phone", v)} />
          </FormField>
          <FormField label="Email">
            <FormInput value={form.values.email} onChange={(v) => form.setField("email", v)} />
          </FormField>
          <FormField label="City, State">
            <FormInput value={form.values.city} onChange={(v) => form.setField("city", v)} />
          </FormField>
          <FormField label="Payment terms">
            <FormSelect value={form.values.terms} onChange={(v) => form.setField("terms", v)}>
              <option>Net 30</option><option>Net 45</option><option>Net 60</option><option>Advance</option>
            </FormSelect>
          </FormField>
          <FormField label="Credit limit">
            <FormInput value={form.values.creditLimit} onChange={(v) => form.setField("creditLimit", v)} />
          </FormField>
          <FormField label="Assigned to">
            <FormSelect value={form.values.assignedTo || salesReps[0]?.name || ""} onChange={(v) => form.setField("assignedTo", v)}>
              {salesReps.map((e) => <option key={e.id} value={e.name}>{e.name}</option>)}
            </FormSelect>
          </FormField>
          <FormField label="Applies to">
            <FormSelect value={form.values.appliesTo} onChange={(v) => form.setField("appliesTo", v)}>
              <option>Both</option><option>SMI only</option><option>Microns only</option>
            </FormSelect>
          </FormField>
        </FormGrid>
      </EntityFormModal>
    </>
  );
};

/* ============================================================
   CUSTOMER ORDERS
   ============================================================ */
const orderFormInit = {
  customer: "",
  soNumber: "",
  requiredBy: "",
  product: "",
  qty: "24",
  rate: "74000",
  packaging: "FIBC 1000 kg (4-loop)",
  transport: "FOR · destination",
  priority: "Standard",
};

const CustomerOrders = () => {
  const DATA = useDATA();
  const { append, saving, error, clearError } = useEntityMutation();
  const [newOrder, setNewOrder] = useState(false);
  const [tab, setTab] = useState("all");
  const form = useFormState({
    ...orderFormInit,
    customer: DATA.CUSTOMERS[0]?.name ?? "",
    soNumber: nextOrderId(DATA.ORDERS),
    requiredBy: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
  });

  const ORDERS_EXT = DATA.ORDERS;
  const openOrders = ORDERS_EXT.filter((o) => o.status !== "delivered").length;
  const bookValue = ORDERS_EXT.reduce((s, o) => s + o.value, 0);
  const atRisk = ORDERS_EXT.filter((o) => o.progress < 50 && o.status !== "delivered").length;

  const filtered = tab === "all" ? ORDERS_EXT : ORDERS_EXT.filter(o => o.status === tab);

  const saveOrder = async (asDraft: boolean) => {
    const err = requireFields(form.values, ["customer", "product", "qty"]);
    if (err) throw new Error(err);
    const qtyNum = parseFloat(String(form.values.qty).replace(/[^\d.]/g, "")) || 0;
    const rate = parseFloat(String(form.values.rate).replace(/[^\d.]/g, "")) || 0;
    const value = Math.round(qtyNum * rate);
    await append("orders", {
      id: form.values.soNumber || nextOrderId(DATA.ORDERS),
      customer: form.values.customer,
      product: form.values.product,
      qty: `${qtyNum} MT`,
      value,
      due: formatDueDate(form.values.requiredBy),
      status: asDraft ? "scheduled" : "in-production",
      progress: asDraft ? 0 : 10,
    });
    setNewOrder(false);
    form.reset({
      ...orderFormInit,
      customer: DATA.CUSTOMERS[0]?.name ?? "",
      soNumber: nextOrderId([...DATA.ORDERS, { id: form.values.soNumber }]),
      requiredBy: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    });
  };

  return (
    <>
      <DashHead title="Customer Orders" sub="Sales orders across both companies">
        <Btn icon="filter" size="sm">Filters</Btn>
        <Btn icon="download" size="sm">Export</Btn>
        <Btn variant="primary" size="sm" icon="plus" onClick={() => { clearError(); setNewOrder(true); }}>New order</Btn>
      </DashHead>

      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <div className="kpi"><div className="kpi-label"><Icon name="ticket" size={13} className="ico" />Open orders</div><div className="kpi-value tabular">{openOrders}</div><div style={{ fontSize: 11, color: "var(--success)" }}>{ORDERS_EXT.length} total</div></div>
        <div className="kpi"><div className="kpi-label"><Icon name="money" size={13} className="ico" />Order book value</div><div className="kpi-value">{fmtINR(bookValue)}</div><div style={{ fontSize: 11, color: "var(--fg-muted)" }}>From database</div></div>
        <div className="kpi"><div className="kpi-label"><Icon name="bolt" size={13} className="ico" />Delivered</div><div className="kpi-value tabular">{ORDERS_EXT.filter((o) => o.status === "delivered").length}</div><div style={{ fontSize: 11, color: "var(--success)" }}>Completed</div></div>
        <div className="kpi"><div className="kpi-label"><Icon name="alert" size={13} className="ico" />At-risk orders</div><div className="kpi-value" style={{ color: atRisk ? "var(--warning)" : undefined }}>{atRisk}</div><div style={{ fontSize: 11, color: "var(--fg-muted)" }}>Progress under 50%</div></div>
      </div>

      <div className="card">
        <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center" }}>
          <div className="tabs" style={{ border: "none", marginBottom: -1 }}>
            {[
              ["all", "All", ORDERS_EXT.length],
              ["scheduled", "Scheduled", ORDERS_EXT.filter(o => o.status === "scheduled").length],
              ["in-production", "In production", ORDERS_EXT.filter(o => o.status === "in-production").length],
              ["dispatched", "Dispatched", ORDERS_EXT.filter(o => o.status === "dispatched").length],
              ["delivered", "Delivered", ORDERS_EXT.filter(o => o.status === "delivered").length],
            ].map(([k, l, c]) => (
              <span key={k} className={`tab ${tab === k ? "active" : ""}`} onClick={() => setTab(k)}>
                {l} <span className="tab-count">{c}</span>
              </span>
            ))}
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <input className="input" placeholder="Search by SO #, customer, product…" style={{ height: 30, width: 240 }} />
            <Btn size="sm" icon="sort">Sort</Btn>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>SO #</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Qty</th>
                <th style={{ textAlign: "right" }}>Value</th>
                <th>Due</th>
                <th>Progress</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id}>
                  <td className="mono strong">{o.id}</td>
                  <td>{o.customer}</td>
                  <td className="muted">{o.product}</td>
                  <td className="num">{o.qty}</td>
                  <td className="num">{fmtINRFull(o.value)}</td>
                  <td className="num nowrap">{o.due}</td>
                  <td style={{ width: 140 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Bar value={o.progress} tone={o.progress === 100 ? "success" : "primary"} />
                      <span className="mono" style={{ fontSize: 11, width: 32, textAlign: "right" }}>{o.progress}%</span>
                    </div>
                  </td>
                  <td><StatusBadge status={o.status} /></td>
                  <td><Btn variant="ghost" size="sm" iconRight="chevRight">Open</Btn></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <EntityFormModal
        open={newOrder}
        onClose={() => setNewOrder(false)}
        title="Create sales order"
        wide
        submitLabel="Confirm & schedule"
        secondaryLabel="Save draft"
        saving={saving}
        error={error}
        onSubmit={() => saveOrder(false)}
        onSecondary={() => saveOrder(true)}
      >
        <FormGrid>
          <FormField label="Customer">
            <FormSelect value={form.values.customer} onChange={(v) => form.setField("customer", v)}>
              {DATA.CUSTOMERS.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </FormSelect>
          </FormField>
          <FormField label="SO number">
            <FormInput value={form.values.soNumber} onChange={(v) => form.setField("soNumber", v)} />
          </FormField>
          <FormField label="Required by">
            <FormInput type="date" value={form.values.requiredBy} onChange={(v) => form.setField("requiredBy", v)} />
          </FormField>
          <FormField label="Product">
            <FormInput value={form.values.product} onChange={(v) => form.setField("product", v)} placeholder="Talcum Powder · 600 mesh" />
          </FormField>
          <FormField label="Qty (MT)">
            <FormInput value={form.values.qty} onChange={(v) => form.setField("qty", v)} />
          </FormField>
          <FormField label="Rate (₹)">
            <FormInput value={form.values.rate} onChange={(v) => form.setField("rate", v)} />
          </FormField>
        </FormGrid>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 14 }}>
          <FormField label="Packaging">
            <FormSelect value={form.values.packaging} onChange={(v) => form.setField("packaging", v)}>
              <option>FIBC 1000 kg (4-loop)</option><option>PP Woven 50 kg</option><option>BOPP 20 kg</option><option>Bulk loose</option>
            </FormSelect>
          </FormField>
          <FormField label="Transport">
            <FormSelect value={form.values.transport} onChange={(v) => form.setField("transport", v)}>
              <option>FOR · destination</option><option>Ex-works</option><option>Customer pickup</option>
            </FormSelect>
          </FormField>
          <FormField label="Priority">
            <FormSelect value={form.values.priority} onChange={(v) => form.setField("priority", v)}>
              <option>Standard</option><option>Rush</option><option>Critical</option>
            </FormSelect>
          </FormField>
        </div>
      </EntityFormModal>
    </>
  );
};

/* ============================================================
   FIELD SALES / BEAT TRACKING (with territory map)
   ============================================================ */
const FieldSales = () => {
  const DATA = useDATA();
  const { append, update, saving, error, clearError } = useEntityMutation();
  const [openVisit, setOpenVisit] = useState(null);
  const [planOpen, setPlanOpen] = useState(false);
  const [visitNote, setVisitNote] = useState("");
  const salesReps = DATA.EMPLOYEES.filter((e) => e.dept === "Sales");
  const [planRep, setPlanRep] = useState(salesReps[0]?.name ?? "");
  const [planDate, setPlanDate] = useState(new Date().toISOString().slice(0, 10));
  const [planTerritory, setPlanTerritory] = useState("Mumbai Metro");
  const [planVisits, setPlanVisits] = useState([
    { customer: "Asian Paints HO", slot: "10:30 AM", type: "Existing" },
    { customer: "Pidilite Andheri", slot: "12:00 PM", type: "Existing" },
  ]);
  const [planNotes, setPlanNotes] = useState("");

  const completedVisits = DATA.FIELD_VISITS.filter((v) => v.status === "completed").length;
  const pipelineValue = DATA.ORDERS.filter((o) => o.status === "scheduled").reduce((s, o) => s + o.value, 0);

  const publishBeat = async (draft: boolean) => {
    let visits = [...DATA.FIELD_VISITS];
    for (const row of planVisits) {
      if (!row.customer.trim()) continue;
      const item = {
        id: nextFieldVisitId(visits),
        rep: planRep,
        customer: row.customer.trim(),
        city: planTerritory.split(" ")[0] ?? planTerritory,
        status: draft ? "scheduled" : "in-progress",
        ts: planDate,
        outcome: draft ? `Draft: ${planNotes}` : planNotes || "—",
      };
      await append("fieldVisits", item);
      visits.push(item);
    }
    setPlanOpen(false);
    setPlanVisits([{ customer: "", slot: "10:00 AM", type: "Existing" }]);
    setPlanNotes("");
  };

  const saveVisitNotes = async () => {
    if (!openVisit) return;
    await update("fieldVisits", openVisit.id, {
      outcome: visitNote || openVisit.outcome,
      status: "completed",
    });
    setOpenVisit(null);
  };

  return (
    <>
      <DashHead title="Field Sales · Beat Tracking" sub="Visit log, territory map, check-in/check-out">
        <Btn size="sm" icon="calendar">Today</Btn>
        <Btn size="sm" icon="map">Territories</Btn>
        <Btn variant="primary" size="sm" icon="plus" onClick={() => { clearError(); setPlanOpen(true); }}>Plan beat</Btn>
      </DashHead>

      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <div className="kpi"><div className="kpi-label"><Icon name="user" size={13} className="ico" />Sales reps</div><div className="kpi-value tabular">{salesReps.length}</div><div style={{ fontSize: 11, color: "var(--success)" }}>In database</div></div>
        <div className="kpi"><div className="kpi-label"><Icon name="pin" size={13} className="ico" />Visits logged</div><div className="kpi-value tabular">{DATA.FIELD_VISITS.length}</div><div style={{ fontSize: 11, color: "var(--success)" }}>{completedVisits} completed</div></div>
        <div className="kpi"><div className="kpi-label"><Icon name="check" size={13} className="ico" />Scheduled orders</div><div className="kpi-value tabular">{DATA.ORDERS.filter((o) => o.status === "scheduled").length}</div><div style={{ fontSize: 11, color: "var(--success)" }}>Pipeline</div></div>
        <div className="kpi"><div className="kpi-label"><Icon name="money" size={13} className="ico" />Pipeline value</div><div className="kpi-value">{fmtINR(pipelineValue)}</div><div style={{ fontSize: 11, color: "var(--fg-muted)" }}>Scheduled SOs</div></div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1.4fr 1fr", marginBottom: 20 }}>
        <div className="card">
          <div className="card-head">
            <div className="card-title"><Icon name="map" size={14} /> Territory map · West India</div>
            <div className="row">
              <Badge tone="primary" dot>4 reps live</Badge>
              <Badge tone="success" dot>3 done</Badge>
              <Badge tone="warning" dot>1 active</Badge>
            </div>
          </div>
          <div className="card-body">
            <TerritoryMap />
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title"><Icon name="user" size={14} /> Reps live now</div>
            <Btn variant="ghost" size="sm">All</Btn>
          </div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { name: "Karan Singh",    loc: "Andheri E, Mumbai", status: "checked-in", at: "Pidilite", time: "23 min", color: 2 },
              { name: "Pooja Aggarwal", loc: "BKC, Mumbai",       status: "in-transit", at: "Berger HQ", time: "ETA 8m", color: 5 },
              { name: "Amit Reddy",     loc: "Vatva, Ahmedabad",  status: "checked-in", at: "Nirma Plant", time: "1h 4m", color: 3 },
              { name: "Sneha Patil",    loc: "Pune", status: "checked-out", at: "Bharat Forge", time: "Done 15m", color: 4 },
            ].map((r) => (
              <div key={r.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar name={r.name} color={r.color} size="lg" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</span>
                    <span className={`dot ${r.status === "checked-in" ? "success" : r.status === "in-transit" ? "warning" : ""}`}></span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>
                    {r.status === "checked-in" ? `Visiting ${r.at}` : r.status === "in-transit" ? `→ ${r.at}` : `Visited ${r.at}`}
                    <span style={{ opacity: 0.5 }}> · </span>{r.loc}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "var(--fg-subtle)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>{r.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title"><Icon name="speech" size={14} /> Field visit log</div>
          <div style={{ display: "flex", gap: 8 }}>
            <select className="input" style={{ height: 30, width: 160 }}><option>All reps</option><option>Karan Singh</option><option>Pooja Aggarwal</option></select>
            <Btn size="sm" icon="download">Export</Btn>
          </div>
        </div>
        <div className="card-body flush">
          <table className="tbl">
            <thead>
              <tr>
                <th>Visit #</th><th>Rep</th><th>Customer</th><th>City</th><th>When</th><th>Status</th><th>Outcome</th><th></th>
              </tr>
            </thead>
            <tbody>
              {DATA.FIELD_VISITS.map((v, i) => (
                <tr key={v.id} onClick={() => { setVisitNote(v.outcome); setOpenVisit(v); }} style={{ cursor: "pointer" }}>
                  <td className="mono strong">{v.id}</td>
                  <td><div style={{ display: "flex", alignItems: "center", gap: 8 }}><Avatar name={v.rep} color={(i % 5) + 1} />{v.rep}</div></td>
                  <td className="strong">{v.customer}</td>
                  <td className="muted">{v.city}</td>
                  <td className="muted">{v.ts}</td>
                  <td><StatusBadge status={v.status} /></td>
                  <td className="muted">{v.outcome}</td>
                  <td><Icon name="chevRight" size={13} className="subtle" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <EntityFormModal
        open={!!openVisit}
        onClose={() => setOpenVisit(null)}
        title={openVisit ? `Visit ${openVisit.id}` : ""}
        sub={openVisit ? `${openVisit.rep} at ${openVisit.customer}` : ""}
        wide
        submitLabel="Save visit"
        saving={saving}
        error={error}
        onSubmit={saveVisitNotes}
      >
        {openVisit && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div className="card" style={{ padding: 14 }}>
                <div style={{ fontSize: 10, color: "var(--fg-subtle)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: 8 }}>CHECK-IN</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{openVisit.ts}</div>
                <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>{openVisit.customer}, {openVisit.city}</div>
              </div>
              <div className="card" style={{ padding: 14 }}>
                <div style={{ fontSize: 10, color: "var(--fg-subtle)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: 8 }}>STATUS</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}><StatusBadge status={openVisit.status} /></div>
                <div style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 6 }}>{openVisit.outcome}</div>
              </div>
            </div>
            <FormField label="Meeting notes">
              <textarea className="input" rows={4} value={visitNote || openVisit.outcome} onChange={(e) => setVisitNote(e.target.value)} />
            </FormField>
          </>
        )}
      </EntityFormModal>

      <EntityFormModal
        open={planOpen}
        onClose={() => setPlanOpen(false)}
        title="Plan beat"
        sub="Schedule field visits for a rep"
        wide
        submitLabel="Publish beat plan"
        secondaryLabel="Save as draft"
        saving={saving}
        error={error}
        onSubmit={() => publishBeat(false)}
        onSecondary={() => publishBeat(true)}
      >
        <FormGrid cols={3}>
          <FormField label="Rep">
            <FormSelect value={planRep} onChange={setPlanRep}>
              {salesReps.map((e) => <option key={e.id} value={e.name}>{e.name}</option>)}
            </FormSelect>
          </FormField>
          <FormField label="Date">
            <FormInput type="date" value={planDate} onChange={setPlanDate} />
          </FormField>
          <FormField label="Territory">
            <FormSelect value={planTerritory} onChange={setPlanTerritory}>
              <option>Mumbai Metro</option><option>Ahmedabad</option><option>Pune</option><option>Kolkata</option>
            </FormSelect>
          </FormField>
        </FormGrid>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.04em", margin: "16px 0 8px" }}>VISITS</div>
        <div className="card" style={{ borderRadius: 8, overflow: "hidden", marginBottom: 14 }}>
          <table className="tbl">
            <thead><tr><th>Customer</th><th style={{ width: 110 }}>Slot</th><th style={{ width: 130 }}>Visit type</th><th style={{ width: 30 }}></th></tr></thead>
            <tbody>
              {planVisits.map((v, i) => (
                <tr key={i}>
                  <td><input className="input" value={v.customer} onChange={(e) => { const n = [...planVisits]; n[i] = { ...n[i], customer: e.target.value }; setPlanVisits(n); }} /></td>
                  <td><input className="input" value={v.slot} onChange={(e) => { const n = [...planVisits]; n[i] = { ...n[i], slot: e.target.value }; setPlanVisits(n); }} /></td>
                  <td>
                    <select className="input" value={v.type} onChange={(e) => { const n = [...planVisits]; n[i] = { ...n[i], type: e.target.value }; setPlanVisits(n); }}>
                      <option>Existing</option><option>Prospect</option><option>Follow-up</option>
                    </select>
                  </td>
                  <td><button type="button" className="tb-iconbtn" onClick={() => setPlanVisits(planVisits.filter((_, j) => j !== i))}><Icon name="x" size={12} /></button></td>
                </tr>
              ))}
              <tr><td colSpan={4} style={{ padding: 0 }}>
                <Btn variant="ghost" size="sm" icon="plus" className="block" style={{ borderRadius: 0, justifyContent: "flex-start", padding: "8px 14px" }} onClick={() => setPlanVisits([...planVisits, { customer: "", slot: "10:00 AM", type: "Existing" }])}>Add visit</Btn>
              </td></tr>
            </tbody>
          </table>
        </div>
        <FormField label="Notes">
          <textarea className="input" rows={2} placeholder="Briefing for the rep…" value={planNotes} onChange={(e) => setPlanNotes(e.target.value)} />
        </FormField>
      </EntityFormModal>
    </>
  );
};

/* ---------- Territory map for field sales ---------- */
const TerritoryMap = () => {
  // Mumbai metro + nearby
  const customers = [
    { x: 22, y: 78, n: "Asian Paints",  s: "done" },
    { x: 32, y: 65, n: "Pidilite",      s: "active" },
    { x: 42, y: 70, n: "Berger HQ",     s: "next" },
    { x: 52, y: 85, n: "Kansai",        s: "next" },
    { x: 18, y: 55, n: "Akzo Nobel",    s: "next" },
    { x: 70, y: 45, n: "Nirma",         s: "done" },
    { x: 60, y: 55, n: "Bharat Forge",  s: "done" },
    { x: 80, y: 72, n: "JK Cement",     s: "next" },
  ];
  const reps = [
    { x: 32, y: 65, name: "K", color: "var(--secondary)" },     // Karan at Pidilite
    { x: 36, y: 68, name: "P", color: "var(--primary)" },        // Pooja en-route
    { x: 70, y: 45, name: "A", color: "var(--info)" },           // Amit at Nirma
  ];
  // Territory boundaries (rough polygons)
  return (
    <div className="map-frame" style={{ height: 340, position: "relative" }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
        {/* Territory polygons */}
        <polygon points="5,50 45,40 55,90 5,95" fill="rgba(55,77,149,0.05)" stroke="rgba(55,77,149,0.3)" strokeWidth="0.3" strokeDasharray="1 1" />
        <polygon points="45,40 55,90 95,80 90,30" fill="rgba(232,169,1,0.05)" stroke="rgba(232,169,1,0.3)" strokeWidth="0.3" strokeDasharray="1 1" />
        {/* Connecting lines from rep K to next */}
        <line x1="32" y1="65" x2="42" y2="70" stroke="var(--primary)" strokeWidth="0.4" strokeDasharray="1 1" opacity="0.6" />
      </svg>

      {/* Territory labels */}
      <div style={{ position: "absolute", left: "20%", top: "70%", fontSize: 10, color: "var(--primary)", fontWeight: 600, opacity: 0.7, pointerEvents: "none" }}>WEST · KARAN</div>
      <div style={{ position: "absolute", left: "65%", top: "58%", fontSize: 10, color: "var(--warning)", fontWeight: 600, opacity: 0.7, pointerEvents: "none" }}>NORTH · AMIT</div>

      {/* Customers as pins */}
      {customers.map((c, i) => (
        <div key={i} style={{
          position: "absolute", left: `${c.x}%`, top: `${c.y}%`,
          transform: "translate(-50%, -100%)",
          pointerEvents: "none",
        }}>
          <div style={{
            width: 20, height: 20, borderRadius: "50% 50% 50% 0",
            transform: "rotate(-45deg)",
            background: c.s === "done" ? "var(--success)" : c.s === "active" ? "var(--secondary)" : "white",
            border: c.s === "next" ? "2px solid var(--fg-muted)" : "none",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            position: "relative",
          }}>
            <span style={{
              transform: "rotate(45deg)",
              position: "absolute", inset: 0, display: "grid", placeItems: "center",
              color: "white", fontSize: 10,
            }}>
              {c.s === "done" ? <Icon name="check" size={10} stroke={2.5} /> : null}
            </span>
          </div>
          <div style={{
            position: "absolute", left: "50%", top: "calc(100% + 4px)",
            transform: "translateX(-50%)",
            fontSize: 10, fontWeight: 500, color: "var(--fg)",
            whiteSpace: "nowrap", background: "rgba(255,255,255,0.85)",
            padding: "1px 5px", borderRadius: 3,
          }}>{c.n}</div>
        </div>
      ))}

      {/* Rep avatars (live) */}
      {reps.map((r, i) => (
        <div key={i} style={{
          position: "absolute", left: `${r.x}%`, top: `${r.y}%`,
          transform: "translate(-50%, -50%)",
          width: 32, height: 32, borderRadius: "50%",
          background: r.color, color: "white",
          display: "grid", placeItems: "center",
          fontWeight: 700, fontSize: 14, border: "3px solid white",
          boxShadow: "0 4px 10px rgba(0,0,0,0.18)",
          zIndex: 5,
        }}>
          {r.name}
          <span style={{
            position: "absolute", inset: -6, borderRadius: "50%",
            background: r.color, opacity: 0.3,
            animation: "pulse 1.8s ease-in-out infinite",
          }}></span>
        </div>
      ))}

      {/* Legend */}
      <div style={{
        position: "absolute", bottom: 12, right: 12,
        background: "white", border: "1px solid var(--border)",
        borderRadius: 8, padding: "8px 12px", fontSize: 11,
        display: "flex", flexDirection: "column", gap: 4,
        boxShadow: "var(--shadow-sm)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="dot success"></span> Visited</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="dot gold"></span> Active</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="dot" style={{ background: "white", border: "1.5px solid var(--fg-muted)" }}></span> Scheduled</div>
      </div>
    </div>
  );
};

/* ============================================================
   INVOICE VERIFICATION
   ============================================================ */
const InvoiceVerify = () => {
  const DATA = useDATA();
  const { append, update, saving, error, clearError } = useEntityMutation();
  const [open, setOpen] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [verifierNote, setVerifierNote] = useState("");
  const [uploadForm, setUploadForm] = useState({ po: "", vendor: "", invAmt: "", poAmt: "" });

  const INVOICES = DATA.INVOICES;
  const matched = INVOICES.filter((i) => i.status === "matched");
  const mismatched = INVOICES.filter((i) => i.status === "mismatch");
  const passRate = INVOICES.length ? Math.round((matched.length / INVOICES.length) * 100) : 0;
  const avgDiff = mismatched.length
    ? Math.round(mismatched.reduce((s, i) => s + Math.abs(i.invAmt - i.poAmt), 0) / mismatched.length)
    : 0;

  const approveInvoice = async () => {
    if (!open) return;
    await update("invoices", open.id, {
      status: "matched",
      reason: verifierNote || "Approved with note",
    });
    setOpen(null);
    setVerifierNote("");
  };

  const rejectInvoice = async () => {
    if (!open) return;
    await update("invoices", open.id, {
      status: "mismatch",
      reason: verifierNote || "Rejected by verifier",
    });
    setOpen(null);
    setVerifierNote("");
  };

  const uploadInvoice = async () => {
    const invAmt = Number(uploadForm.invAmt) || 0;
    const poAmt = Number(uploadForm.poAmt) || 0;
    await append("invoices", {
      id: nextInvoiceId(INVOICES),
      po: uploadForm.po,
      vendor: uploadForm.vendor,
      invDate: formatDisplayDate(),
      invAmt,
      poAmt,
      status: invAmt === poAmt ? "matched" : "mismatch",
      reason: invAmt === poAmt ? "—" : `₹${Math.abs(invAmt - poAmt).toLocaleString("en-IN")} diff`,
    });
    setUploadOpen(false);
    setUploadForm({ po: "", vendor: "", invAmt: "", poAmt: "" });
  };

  return (
    <>
      <DashHead title="Invoice Verification" sub="Auto-match invoices to POs · flag mismatches">
        <Btn size="sm" icon="upload" onClick={() => { clearError(); setUploadOpen(true); }}>Upload invoice</Btn>
        <Btn variant="primary" size="sm" icon="bolt">Auto-match queue</Btn>
      </DashHead>

      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <div className="kpi"><div className="kpi-label"><Icon name="invoice" size={13} className="ico" />Pending verification</div><div className="kpi-value tabular">{INVOICES.length}</div><div style={{ fontSize: 11, color: "var(--fg-muted)" }}>Total this month</div></div>
        <div className="kpi"><div className="kpi-label"><Icon name="check" size={13} className="ico" />Auto-matched</div><div className="kpi-value tabular" style={{ color: "var(--success)" }}>{matched.length}</div><div style={{ fontSize: 11, color: "var(--success)" }}>{passRate}% pass rate</div></div>
        <div className="kpi"><div className="kpi-label"><Icon name="alert" size={13} className="ico" />Mismatched</div><div className="kpi-value tabular" style={{ color: "var(--danger)" }}>{mismatched.length}</div><div style={{ fontSize: 11, color: "var(--fg-muted)" }}>Avg diff ₹{avgDiff.toLocaleString("en-IN")}</div></div>
        <div className="kpi"><div className="kpi-label"><Icon name="money" size={13} className="ico" />Total amount</div><div className="kpi-value">{fmtINR(INVOICES.reduce((s, i) => s + i.invAmt, 0))}</div><div style={{ fontSize: 11, color: "var(--fg-muted)" }}>To verify</div></div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title"><Icon name="invoice" size={14} /> Invoices awaiting verification</div>
          <div className="tabs" style={{ border: "none" }}>
            <span className="tab active">All <span className="tab-count">{INVOICES.length}</span></span>
            <span className="tab">Mismatched <span className="tab-count">{INVOICES.filter(i => i.status === "mismatch").length}</span></span>
            <span className="tab">Auto-matched <span className="tab-count">{INVOICES.filter(i => i.status === "matched").length}</span></span>
          </div>
        </div>
        <div className="card-body flush" style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Invoice #</th><th>PO</th><th>Vendor</th><th>Invoice date</th>
                <th style={{ textAlign: "right" }}>Invoice ₹</th>
                <th style={{ textAlign: "right" }}>PO ₹</th>
                <th style={{ textAlign: "right" }}>Diff</th>
                <th>Reason</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {INVOICES.length === 0 ? (
                <tr>
                  <td colSpan={10} className="muted" style={{ textAlign: "center", padding: 32 }}>
                    No invoices in the database. Run <code>npm run seed</code> to load demo data.
                  </td>
                </tr>
              ) : null}
              {INVOICES.map((inv) => {
                const diff = inv.invAmt - inv.poAmt;
                return (
                  <tr key={inv.id} onClick={() => setOpen(inv)} style={{ cursor: "pointer" }}>
                    <td className="mono strong">{inv.id}</td>
                    <td className="mono">{inv.po}</td>
                    <td>{inv.vendor}</td>
                    <td className="muted">{inv.invDate}</td>
                    <td className="num">{fmtINRFull(inv.invAmt)}</td>
                    <td className="num">{fmtINRFull(inv.poAmt)}</td>
                    <td className="num" style={{ color: diff > 0 ? "var(--danger)" : "var(--fg-muted)", fontWeight: diff > 0 ? 600 : 400 }}>
                      {diff > 0 ? `+₹${diff.toLocaleString("en-IN")}` : "—"}
                    </td>
                    <td className="muted" style={{ fontSize: 12 }}>{inv.reason}</td>
                    <td><StatusBadge status={inv.status === "matched" ? "verified" : "mismatch"} /></td>
                    <td>
                      {inv.status === "matched"
                        ? <Btn variant="ghost" size="sm">View</Btn>
                        : <Btn variant="primary" size="sm">Review</Btn>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <EntityFormModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="Upload invoice"
        sub="Register invoice for verification (metadata only)"
        wide
        submitLabel="Save invoice"
        saving={saving}
        error={error}
        onSubmit={uploadInvoice}
      >
        <FormGrid>
          <FormField label="PO number">
            <FormSelect value={uploadForm.po} onChange={(v) => {
              const po = DATA.PURCHASE_ORDERS.find((p) => p.id === v);
              setUploadForm({ po: v, vendor: po?.vendor ?? uploadForm.vendor, invAmt: String(po?.total ?? ""), poAmt: String(po?.total ?? "") });
            }}>
              <option value="">Select PO</option>
              {DATA.PURCHASE_ORDERS.map((p) => <option key={p.id} value={p.id}>{p.id} — {p.vendor}</option>)}
            </FormSelect>
          </FormField>
          <FormField label="Vendor">
            <FormInput value={uploadForm.vendor} onChange={(v) => setUploadForm({ ...uploadForm, vendor: v })} />
          </FormField>
          <FormField label="Invoice amount (₹)">
            <FormInput value={uploadForm.invAmt} onChange={(v) => setUploadForm({ ...uploadForm, invAmt: v })} />
          </FormField>
          <FormField label="PO amount (₹)">
            <FormInput value={uploadForm.poAmt} onChange={(v) => setUploadForm({ ...uploadForm, poAmt: v })} />
          </FormField>
        </FormGrid>
      </EntityFormModal>

      <Modal open={!!open} onClose={() => setOpen(null)} title={open ? `Verify ${open.id}` : ""} sub={open ? `vs ${open.po} · ${open.vendor}` : ""} wide
        footer={<>
          <Btn variant="ghost" onClick={() => setOpen(null)} disabled={saving}>Cancel</Btn>
          <Btn variant="danger" onClick={rejectInvoice} disabled={saving}>Reject</Btn>
          <Btn variant="primary" onClick={approveInvoice} disabled={saving}>{saving ? "Saving…" : "Approve with diff"}</Btn>
        </>}>
        {open && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div className="card" style={{ padding: 14 }}>
                <div style={{ fontSize: 10, color: "var(--fg-subtle)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: 10 }}>PURCHASE ORDER</div>
                <div className="mono strong" style={{ fontSize: 14, marginBottom: 4 }}>{open.po}</div>
                <div style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 12 }}>{open.vendor}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span className="muted">Subtotal</span><span className="mono">₹{Math.round(open.poAmt / 1.18).toLocaleString("en-IN")}</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span className="muted">GST (18%)</span><span className="mono">₹{Math.round(open.poAmt * 0.18 / 1.18).toLocaleString("en-IN")}</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 6, borderTop: "1px solid var(--border)" }}>
                    <span style={{ fontWeight: 600 }}>Total</span>
                    <span className="mono" style={{ fontWeight: 600 }}>₹{open.poAmt.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
              <div className="card" style={{ padding: 14, border: open.status === "mismatch" ? "1px solid var(--danger)" : "1px solid var(--border)", background: open.status === "mismatch" ? "var(--danger-soft)" : "var(--bg-elev)" }}>
                <div style={{ fontSize: 10, color: "var(--fg-subtle)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: 10 }}>VENDOR INVOICE</div>
                <div className="mono strong" style={{ fontSize: 14, marginBottom: 4 }}>{open.id}</div>
                <div style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 12 }}>{open.invDate}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span className="muted">Subtotal</span><span className="mono">₹{Math.round(open.invAmt / 1.18).toLocaleString("en-IN")}</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span className="muted">GST (18%)</span><span className="mono">₹{Math.round(open.invAmt * 0.18 / 1.18).toLocaleString("en-IN")}</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 6, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                    <span style={{ fontWeight: 600 }}>Total</span>
                    <span className="mono" style={{ fontWeight: 600, color: open.status === "mismatch" ? "var(--danger)" : "var(--fg)" }}>₹{open.invAmt.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            </div>
            {open.status === "mismatch" && (
              <div style={{ padding: 12, background: "var(--warning-soft)", border: "1px solid var(--warning)", borderRadius: 8, display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 14 }}>
                <Icon name="alert" size={16} style={{ color: "var(--warning)", flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Difference detected: {open.reason}</div>
                  <div style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 2 }}>
                    Variance is within 1% tolerance. Approve with note, or contact vendor for revised invoice.
                  </div>
                </div>
              </div>
            )}
            <FormField label="Verifier note">
              <textarea className="input" rows={3} placeholder="Reason for approval/rejection — visible in audit log…" value={verifierNote} onChange={(e) => setVerifierNote(e.target.value)} />
            </FormField>
            {error ? <p style={{ color: "var(--danger)", fontSize: 12 }}>{error}</p> : null}
          </div>
        )}
      </Modal>
    </>
  );
};

export { Customers, CustomerOrders, FieldSales, InvoiceVerify };
