// @ts-nocheck
'use client';


import React, { useState } from "react";
import { Icon } from "./icons";
import { useDATA } from "./data";
import { Btn, Badge, StatusBadge, Avatar, Bar, Sparkline, Kpi, Modal, fmtINR, fmtINRFull, fmtNum, AreaChart, BarChart, Donut } from "./ui";
import { EntityFormModal, FormField, FormGrid, FormInput, FormSelect, useFormState, requireFields } from "@/components/forms";
import { useEntityMutation } from "@/hooks/use-entity-mutation";
import { nextRawMaterialCode, nextVendorId, nextPoId, nextDispatchId, formatDisplayDate } from "@/lib/id-generators";
import { DashHead, SectionH } from "./dashboards";

/* ============================================================
   MODULE SCREENS — Inventory, Procurement, Dispatch, Users, DS
   ============================================================ */


/* ============================================================
   RAW MATERIAL INVENTORY
   ============================================================ */
const RawMaterialInventory = () => {
  const DATA = useDATA();
  const { append, update, saving, error, clearError } = useEntityMutation();
  const [addOpen, setAddOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(null);
  const [adjustQty, setAdjustQty] = useState("0");
  const addForm = useFormState({
    name: "",
    grade: "",
    stock: "20",
    unit: "MT",
    reorder: "25",
    location: "Plant A · Bay 1",
    rate: "74000",
  });

  const receiveStock = async () => {
    const err = requireFields(addForm.values, ["name", "grade"]);
    if (err) throw new Error(err);
    const stock = parseFloat(addForm.values.stock) || 0;
    const rate = parseFloat(addForm.values.rate) || 0;
    await append("rawMaterials", {
      code: nextRawMaterialCode(DATA.RAW_MATERIALS),
      name: addForm.values.name.trim(),
      grade: addForm.values.grade.trim(),
      stock,
      unit: addForm.values.unit,
      reorder: parseFloat(addForm.values.reorder) || 25,
      value: Math.round(stock * rate),
      location: addForm.values.location,
      status: stock <= parseFloat(addForm.values.reorder) ? "low" : "ok",
      trend: 0,
    });
    setAddOpen(false);
    addForm.reset({ name: "", grade: "", stock: "20", unit: "MT", reorder: "25", location: "Plant A · Bay 1", rate: "74000" });
  };

  const saveAdjustment = async () => {
    if (!adjustOpen) return;
    const delta = parseFloat(adjustQty) || 0;
    const newStock = Math.max(0, adjustOpen.stock + delta);
    const reorder = adjustOpen.reorder;
    let status = "ok";
    if (newStock <= 0) status = "critical";
    else if (newStock <= reorder) status = "low";
    await update("rawMaterials", adjustOpen.code, {
      stock: newStock,
      status,
      value: Math.round((newStock / Math.max(adjustOpen.stock, 1)) * adjustOpen.value),
    }, "code");
    setAdjustOpen(null);
    setAdjustQty("0");
  };

  const totalValue = DATA.RAW_MATERIALS.reduce((s, r) => s + r.value, 0);
  const lowCount = DATA.RAW_MATERIALS.filter(r => r.status === "low").length;
  const critCount = DATA.RAW_MATERIALS.filter(r => r.status === "critical").length;

  return (
    <>
      <DashHead title="Raw Material Inventory" sub="Minerals and chemicals · live stock & alerts">
        <Btn icon="filter" size="sm">Filters</Btn>
        <Btn icon="download" size="sm">Export</Btn>
        <Btn variant="primary" size="sm" icon="plus" onClick={() => { clearError(); setAddOpen(true); }}>Add stock</Btn>
      </DashHead>

      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <div className="kpi">
          <div className="kpi-label"><Icon name="box" size={13} className="ico" />Total SKUs</div>
          <div className="kpi-value tabular">{DATA.RAW_MATERIALS.length}</div>
          <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>6 minerals · 4 chemicals</div>
        </div>
        <div className="kpi">
          <div className="kpi-label"><Icon name="money" size={13} className="ico" />Inventory value</div>
          <div className="kpi-value">{fmtINR(totalValue)}</div>
          <div style={{ fontSize: 11, color: "var(--success)" }}>+4.8% vs last week</div>
        </div>
        <div className="kpi">
          <div className="kpi-label"><Icon name="alert" size={13} className="ico" />Low stock</div>
          <div className="kpi-value" style={{ color: lowCount > 0 ? "var(--warning)" : "var(--fg)" }}>{lowCount}</div>
          <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>Reorder recommended</div>
        </div>
        <div className="kpi">
          <div className="kpi-label"><Icon name="alert" size={13} className="ico" />Critical</div>
          <div className="kpi-value" style={{ color: "var(--danger)" }}>{critCount}</div>
          <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>Affects 2 active orders</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--border)" }}>
          <div className="tabs" style={{ border: "none", marginBottom: -1 }}>
            <span className="tab active">All <span className="tab-count">10</span></span>
            <span className="tab">Minerals <span className="tab-count">6</span></span>
            <span className="tab">Chemicals <span className="tab-count">4</span></span>
            <span className="tab">Alerts <span className="tab-count">3</span></span>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ position: "relative" }}>
              <Icon name="search" size={13} style={{ position: "absolute", left: 10, top: 9, color: "var(--fg-subtle)" }} />
              <input className="input" style={{ paddingLeft: 30, width: 220, height: 30 }} placeholder="Search SKU, name, grade…" />
            </div>
            <Btn size="sm" icon="sort">Sort</Btn>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 28 }}><input type="checkbox" /></th>
                <th>SKU</th>
                <th>Material</th>
                <th>Grade</th>
                <th>Location</th>
                <th style={{ textAlign: "right" }}>Stock</th>
                <th>Reorder at</th>
                <th>Stock level</th>
                <th style={{ textAlign: "right" }}>Value</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {DATA.RAW_MATERIALS.map((r) => {
                const pct = Math.min(100, (r.stock / (r.reorder * 3)) * 100);
                const tone = r.status === "critical" ? "danger" : r.status === "low" ? "warning" : "success";
                return (
                  <tr key={r.code}>
                    <td><input type="checkbox" /></td>
                    <td className="mono strong">{r.code}</td>
                    <td>
                      <div className="strong">{r.name}</div>
                    </td>
                    <td className="muted">{r.grade}</td>
                    <td className="muted">{r.location}</td>
                    <td style={{ textAlign: "right" }}>
                      <span className="mono strong">{r.stock}</span> <span className="subtle" style={{ fontSize: 11 }}>{r.unit}</span>
                    </td>
                    <td className="mono subtle">{r.reorder} {r.unit}</td>
                    <td style={{ width: 110 }}>
                      <Bar value={pct} tone={tone} />
                    </td>
                    <td style={{ textAlign: "right" }} className="mono">{fmtINR(r.value)}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        <Btn variant="ghost" size="sm" onClick={() => setAdjustOpen(r)}>Adjust</Btn>
                        <button className="tb-iconbtn"><Icon name="moreV" size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <EntityFormModal open={addOpen} onClose={() => setAddOpen(false)} title="Add stock" sub="Receive raw material into inventory" submitLabel="Receive stock" saving={saving} error={error} onSubmit={receiveStock}>
        <FormGrid>
          <FormField label="Material name"><FormInput value={addForm.values.name} onChange={(v) => addForm.setField("name", v)} /></FormField>
          <FormField label="Grade"><FormInput value={addForm.values.grade} onChange={(v) => addForm.setField("grade", v)} /></FormField>
          <FormField label="Quantity received"><FormInput value={addForm.values.stock} onChange={(v) => addForm.setField("stock", v)} /></FormField>
          <FormField label="Unit">
            <FormSelect value={addForm.values.unit} onChange={(v) => addForm.setField("unit", v)}><option>MT</option><option>KL</option></FormSelect>
          </FormField>
          <FormField label="Reorder at"><FormInput value={addForm.values.reorder} onChange={(v) => addForm.setField("reorder", v)} /></FormField>
          <FormField label="Rate (₹/unit)"><FormInput value={addForm.values.rate} onChange={(v) => addForm.setField("rate", v)} /></FormField>
          <FormField label="Location">
            <FormSelect value={addForm.values.location} onChange={(v) => addForm.setField("location", v)}>
              <option>Plant A · Bay 1</option><option>Plant A · Bay 2</option><option>Plant B · Tank 1</option>
            </FormSelect>
          </FormField>
        </FormGrid>
      </EntityFormModal>

      <EntityFormModal open={!!adjustOpen} onClose={() => setAdjustOpen(null)} title={adjustOpen ? `Adjust stock · ${adjustOpen.name}` : ""} sub={adjustOpen ? `Current: ${adjustOpen.stock} ${adjustOpen.unit}` : ""} submitLabel="Save adjustment" saving={saving} error={error} onSubmit={saveAdjustment}>
        <FormGrid>
          <FormField label="Adjustment (+/- qty)"><FormInput value={adjustQty} onChange={setAdjustQty} /></FormField>
        </FormGrid>
      </EntityFormModal>
    </>
  );
};

/* ============================================================
   VENDORS & PROCUREMENT (Vendors list + POs)
   ============================================================ */
const Vendors = () => {
  const DATA = useDATA();
  const { append, saving, error, clearError } = useEntityMutation();
  const [addVendor, setAddVendor] = useState(false);
  const [createPO, setCreatePO] = useState(false);
  const [tab, setTab] = useState("vendors");
  const vendorForm = useFormState({ name: "", category: "Raw Material", city: "" });
  const poForm = useFormState({
    vendor: DATA.VENDORS[0]?.name ?? "",
    poId: nextPoId(DATA.PURCHASE_ORDERS),
    total: "1840000",
    items: "3",
  });

  const saveVendor = async () => {
    const err = requireFields(vendorForm.values, ["name", "city"]);
    if (err) throw new Error(err);
    await append("vendors", {
      id: nextVendorId(DATA.VENDORS),
      name: vendorForm.values.name.trim(),
      city: vendorForm.values.city.trim(),
      category: vendorForm.values.category,
      poCount: 0,
      ytd: 0,
      rating: 4,
    });
    setAddVendor(false);
    vendorForm.reset({ name: "", category: "Raw Material", city: "" });
  };

  const savePO = async (draft: boolean) => {
    const err = requireFields(poForm.values, ["vendor"]);
    if (err) throw new Error(err);
    await append("purchaseOrders", {
      id: poForm.values.poId || nextPoId(DATA.PURCHASE_ORDERS),
      vendor: poForm.values.vendor,
      items: parseInt(poForm.values.items, 10) || 1,
      total: parseInt(poForm.values.total, 10) || 0,
      date: formatDisplayDate(),
      status: draft ? "pending" : "approved",
      invoice: "awaiting",
    });
    setCreatePO(false);
  };

  return (
    <>
      <DashHead title="Vendors & Procurement" sub="Manage vendors, purchase orders, and supplier history">
        <Btn icon="upload" size="sm">Import</Btn>
        <Btn icon="download" size="sm">Export</Btn>
        {tab === "vendors" ? (
          <Btn variant="primary" size="sm" icon="plus" onClick={() => setAddVendor(true)}>Add vendor</Btn>
        ) : (
          <Btn variant="primary" size="sm" icon="plus" onClick={() => setCreatePO(true)}>Create PO</Btn>
        )}
      </DashHead>

      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <div className="kpi">
          <div className="kpi-label"><Icon name="users" size={13} className="ico" />Active vendors</div>
          <div className="kpi-value tabular">{DATA.VENDORS.length}</div>
          <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>2 added this month</div>
        </div>
        <div className="kpi">
          <div className="kpi-label"><Icon name="cart" size={13} className="ico" />Open POs</div>
          <div className="kpi-value tabular">{DATA.PURCHASE_ORDERS.filter((p) => p.status !== "received").length}</div>
          <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>{DATA.PURCHASE_ORDERS.filter((p) => p.status === "pending").length} pending</div>
        </div>
        <div className="kpi">
          <div className="kpi-label"><Icon name="money" size={13} className="ico" />PO spend · MTD</div>
          <div className="kpi-value">{fmtINR(DATA.PURCHASE_ORDERS.reduce((s, p) => s + p.total, 0))}</div>
          <div style={{ fontSize: 11, color: "var(--success)" }}>From database</div>
        </div>
        <div className="kpi">
          <div className="kpi-label"><Icon name="alert" size={13} className="ico" />Invoice mismatches</div>
          <div className="kpi-value" style={{ color: "var(--danger)" }}>{DATA.INVOICES.filter((i) => i.status === "mismatch").length}</div>
          <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>Needs verification</div>
        </div>
      </div>

      <div className="card">
        <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)" }}>
          <div className="tabs" style={{ border: "none", marginBottom: -1 }}>
            <span className={`tab ${tab === "vendors" ? "active" : ""}`} onClick={() => setTab("vendors")}>
              Vendors <span className="tab-count">{DATA.VENDORS.length}</span>
            </span>
            <span className={`tab ${tab === "po" ? "active" : ""}`} onClick={() => setTab("po")}>
              Purchase Orders <span className="tab-count">{DATA.PURCHASE_ORDERS.length}</span>
            </span>
          </div>
        </div>
        {tab === "vendors" && (
          <div style={{ overflowX: "auto" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>ID</th><th>Vendor</th><th>Category</th><th style={{ textAlign: "center" }}>Rating</th><th>POs YTD</th><th style={{ textAlign: "right" }}>YTD Spend</th><th></th>
                </tr>
              </thead>
              <tbody>
                {DATA.VENDORS.map((v, i) => (
                  <tr key={v.id}>
                    <td className="mono strong">{v.id}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar name={v.name} color={(i % 5) + 1} />
                        <div>
                          <div className="strong">{v.name}</div>
                          <div className="subtle" style={{ fontSize: 11 }}>{v.city}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge tone={v.category === "Raw Material" ? "primary" : v.category === "Chemical" ? "info" : v.category === "Packaging" ? "gold" : "default"}>
                        {v.category}
                      </Badge>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <span style={{ color: "var(--secondary)" }}>★</span>
                        <span className="mono strong">{v.rating}</span>
                      </div>
                    </td>
                    <td className="mono">{v.poCount}</td>
                    <td className="num" style={{ textAlign: "right" }}>{fmtINR(v.ytd)}</td>
                    <td>
                      <Btn variant="ghost" size="sm" iconRight="chevRight">View</Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tab === "po" && (
          <div style={{ overflowX: "auto" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>PO #</th><th>Vendor</th><th>Items</th><th>Date</th><th style={{ textAlign: "right" }}>Total</th><th>Status</th><th>Invoice</th><th></th>
                </tr>
              </thead>
              <tbody>
                {DATA.PURCHASE_ORDERS.map((p) => (
                  <tr key={p.id}>
                    <td className="mono strong">{p.id}</td>
                    <td>{p.vendor}</td>
                    <td className="mono subtle">{p.items} items</td>
                    <td className="muted">{p.date}</td>
                    <td className="num" style={{ textAlign: "right" }}>{fmtINRFull(p.total)}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td><StatusBadge status={p.invoice} /></td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        <Btn variant="ghost" size="sm" icon="eye"></Btn>
                        <Btn variant="ghost" size="sm" icon="download"></Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EntityFormModal open={addVendor} onClose={() => setAddVendor(false)} title="Add vendor" sub="Onboard a new supplier" wide submitLabel="Save vendor" saving={saving} error={error} onSubmit={saveVendor}>
        <FormGrid>
          <FormField label="Vendor name"><FormInput value={vendorForm.values.name} onChange={(v) => vendorForm.setField("name", v)} /></FormField>
          <FormField label="Category">
            <FormSelect value={vendorForm.values.category} onChange={(v) => vendorForm.setField("category", v)}>
              <option>Raw Material</option><option>Chemical</option><option>Packaging</option><option>Spare Parts</option>
            </FormSelect>
          </FormField>
          <FormField label="City, State"><FormInput value={vendorForm.values.city} onChange={(v) => vendorForm.setField("city", v)} /></FormField>
        </FormGrid>
      </EntityFormModal>

      <EntityFormModal open={createPO} onClose={() => setCreatePO(false)} title="Create purchase order" sub="Generate a new PO" wide submitLabel="Send for approval" secondaryLabel="Save draft" saving={saving} error={error} onSubmit={() => savePO(false)} onSecondary={() => savePO(true)}>
        <FormGrid>
          <FormField label="Vendor">
            <FormSelect value={poForm.values.vendor} onChange={(v) => poForm.setField("vendor", v)}>
              {DATA.VENDORS.map((v) => <option key={v.id} value={v.name}>{v.name}</option>)}
            </FormSelect>
          </FormField>
          <FormField label="PO number"><FormInput value={poForm.values.poId} onChange={(v) => poForm.setField("poId", v)} /></FormField>
          <FormField label="Line items"><FormInput value={poForm.values.items} onChange={(v) => poForm.setField("items", v)} /></FormField>
          <FormField label="Total (₹)"><FormInput value={poForm.values.total} onChange={(v) => poForm.setField("total", v)} /></FormField>
        </FormGrid>
      </EntityFormModal>
    </>
  );
};

/* ============================================================
   DISPATCH & TRACKING
   ============================================================ */
const DispatchTracking = () => {
  const DATA = useDATA();
  const { append, saving, error, clearError } = useEntityMutation();
  const [openTrack, setOpenTrack] = useState(null);
  const [planOpen, setPlanOpen] = useState(false);
  const dispatchForm = useFormState({
    orderId: DATA.ORDERS[0]?.id ?? "",
    dispatchId: nextDispatchId(DATA.DISPATCHES),
    vehicle: "RJ-27-GH-4521",
    driver: "Ramesh Kumar",
    route: "Udaipur → Mumbai",
    loaded: "24 MT",
    eta: formatDisplayDate(),
  });

  const scheduleDispatch = async () => {
    const order = DATA.ORDERS.find((o) => o.id === dispatchForm.values.orderId);
    await append("dispatches", {
      id: dispatchForm.values.dispatchId || nextDispatchId(DATA.DISPATCHES),
      vehicle: dispatchForm.values.vehicle,
      driver: dispatchForm.values.driver,
      customer: order?.customer ?? "—",
      route: dispatchForm.values.route,
      loaded: dispatchForm.values.loaded,
      eta: dispatchForm.values.eta,
      progress: 0,
      status: "loading",
      lastUpdate: "just now",
    });
    setPlanOpen(false);
  };

  const inTransit = DATA.DISPATCHES.filter((d) => d.status === "in-transit").length;

  return (
    <>
      <DashHead title="Dispatch & Vehicle Tracking" sub="Live deliveries, ETAs and driver communication">
        <Btn icon="map" size="sm">Map view</Btn>
        <Btn icon="bell" size="sm">Reminders</Btn>
        <Btn variant="primary" size="sm" icon="plus" onClick={() => { clearError(); setPlanOpen(true); }}>Plan dispatch</Btn>
      </DashHead>

      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <div className="kpi"><div className="kpi-label"><Icon name="truck" size={13} className="ico" />Active vehicles</div><div className="kpi-value tabular">{DATA.DISPATCHES.length}</div><div style={{ fontSize: 11, color: "var(--fg-muted)" }}>{inTransit} in transit</div></div>
        <div className="kpi"><div className="kpi-label"><Icon name="bolt" size={13} className="ico" />On-time rate</div><div className="kpi-value">94.2<span className="unit">%</span></div><div style={{ fontSize: 11, color: "var(--success)" }}>+1.2pp this month</div></div>
        <div className="kpi"><div className="kpi-label"><Icon name="alert" size={13} className="ico" />Delayed</div><div className="kpi-value" style={{ color: "var(--danger)" }}>2</div><div style={{ fontSize: 11, color: "var(--fg-muted)" }}>1 weather · 1 traffic</div></div>
        <div className="kpi"><div className="kpi-label"><Icon name="clock" size={13} className="ico" />Avg transit</div><div className="kpi-value">11.4<span className="unit">hrs</span></div><div style={{ fontSize: 11, color: "var(--success)" }}>−24 min vs Apr</div></div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 420px", marginBottom: 20 }}>
        <div className="card">
          <div className="card-head">
            <div className="card-title"><Icon name="map" size={14} /> Live fleet map</div>
            <Badge tone="success" dot>Live</Badge>
          </div>
          <div className="card-body"><FleetMap /></div>
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title"><Icon name="bell" size={14} /> Reminders & alerts</div>
          </div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { sev: "danger",  t: "DSP-1040 delayed by 90 min",          d: "Heavy traffic near Allahabad · ETA shifted to May 24, 07:30" },
              { sev: "warning", t: "DSP-1037 still loading at Plant A",   d: "Scheduled to leave at 14:00 · 32 min overdue" },
              { sev: "info",    t: "Driver Manoj Singh idle for 2.5 hrs", d: "Last known: Nagpur fuel stop · sent ping" },
              { sev: "success", t: "DSP-1039 near customer",              d: "Nirma Bhavnagar — 4.2 km · 12 min ETA" },
            ].map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: 10, background: "var(--bg-sunken)", borderRadius: 8 }}>
                <span style={{ width: 3, borderRadius: 2, background: `var(--${a.sev})` }}></span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{a.t}</div>
                  <div style={{ fontSize: 11, color: "var(--fg-muted)", marginTop: 2 }}>{a.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title"><Icon name="truck" size={14} /> All dispatches</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input className="input" placeholder="Search by ID, vehicle, driver…" style={{ width: 240, height: 30 }} />
            <Btn size="sm" icon="filter">Filter</Btn>
          </div>
        </div>
        <div className="card-body flush" style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Dispatch</th><th>Vehicle</th><th>Driver</th><th>Customer</th><th>Route</th><th>Load</th><th>Progress</th><th>ETA</th><th>Update</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {DATA.DISPATCHES.map((d) => (
                <tr key={d.id} style={{ cursor: "pointer" }} onClick={() => setOpenTrack(d)}>
                  <td className="mono strong">{d.id}</td>
                  <td className="mono">{d.vehicle}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Avatar name={d.driver} color={(d.id.charCodeAt(d.id.length - 1) % 5) + 1} />
                      <div>{d.driver}</div>
                    </div>
                  </td>
                  <td className="muted">{d.customer}</td>
                  <td className="muted" style={{ fontSize: 12 }}>{d.route}</td>
                  <td className="num">{d.loaded}</td>
                  <td style={{ width: 130 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Bar value={d.progress} tone={d.status === "near-delivery" ? "gold" : d.status === "delivered" ? "success" : "primary"} />
                      <span className="mono" style={{ fontSize: 11, width: 30, textAlign: "right" }}>{d.progress}%</span>
                    </div>
                  </td>
                  <td className="mono" style={{ fontSize: 12 }}>{d.eta}</td>
                  <td className="subtle" style={{ fontSize: 11 }}>{d.lastUpdate}</td>
                  <td><StatusBadge status={d.status} /></td>
                  <td><Icon name="chevRight" size={14} className="subtle" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={!!openTrack}
        onClose={() => setOpenTrack(null)}
        title={openTrack ? `Track ${openTrack.id}` : ""}
        sub={openTrack ? `${openTrack.vehicle} · ${openTrack.driver}` : ""}
        wide
      >
        {openTrack && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }}>
            <div>
              <div className="map-frame" style={{ height: 280, marginBottom: 16 }}>
                <FleetMap />
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: "var(--fg-muted)" }}>JOURNEY TIMELINE</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { t: "Loaded out", ts: "May 21, 06:42", loc: "Plant A · Udaipur", done: true },
                  { t: "Weighbridge cleared", ts: "May 21, 07:18", loc: "Udaipur Toll Plaza", done: true },
                  { t: "Last ping",  ts: openTrack.lastUpdate, loc: "Nagpur Bypass · 168 km in", done: true, active: true },
                  { t: "Customer ETA", ts: openTrack.eta, loc: openTrack.customer, done: false },
                ].map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: 12 }}>
                    <div style={{ position: "relative" }}>
                      <span className={`dot ${s.done ? (s.active ? "primary pulse" : "success") : ""}`} style={{ width: 12, height: 12, border: "2px solid var(--bg-elev)", boxShadow: "0 0 0 1px var(--border)" }}></span>
                      {i < 3 && <span style={{ position: "absolute", left: 5, top: 14, bottom: -10, width: 2, background: s.done ? "var(--success)" : "var(--border)" }}></span>}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 500 }}>{s.t}</div>
                      <div style={{ fontSize: 11, color: "var(--fg-subtle)" }}>{s.ts} · {s.loc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="card" style={{ marginBottom: 12 }}>
                <div className="card-body" style={{ padding: 14 }}>
                  <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--fg-subtle)", fontWeight: 600, marginBottom: 6 }}>Driver</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <Avatar name={openTrack.driver} color={1} size="lg" />
                    <div>
                      <div style={{ fontWeight: 600 }}>{openTrack.driver}</div>
                      <div className="subtle" style={{ fontSize: 11 }}>+91 98•••••328</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn variant="default" size="sm" icon="phone" className="grow">Call</Btn>
                    <Btn variant="default" size="sm" icon="speech" className="grow">Message</Btn>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-body" style={{ padding: 14 }}>
                  <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--fg-subtle)", fontWeight: 600, marginBottom: 10 }}>Trip details</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span className="muted">Customer</span><span className="strong">{openTrack.customer}</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span className="muted">Route</span><span>{openTrack.route}</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span className="muted">Loaded</span><span className="mono strong">{openTrack.loaded}</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span className="muted">Vehicle</span><span className="mono">{openTrack.vehicle}</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span className="muted">ETA</span><span className="mono">{openTrack.eta}</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span className="muted">Status</span><StatusBadge status={openTrack.status} /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <EntityFormModal open={planOpen} onClose={() => setPlanOpen(false)} title="Plan new dispatch" sub="Assign vehicle, driver and route" wide submitLabel="Schedule dispatch" saving={saving} error={error} onSubmit={scheduleDispatch}>
        <FormGrid>
          <FormField label="Sales order">
            <FormSelect value={dispatchForm.values.orderId} onChange={(v) => dispatchForm.setField("orderId", v)}>
              {DATA.ORDERS.map((o) => <option key={o.id} value={o.id}>{o.id} · {o.customer}</option>)}
            </FormSelect>
          </FormField>
          <FormField label="Dispatch #"><FormInput value={dispatchForm.values.dispatchId} onChange={(v) => dispatchForm.setField("dispatchId", v)} /></FormField>
          <FormField label="Vehicle"><FormInput value={dispatchForm.values.vehicle} onChange={(v) => dispatchForm.setField("vehicle", v)} /></FormField>
          <FormField label="Driver"><FormInput value={dispatchForm.values.driver} onChange={(v) => dispatchForm.setField("driver", v)} /></FormField>
          <FormField label="Route"><FormInput value={dispatchForm.values.route} onChange={(v) => dispatchForm.setField("route", v)} /></FormField>
          <FormField label="Load"><FormInput value={dispatchForm.values.loaded} onChange={(v) => dispatchForm.setField("loaded", v)} /></FormField>
        </FormGrid>
      </EntityFormModal>
    </>
  );
};

const FleetMap = () => {
  const cities = [
    { x: 52, y: 38, n: "Udaipur", t: "Plant A" },
    { x: 32, y: 56, n: "Ahmedabad", t: "Plant B" },
    { x: 28, y: 78, n: "Mumbai" },
    { x: 38, y: 90, n: "Pune" },
    { x: 80, y: 78, n: "Kolkata" },
    { x: 24, y: 64, n: "Bhavnagar" },
  ];
  const routes = [
    { from: [52, 38], to: [28, 78], color: "var(--primary)", progress: 0.68 },
    { from: [32, 56], to: [28, 78], color: "var(--info)", progress: 0.42 },
    { from: [52, 38], to: [80, 78], color: "var(--primary)", progress: 0.24 },
    { from: [32, 56], to: [24, 64], color: "var(--secondary)", progress: 0.92 },
  ];
  return (
    <div className="map-frame" style={{ height: 320, position: "relative" }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
        <path d="M 20 20 Q 28 14 38 16 L 50 12 Q 62 10 72 18 L 84 22 Q 92 30 88 42 L 86 56 Q 82 72 70 82 L 56 92 Q 42 94 36 88 L 28 80 Q 20 70 18 56 L 18 38 Q 16 28 20 20 Z"
              fill="rgba(55,77,149,0.04)" stroke="rgba(55,77,149,0.15)" strokeWidth="0.4" strokeDasharray="0.6 0.6" />
        {routes.map((r, i) => (
          <g key={i}>
            <line x1={r.from[0]} y1={r.from[1]} x2={r.to[0]} y2={r.to[1]} stroke={r.color} strokeWidth="0.4" strokeDasharray="0.8 0.8" opacity="0.4" />
            <line x1={r.from[0]} y1={r.from[1]}
                  x2={r.from[0] + (r.to[0] - r.from[0]) * r.progress}
                  y2={r.from[1] + (r.to[1] - r.from[1]) * r.progress}
                  stroke={r.color} strokeWidth="0.6" strokeLinecap="round" />
          </g>
        ))}
      </svg>
      {cities.map((c, i) => (
        <div key={`d-${i}`} style={{
          position: "absolute",
          left: `${c.x}%`, top: `${c.y}%`,
          transform: "translate(-50%, -50%)",
          width: c.t ? 10 : 6, height: c.t ? 10 : 6,
          borderRadius: "50%",
          background: c.t ? "var(--primary)" : "#5a5e66",
          boxShadow: c.t ? "0 0 0 4px rgba(55,77,149,0.18)" : "0 0 0 3px rgba(90,94,102,0.18)",
          pointerEvents: "none",
        }}></div>
      ))}
      {routes.map((r, i) => (
        <div key={`m-${i}`} style={{
          position: "absolute",
          left: `${r.from[0] + (r.to[0] - r.from[0]) * r.progress}%`,
          top: `${r.from[1] + (r.to[1] - r.from[1]) * r.progress}%`,
          transform: "translate(-50%, -50%)",
          width: 12, height: 12, borderRadius: "50%",
          background: r.color,
          boxShadow: `0 0 0 5px ${r.color === "var(--secondary)" ? "rgba(232,169,1,0.22)" : "rgba(55,77,149,0.20)"}`,
          animation: "pulse 1.6s ease-in-out infinite",
          pointerEvents: "none",
        }}></div>
      ))}
      {cities.map((c, i) => (
        <div key={i} style={{
          position: "absolute", left: `${c.x}%`, top: `${c.y}%`,
          transform: "translate(10px, -50%)", fontSize: 11,
          color: c.t ? "var(--primary)" : "var(--fg-muted)",
          fontWeight: c.t ? 600 : 500, whiteSpace: "nowrap", pointerEvents: "none",
        }}>
          {c.n}{c.t && <span style={{ marginLeft: 4, color: "var(--fg-subtle)", fontWeight: 400 }}>· {c.t}</span>}
        </div>
      ))}
    </div>
  );
};

export { RawMaterialInventory, Vendors, DispatchTracking };
