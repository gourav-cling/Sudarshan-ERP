// @ts-nocheck
'use client';


import React from "react";
import { Icon } from "./icons";
import { Btn, Badge, StatusBadge, Avatar, Bar, Sparkline, Kpi, Modal, fmtINR, fmtINRFull, fmtNum } from "./ui";
import { Phone } from "./mobile";

/* ============================================================
   MOBILE APP SCREENS — Part 2
   Driver POD/History/Vehicle · Sales Customer/Order/History
   Employee Leave/Payslip/Docs · Production QC/Issue/Log
   Owner snapshot · Store stock check / receive
   ============================================================ */


/* ============================================================
   REUSABLE BITS
   ============================================================ */

const ScreenHeader = ({ title, sub, back = true, action }) => (
  <div style={{
    padding: "10px 16px 8px",
    display: "flex", alignItems: "center", gap: 12,
    borderBottom: "1px solid var(--border)",
    background: "rgba(255,255,255,0.94)",
    backdropFilter: "blur(20px)",
  }}>
    {back && (
      <button style={{
        width: 32, height: 32, borderRadius: 8, border: "none",
        background: "var(--bg-sunken)", color: "var(--fg)",
        display: "grid", placeItems: "center",
      }}>
        <Icon name="chevLeft" size={16} />
      </button>
    )}
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--fg-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub}</div>}
    </div>
    {action}
  </div>
);

const TabBar = ({ items, active }) => (
  <div style={{
    position: "absolute", bottom: 0, left: 0, right: 0,
    background: "rgba(255,255,255,0.94)", backdropFilter: "blur(20px)",
    borderTop: "1px solid var(--border)", padding: "8px 12px 28px",
    display: "flex", justifyContent: "space-around",
  }}>
    {items.map((t) => (
      <div key={t.l} style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
        color: t.l === active ? "var(--primary)" : "var(--fg-subtle)",
        fontSize: 10, fontWeight: 500,
      }}>
        <Icon name={t.i} size={20} />
        {t.l}
      </div>
    ))}
  </div>
);

/* ============================================================
   DRIVER — TRIP HISTORY
   ============================================================ */
const DriverHistory = () => (
  <Phone tint="light" time="13:24">
    <ScreenHeader title="My trips" sub="May 2026 · 18 completed" action={<Icon name="filter" size={16} className="subtle" />} />
    <div style={{ flex: 1, overflow: "auto", paddingBottom: 90, background: "var(--bg)" }}>
      <div style={{ padding: 16 }}>
        <div style={{
          background: "linear-gradient(135deg, var(--primary-soft), white)",
          border: "1px solid var(--primary-soft-2)",
          borderRadius: 14, padding: 14, marginBottom: 14,
        }}>
          <div style={{ fontSize: 11, color: "var(--primary)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6 }}>THIS MONTH</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em" }}>18</div>
              <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>Trips</div>
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em" }}>4,280<span style={{ fontSize: 11, color: "var(--fg-muted)", fontWeight: 400 }}> km</span></div>
              <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>Distance</div>
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--success)" }}>96%</div>
              <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>On time</div>
            </div>
          </div>
        </div>

        {[
          { id: "DSP-1042", date: "Today",       route: "Udaipur → Mumbai",     load: "24 MT", status: "active",    pay: "₹4,200" },
          { id: "DSP-1031", date: "May 19",      route: "Udaipur → Surat",      load: "16 MT", status: "completed", pay: "₹3,400" },
          { id: "DSP-1026", date: "May 16",      route: "Udaipur → Pune",       load: "28 MT", status: "completed", pay: "₹4,800" },
          { id: "DSP-1019", date: "May 12",      route: "Udaipur → Ahmedabad",  load: "18 MT", status: "completed", pay: "₹2,200" },
          { id: "DSP-1014", date: "May 09",      route: "Udaipur → Indore",     load: "22 MT", status: "completed", pay: "₹2,800" },
          { id: "DSP-1008", date: "May 05",      route: "Udaipur → Bhopal",     load: "20 MT", status: "completed", pay: "₹3,100" },
        ].map((t) => (
          <div key={t.id} style={{
            background: "white", borderRadius: 12, padding: 12, marginBottom: 8,
            border: "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: 12,
            ...(t.status === "active" && { borderColor: "var(--primary)", background: "var(--primary-soft)" }),
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 9, flexShrink: 0,
              background: t.status === "active" ? "white" : "var(--success-soft)",
              color: t.status === "active" ? "var(--primary)" : "var(--success)",
              display: "grid", placeItems: "center",
              border: t.status === "active" ? "1px solid var(--primary)" : "none",
            }}>
              <Icon name={t.status === "active" ? "truck" : "check"} size={16} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>{t.id}</span>
                {t.status === "active" && <span className="dot pulse" style={{ background: "var(--primary)", width: 6, height: 6 }}></span>}
              </div>
              <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>{t.route}</div>
              <div style={{ fontSize: 11, color: "var(--fg-subtle)", marginTop: 2 }}>{t.date} · {t.load}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="mono" style={{ fontSize: 13, fontWeight: 600, color: "var(--success)" }}>{t.pay}</div>
              <div style={{ fontSize: 10, color: "var(--fg-subtle)" }}>{t.status === "active" ? "expected" : "paid"}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
    <TabBar items={[
      { i: "truck", l: "Trips" }, { i: "map", l: "Map" }, { i: "calendar", l: "Schedule" }, { i: "user", l: "Profile" },
    ]} active="Trips" />
  </Phone>
);

/* ============================================================
   DRIVER — DELIVERY CONFIRMATION (POD)
   ============================================================ */
const DriverPOD = () => (
  <Phone tint="light" time="14:32">
    <ScreenHeader title="Confirm delivery" sub="DSP-1042 · Asian Paints, Mumbai" />
    <div style={{ flex: 1, overflow: "auto", paddingBottom: 100, background: "var(--bg)" }}>
      <div style={{ padding: 16 }}>
        <div style={{
          background: "var(--success-soft)", border: "1px solid var(--success)",
          borderRadius: 12, padding: 12, marginBottom: 16,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%", background: "var(--success)",
            color: "white", display: "grid", placeItems: "center",
          }}>
            <Icon name="check" size={18} stroke={2.5} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--success)" }}>Arrived at customer</div>
            <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>Asian Paints HO · 2 min ago</div>
          </div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>RECEIVED BY</div>
        <div style={{ background: "white", borderRadius: 12, padding: 12, border: "1px solid var(--border)", marginBottom: 16 }}>
          <div className="field" style={{ marginBottom: 10 }}>
            <input className="input" placeholder="Receiver name" defaultValue="Sandeep Nair" />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input className="input" placeholder="Designation" defaultValue="Stores Manager" style={{ flex: 1 }} />
            <input className="input" placeholder="Mobile" defaultValue="98•••42" style={{ flex: 1 }} />
          </div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>SIGNATURE</div>
        <div style={{
          background: "white", border: "1px dashed var(--border-strong)", borderRadius: 12,
          height: 100, marginBottom: 16, position: "relative",
        }}>
          {/* Mock signature */}
          <svg width="100%" height="100%" viewBox="0 0 280 100" preserveAspectRatio="none">
            <path d="M30 70 Q40 45 50 60 T70 55 Q80 35 100 50 Q120 65 140 40 Q160 25 180 50 Q200 70 230 50 L240 60" fill="none" stroke="var(--fg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <button style={{
            position: "absolute", bottom: 8, right: 8,
            padding: "4px 10px", borderRadius: 6, border: "1px solid var(--border)",
            background: "white", fontSize: 11, color: "var(--fg-muted)",
          }}>Clear</button>
        </div>

        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>PHOTOS</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
          {[
            { c: "linear-gradient(135deg, #d8efde, #b9e0c5)" },
            { c: "linear-gradient(135deg, #efe3c8, #dac9a0)" },
          ].map((p, i) => (
            <div key={i} style={{
              aspectRatio: "1", borderRadius: 10, background: p.c,
              border: "1px solid var(--border)", position: "relative",
            }}>
              <Icon name="check" size={14} style={{ position: "absolute", top: 6, right: 6, color: "white", background: "var(--success)", borderRadius: 4, padding: 2 }} />
            </div>
          ))}
          <button style={{
            aspectRatio: "1", borderRadius: 10, border: "1.5px dashed var(--border-strong)",
            background: "var(--bg-sunken)", display: "grid", placeItems: "center",
            color: "var(--fg-muted)",
          }}>
            <Icon name="plus" size={20} />
          </button>
        </div>

        <div className="field">
          <label className="field-label">Quantity verified (MT)</label>
          <input className="input" defaultValue="24" />
        </div>
      </div>
    </div>
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0,
      padding: "12px 16px 32px", background: "white", borderTop: "1px solid var(--border)",
    }}>
      <button style={{
        width: "100%", padding: 14, borderRadius: 10,
        background: "var(--success)", color: "white", border: "none",
        fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center",
        justifyContent: "center", gap: 8,
      }}>
        <Icon name="check" size={16} stroke={2.5} /> Complete delivery
      </button>
    </div>
  </Phone>
);

/* ============================================================
   DRIVER — VEHICLE INSPECTION
   ============================================================ */
const DriverVehicleCheck = () => (
  <Phone tint="light" time="06:08">
    <ScreenHeader title="Pre-trip inspection" sub="RJ-27-GH-4521 · Before DSP-1042" />
    <div style={{ flex: 1, overflow: "auto", paddingBottom: 90, background: "var(--bg)" }}>
      <div style={{ padding: 16 }}>
        <div style={{
          background: "var(--warning-soft)", borderRadius: 10, padding: 10,
          display: "flex", alignItems: "center", gap: 10, marginBottom: 14,
        }}>
          <Icon name="info" size={14} style={{ color: "var(--warning)", flexShrink: 0 }} />
          <div style={{ fontSize: 11, color: "var(--fg)" }}>Complete all checks before leaving plant. Photos required for ⚠ items.</div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>EXTERIOR (4/4)</div>
        {[
          { l: "Tyres — pressure & condition", checked: true },
          { l: "Headlights & indicators",      checked: true },
          { l: "Body damage / dents",          checked: true },
          { l: "Mud guards & reflectors",       checked: true },
        ].map((c, i) => (
          <div key={i} style={{
            background: "white", borderRadius: 10, padding: 12, marginBottom: 6,
            border: "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: 6,
              background: "var(--success)", color: "white",
              display: "grid", placeItems: "center", flexShrink: 0,
            }}><Icon name="check" size={13} stroke={2.5} /></div>
            <div style={{ flex: 1, fontSize: 13 }}>{c.l}</div>
          </div>
        ))}

        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginTop: 16, marginBottom: 8 }}>FLUIDS & ENGINE (2/3)</div>
        {[
          { l: "Engine oil level",        checked: true },
          { l: "Coolant level",            checked: true },
          { l: "Brake fluid",              checked: false, warn: true },
        ].map((c, i) => (
          <div key={i} style={{
            background: "white", borderRadius: 10, padding: 12, marginBottom: 6,
            border: c.warn ? "1px solid var(--warning)" : "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: 10,
            ...(c.warn && { background: "var(--warning-soft)" }),
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: 6,
              background: c.checked ? "var(--success)" : "var(--bg-sunken)",
              color: c.checked ? "white" : "var(--fg-muted)",
              display: "grid", placeItems: "center", flexShrink: 0,
              border: c.warn ? "1.5px solid var(--warning)" : "none",
            }}>{c.checked ? <Icon name="check" size={13} stroke={2.5} /> : ""}</div>
            <div style={{ flex: 1, fontSize: 13, fontWeight: c.warn ? 600 : 400 }}>
              {c.l}
              {c.warn && <div style={{ fontSize: 11, color: "var(--warning)", marginTop: 2, fontWeight: 500 }}>⚠ Low — refill before trip</div>}
            </div>
          </div>
        ))}

        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginTop: 16, marginBottom: 8 }}>DOCUMENTS (4/4)</div>
        {[
          "RC certificate", "Insurance valid till Dec 2026", "Fitness certificate", "Pollution under control (PUC)",
        ].map((c, i) => (
          <div key={i} style={{
            background: "white", borderRadius: 10, padding: 10, marginBottom: 6,
            border: "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <Icon name="fileText" size={14} className="subtle" />
            <div style={{ flex: 1, fontSize: 12 }}>{c}</div>
            <Icon name="check" size={14} style={{ color: "var(--success)" }} />
          </div>
        ))}
      </div>
    </div>
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0,
      padding: "12px 16px 32px", background: "white", borderTop: "1px solid var(--border)",
    }}>
      <button style={{
        width: "100%", padding: 14, borderRadius: 10,
        background: "var(--fg-faint)", color: "white", border: "none",
        fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center",
        justifyContent: "center", gap: 8,
      }}>
        Complete fluids check to submit
      </button>
    </div>
  </Phone>
);

/* ============================================================
   FIELD SALES — CUSTOMER DETAIL
   ============================================================ */
const SalesCustomer = () => (
  <Phone tint="light" time="11:24">
    <ScreenHeader
      title="Pidilite Industries"
      sub="Andheri E, Mumbai"
      action={<Icon name="phone" size={18} style={{ color: "var(--primary)" }} />}
    />
    <div style={{ flex: 1, overflow: "auto", paddingBottom: 100, background: "var(--bg)" }}>
      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #374d95 0%, #4862b3 100%)",
        color: "white", padding: "20px 20px 24px", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(200px 140px at 100% 0%, rgba(232,169,1,0.18), transparent 60%)" }}></div>
        <div style={{ position: "relative" }}>
          <Badge tone="default" style={{ background: "rgba(255,255,255,0.16)", color: "white", border: "1px solid rgba(255,255,255,0.2)" }}>★ KEY ACCOUNT</Badge>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, letterSpacing: "-0.025em", marginTop: 8 }}>
            ₹62.1 L
          </div>
          <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 14 }}>YTD revenue · 31 orders</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{
              flex: 1, padding: 10, borderRadius: 10, border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.12)", color: "white",
              fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}><Icon name="pin" size={13} /> Check in</button>
            <button style={{
              flex: 1, padding: 10, borderRadius: 10, border: "none",
              background: "var(--secondary)", color: "var(--secondary-fg)",
              fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}><Icon name="plus" size={13} /> New order</button>
          </div>
        </div>
      </div>

      {/* Quick info */}
      <div style={{ padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
          {[
            { l: "Last order", v: "May 14", s: "₹4.2 L" },
            { l: "Open AR",    v: "₹1.8 L", s: "Net 30 · ok" },
            { l: "Credit limit", v: "₹15 L", s: "82% used" },
            { l: "Visits MTD", v: "3", s: "Last May 18" },
          ].map((s) => (
            <div key={s.l} style={{ background: "white", borderRadius: 10, padding: 10, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 10, color: "var(--fg-subtle)", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 500 }}>{s.l}</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, letterSpacing: "-0.015em", marginTop: 2 }}>{s.v}</div>
              <div style={{ fontSize: 10, color: "var(--fg-muted)" }}>{s.s}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>RECENT ORDERS</div>
        {[
          { id: "SO-2026-0420", prod: "Calcium Carbonate · Coated", qty: "18 MT", date: "May 17", val: "₹12.96 L", status: "in-production" },
          { id: "SO-2026-0411", prod: "Talc · 800 mesh",            qty: "12 MT", date: "May 14", val: "₹4.20 L",  status: "delivered" },
          { id: "SO-2026-0402", prod: "China Clay · Hydrous",       qty: "20 MT", date: "May 09", val: "₹13.00 L", status: "delivered" },
        ].map((o) => (
          <div key={o.id} style={{
            background: "white", borderRadius: 10, padding: 12, marginBottom: 6,
            border: "1px solid var(--border)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span className="mono" style={{ fontSize: 11, fontWeight: 600 }}>{o.id}</span>
              <Badge tone={o.status === "delivered" ? "success" : "info"} dot>{o.status === "delivered" ? "Delivered" : "In production"}</Badge>
            </div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{o.prod}</div>
            <div style={{ fontSize: 11, color: "var(--fg-muted)", marginTop: 2 }}>{o.qty} · {o.date} · <span className="mono">{o.val}</span></div>
          </div>
        ))}

        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginTop: 16, marginBottom: 8 }}>CONTACTS</div>
        {[
          { name: "Mr. Kulkarni", role: "Head, Procurement", color: 2 },
          { name: "Ms. Iyer",     role: "Accounts payable",   color: 5 },
        ].map((c) => (
          <div key={c.name} style={{
            background: "white", borderRadius: 10, padding: 10, marginBottom: 6,
            border: "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <Avatar name={c.name} color={c.color} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</div>
              <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>{c.role}</div>
            </div>
            <button className="tb-iconbtn" style={{ background: "var(--bg-sunken)" }}><Icon name="phone" size={14} /></button>
          </div>
        ))}
      </div>
    </div>
    <TabBar items={[
      { i: "home", l: "Today" }, { i: "map", l: "Map" }, { i: "users", l: "Customers" }, { i: "chart", l: "Stats" },
    ]} active="Customers" />
  </Phone>
);

/* ============================================================
   FIELD SALES — NEW ORDER (mobile entry)
   ============================================================ */
const SalesNewOrder = () => (
  <Phone tint="light" time="12:08">
    <ScreenHeader title="New order" sub="For Pidilite Industries" />
    <div style={{ flex: 1, overflow: "auto", paddingBottom: 100, background: "var(--bg)" }}>
      <div style={{ padding: 16 }}>
        {/* Step indicator */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: s <= 2 ? "var(--primary)" : "var(--bg-sunken)",
            }}></div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 16 }}>Step 2 of 3 · Products</div>

        {/* Selected products */}
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>SELECTED</div>
        {[
          { name: "Calcium Carbonate · Coated 2µ", grade: "Premium", qty: 18, rate: 72000, total: 1296000 },
          { name: "Talcum Powder · 600 mesh",       grade: "Cosmetic", qty: 6,  rate: 74000, total: 444000 },
        ].map((p) => (
          <div key={p.name} style={{
            background: "white", borderRadius: 12, padding: 12, marginBottom: 6,
            border: "1px solid var(--border)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>{p.grade}</div>
              </div>
              <button className="tb-iconbtn"><Icon name="x" size={14} /></button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
                <button style={{ width: 32, height: 32, background: "var(--bg-sunken)", border: "none" }}><Icon name="minus" size={14} /></button>
                <div className="mono" style={{ width: 40, textAlign: "center", fontWeight: 600 }}>{p.qty}</div>
                <button style={{ width: 32, height: 32, background: "var(--bg-sunken)", border: "none" }}><Icon name="plus" size={14} /></button>
              </div>
              <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>MT × ₹{p.rate.toLocaleString("en-IN")}</span>
              <div style={{ marginLeft: "auto", fontSize: 13, fontWeight: 600 }} className="mono">
                ₹{(p.total / 100000).toFixed(2)}L
              </div>
            </div>
          </div>
        ))}

        <button style={{
          width: "100%", padding: 12, marginTop: 6, borderRadius: 10,
          border: "1.5px dashed var(--primary-soft-2)", background: "white", color: "var(--primary)",
          fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          <Icon name="plus" size={14} /> Add product
        </button>

        {/* Summary */}
        <div style={{
          background: "var(--primary-soft)", borderRadius: 12, padding: 14, marginTop: 16,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12 }}>
            <span className="muted">Subtotal</span><span className="mono">₹17,40,000</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12 }}>
            <span className="muted">GST (18%)</span><span className="mono">₹3,13,200</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid var(--primary-soft-2)" }}>
            <span style={{ fontWeight: 600 }}>Total</span>
            <span className="mono" style={{ fontWeight: 600, color: "var(--primary)", fontSize: 16 }}>₹20,53,200</span>
          </div>
        </div>
      </div>
    </div>
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0,
      padding: "12px 16px 32px", background: "white", borderTop: "1px solid var(--border)",
      display: "flex", gap: 8,
    }}>
      <button style={{
        flex: 1, padding: 14, borderRadius: 10,
        background: "var(--bg-sunken)", color: "var(--fg)", border: "none",
        fontSize: 14, fontWeight: 600,
      }}>Back</button>
      <button style={{
        flex: 2, padding: 14, borderRadius: 10,
        background: "var(--primary)", color: "white", border: "none",
        fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center",
        justifyContent: "center", gap: 8,
      }}>
        Continue <Icon name="arrowRight" size={14} />
      </button>
    </div>
  </Phone>
);

/* ============================================================
   FIELD SALES — VISIT HISTORY
   ============================================================ */
const SalesHistory = () => (
  <Phone tint="light" time="17:42">
    <ScreenHeader title="Visit history" sub="May 2026" action={<Icon name="filter" size={16} className="subtle" />} />
    <div style={{ flex: 1, overflow: "auto", paddingBottom: 90, background: "var(--bg)" }}>
      <div style={{ padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
          <div style={{ background: "white", borderRadius: 10, padding: 10, border: "1px solid var(--border)" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>32</div>
            <div style={{ fontSize: 10, color: "var(--fg-subtle)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Visits</div>
          </div>
          <div style={{ background: "white", borderRadius: 10, padding: 10, border: "1px solid var(--border)" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--success)" }}>9</div>
            <div style={{ fontSize: 10, color: "var(--fg-subtle)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Orders won</div>
          </div>
          <div style={{ background: "white", borderRadius: 10, padding: 10, border: "1px solid var(--border)" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>28<span style={{ fontSize: 11, fontWeight: 400, color: "var(--fg-muted)" }}>%</span></div>
            <div style={{ fontSize: 10, color: "var(--fg-subtle)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Win rate</div>
          </div>
        </div>

        {/* Timeline */}
        {[
          { date: "Today · Thu 21",
            visits: [
              { c: "Asian Paints HO",    time: "10:45", dur: "44m", outcome: "Quoted 2 lots",   won: true,  color: 2 },
              { c: "Pidilite Andheri",   time: "11:48", dur: "23m", outcome: "Active",          active: true, color: 5 },
            ]},
          { date: "Wed 20",
            visits: [
              { c: "Berger Paints East", time: "11:20", dur: "38m", outcome: "Sample sent",      won: false, color: 3 },
              { c: "Akzo Nobel Lab",     time: "14:30", dur: "1h 12m", outcome: "Demo scheduled", won: false, color: 4 },
            ]},
          { date: "Tue 19",
            visits: [
              { c: "Nirma Ltd Vatva",    time: "11:00", dur: "1h 06m", outcome: "Order confirmed", won: true, color: 1 },
              { c: "JK White Plant",      time: "15:30", dur: "52m", outcome: "Tech demo",         won: false, color: 5 },
            ]},
        ].map((d) => (
          <div key={d.date} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>{d.date}</div>
            {d.visits.map((v) => (
              <div key={v.c} style={{
                background: "white", borderRadius: 12, padding: 12, marginBottom: 6,
                border: "1px solid var(--border)",
                display: "flex", alignItems: "center", gap: 10,
                ...(v.active && { borderColor: "var(--secondary)", background: "var(--secondary-soft)" }),
              }}>
                <Avatar name={v.c} color={v.color} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{v.c}</div>
                  <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>{v.outcome}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="mono" style={{ fontSize: 11, fontWeight: 600 }}>{v.time}</div>
                  <div style={{ fontSize: 10, color: "var(--fg-subtle)" }}>{v.dur}</div>
                </div>
                {v.won && <span style={{ width: 22, height: 22, borderRadius: 6, background: "var(--success)", color: "white", display: "grid", placeItems: "center" }}><Icon name="check" size={12} stroke={2.5} /></span>}
                {v.active && <span className="dot pulse" style={{ background: "var(--secondary)" }}></span>}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
    <TabBar items={[
      { i: "home", l: "Today" }, { i: "map", l: "Map" }, { i: "users", l: "Customers" }, { i: "chart", l: "Stats" },
    ]} active="Stats" />
  </Phone>
);

/* ============================================================
   EMPLOYEE — LEAVE APPLICATION
   ============================================================ */
const EmpLeave = () => (
  <Phone tint="light" time="09:24">
    <ScreenHeader title="Apply for leave" />
    <div style={{ flex: 1, overflow: "auto", paddingBottom: 100, background: "var(--bg)" }}>
      <div style={{ padding: 16 }}>
        {/* Leave balance */}
        <div style={{
          background: "var(--fg)", color: "white",
          borderRadius: 14, padding: 14, marginBottom: 16,
        }}>
          <div style={{ fontSize: 11, opacity: 0.6, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 10 }}>YOUR BALANCE · FY26</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>6.5</div>
              <div style={{ fontSize: 10, opacity: 0.65 }}>Casual</div>
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>4</div>
              <div style={{ fontSize: 10, opacity: 0.65 }}>Sick</div>
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", color: "#f5c249" }}>12</div>
              <div style={{ fontSize: 10, opacity: 0.65 }}>Earned</div>
            </div>
          </div>
        </div>

        {/* Type selector */}
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>LEAVE TYPE</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
          {[
            { l: "Casual", b: "6.5d", a: false },
            { l: "Sick",   b: "4d",   a: true },
            { l: "Earned", b: "12d",  a: false },
            { l: "Unpaid", b: "—",    a: false },
          ].map((t) => (
            <label key={t.l} style={{
              padding: 12, borderRadius: 10, cursor: "pointer",
              border: t.a ? "1.5px solid var(--primary)" : "1px solid var(--border)",
              background: t.a ? "var(--primary-soft)" : "white",
            }}>
              <input type="radio" defaultChecked={t.a} style={{ display: "none" }} />
              <div style={{ fontSize: 13, fontWeight: 600 }}>{t.l}</div>
              <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>{t.b} remaining</div>
            </label>
          ))}
        </div>

        {/* Dates */}
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>DATES</div>
        <div style={{ background: "white", borderRadius: 12, padding: 12, marginBottom: 16, border: "1px solid var(--border)" }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: "var(--fg-subtle)", textTransform: "uppercase", letterSpacing: "0.04em" }}>From</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em" }}>May 23, Sat</div>
            </div>
            <Icon name="arrowRight" size={14} className="subtle" style={{ alignSelf: "center" }} />
            <div style={{ flex: 1, textAlign: "right" }}>
              <div style={{ fontSize: 10, color: "var(--fg-subtle)", textTransform: "uppercase", letterSpacing: "0.04em" }}>To</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em" }}>May 24, Sun</div>
            </div>
          </div>
          <div style={{ padding: 8, background: "var(--bg-sunken)", borderRadius: 6, fontSize: 12, color: "var(--fg-muted)", display: "flex", justifyContent: "space-between" }}>
            <span>Total</span>
            <strong className="mono" style={{ color: "var(--fg)" }}>2 days</strong>
          </div>
        </div>

        {/* Reason */}
        <div className="field">
          <label className="field-label">Reason</label>
          <textarea className="input" rows="3" defaultValue="Family function — sister's engagement ceremony" />
        </div>

        {/* Approver */}
        <div style={{ background: "white", borderRadius: 12, padding: 12, border: "1px solid var(--border)", marginTop: 14, display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name="Neha Iyer" color={4} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>Approver</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Neha Iyer · HR Manager</div>
          </div>
          <Icon name="chevDown" size={14} className="subtle" />
        </div>
      </div>
    </div>
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0,
      padding: "12px 16px 32px", background: "white", borderTop: "1px solid var(--border)",
    }}>
      <button style={{
        width: "100%", padding: 14, borderRadius: 10,
        background: "var(--primary)", color: "white", border: "none",
        fontSize: 15, fontWeight: 600,
      }}>Submit application</button>
    </div>
  </Phone>
);

/* ============================================================
   EMPLOYEE — PAYSLIPS LIST
   ============================================================ */
const EmpPayslips = () => (
  <Phone tint="light" time="20:14">
    <ScreenHeader title="My payslips" sub="FY 2025-26" action={<Icon name="download" size={16} className="subtle" />} />
    <div style={{ flex: 1, overflow: "auto", paddingBottom: 90, background: "var(--bg)" }}>
      <div style={{ padding: 16 }}>
        {/* YTD summary */}
        <div style={{
          background: "linear-gradient(135deg, #2c3e7c 0%, #374d95 100%)",
          color: "white", borderRadius: 14, padding: 16, marginBottom: 16,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(200px 140px at 100% 0%, rgba(232,169,1,0.22), transparent 60%)" }}></div>
          <div style={{ position: "relative" }}>
            <div style={{ fontSize: 11, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600 }}>EARNINGS YTD</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, letterSpacing: "-0.025em", marginTop: 4 }}>₹2,73,800</div>
            <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>Apr 2025 → May 2026 · 12 cycles + bonus</div>
            <div style={{ display: "flex", gap: 14, marginTop: 14 }}>
              <div>
                <div style={{ fontSize: 10, opacity: 0.65 }}>TDS paid</div>
                <div className="mono" style={{ fontWeight: 600 }}>₹56,420</div>
              </div>
              <div>
                <div style={{ fontSize: 10, opacity: 0.65 }}>PF balance</div>
                <div className="mono" style={{ fontWeight: 600 }}>₹3,12,840</div>
              </div>
            </div>
          </div>
        </div>

        {/* Year selector */}
        <div className="tabs" style={{ border: "none", marginBottom: 12 }}>
          <span className="tab active">2025-26</span>
          <span className="tab">2024-25</span>
        </div>

        {/* Payslips */}
        {[
          { m: "May 2026", net: 68450, status: "draft", date: "Pay date May 31" },
          { m: "Apr 2026", net: 68450, status: "paid", date: "Credited Apr 30" },
          { m: "Mar 2026", net: 71200, status: "paid", date: "+ Bonus ₹2,750" },
          { m: "Feb 2026", net: 68450, status: "paid", date: "Credited Feb 28" },
          { m: "Jan 2026", net: 68450, status: "paid", date: "Credited Jan 31" },
        ].map((p) => (
          <div key={p.m} style={{
            background: "white", borderRadius: 12, padding: 14, marginBottom: 6,
            border: "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              background: p.status === "paid" ? "var(--primary-soft)" : "var(--warning-soft)",
              color: p.status === "paid" ? "var(--primary)" : "var(--warning)",
              display: "grid", placeItems: "center",
            }}>
              <Icon name="money" size={17} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{p.m}</span>
                {p.status === "draft" && <Badge tone="warning">Draft</Badge>}
              </div>
              <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>{p.date}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600, letterSpacing: "-0.015em" }}>₹{p.net.toLocaleString("en-IN")}</div>
              <div style={{ fontSize: 10, color: "var(--fg-subtle)" }}>Net pay</div>
            </div>
          </div>
        ))}
      </div>
    </div>
    <TabBar items={[
      { i: "home", l: "Home" }, { i: "calendar", l: "Leave" }, { i: "money", l: "Pay" }, { i: "user", l: "Profile" },
    ]} active="Pay" />
  </Phone>
);

/* ============================================================
   EMPLOYEE — PROFILE & DOCUMENTS
   ============================================================ */
const EmpProfile = () => (
  <Phone tint="light" time="20:48">
    <ScreenHeader title="My profile" />
    <div style={{ flex: 1, overflow: "auto", paddingBottom: 90, background: "var(--bg)" }}>
      {/* Header card */}
      <div style={{
        padding: "20px 16px",
        background: "linear-gradient(180deg, white, var(--bg))",
        textAlign: "center", borderBottom: "1px solid var(--border)",
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 18,
          margin: "0 auto 12px",
          background: "var(--primary)", color: "white",
          display: "grid", placeItems: "center",
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, letterSpacing: "-0.02em",
        }}>NI</div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, letterSpacing: "-0.015em" }}>Neha Iyer</div>
        <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>HR Manager · E-2018</div>
        <Badge tone="success" dot style={{ marginTop: 6 }}>Active · 6 yrs at Sudarshan</Badge>
      </div>

      <div style={{ padding: 16 }}>
        {/* Personal */}
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>PERSONAL</div>
        <div style={{ background: "white", borderRadius: 12, border: "1px solid var(--border)", marginBottom: 16 }}>
          {[
            { l: "Date of birth", v: "12 Aug 1989", i: "calendar" },
            { l: "Phone",          v: "+91 98•••42",  i: "phone" },
            { l: "Email",          v: "neha@sudarshan.co.in", i: "mail" },
            { l: "Address",         v: "Udaipur, Rajasthan", i: "pin" },
          ].map((r, i, arr) => (
            <div key={r.l} style={{
              padding: 12, display: "flex", alignItems: "center", gap: 12,
              borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
            }}>
              <Icon name={r.i} size={14} className="subtle" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: "var(--fg-subtle)" }}>{r.l}</div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{r.v}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Documents */}
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>DOCUMENTS</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
          {[
            { l: "Aadhaar",     d: "•••• 8421", i: "fileText", c: "primary" },
            { l: "PAN",         d: "AAAPM1234B", i: "fileText", c: "info" },
            { l: "Offer letter",d: "2018-03-15", i: "badge",    c: "success" },
            { l: "Form 16 FY25",d: "View / Download", i: "download", c: "warning" },
          ].map((d) => (
            <div key={d.l} style={{
              background: "white", borderRadius: 10, padding: 12,
              border: "1px solid var(--border)",
            }}>
              <span style={{
                width: 28, height: 28, borderRadius: 8, display: "grid", placeItems: "center",
                background: `var(--${d.c}-soft)`, color: `var(--${d.c})`, marginBottom: 8,
              }}><Icon name={d.i} size={14} /></span>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{d.l}</div>
              <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>{d.d}</div>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>QUICK LINKS</div>
        <div style={{ background: "white", borderRadius: 12, border: "1px solid var(--border)" }}>
          {[
            { l: "Investment declaration", i: "money" },
            { l: "Travel reimbursement",   i: "ticket" },
            { l: "Tax savings & 80C",       i: "bolt" },
            { l: "Settings & language",     i: "settings" },
            { l: "Sign out",                  i: "logout", danger: true },
          ].map((r, i, arr) => (
            <div key={r.l} style={{
              padding: 14, display: "flex", alignItems: "center", gap: 12,
              borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
              color: r.danger ? "var(--danger)" : "var(--fg)",
            }}>
              <Icon name={r.i} size={15} />
              <div style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{r.l}</div>
              <Icon name="chevRight" size={13} className="subtle" />
            </div>
          ))}
        </div>
      </div>
    </div>
    <TabBar items={[
      { i: "home", l: "Home" }, { i: "calendar", l: "Leave" }, { i: "money", l: "Pay" }, { i: "user", l: "Profile" },
    ]} active="Profile" />
  </Phone>
);

/* ============================================================
   PRODUCTION — QC CHECKLIST
   ============================================================ */
const ProdQC = () => (
  <Phone tint="light" time="14:55">
    <ScreenHeader title="QC checklist" sub="Batch B-4471 · Talc 600 mesh" />
    <div style={{ flex: 1, overflow: "auto", paddingBottom: 100, background: "var(--bg)" }}>
      <div style={{ padding: 16 }}>
        {/* Progress card */}
        <div style={{
          background: "linear-gradient(135deg, var(--success-soft), white)",
          border: "1px solid var(--success)",
          borderRadius: 14, padding: 14, marginBottom: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--success)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>BATCH QC</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", marginTop: 4 }}>5/7 passed</div>
            </div>
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "white", display: "grid", placeItems: "center",
              border: "4px solid var(--success)",
            }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--success)" }}>71%</span>
            </div>
          </div>
          <Bar value={71} tone="success" />
        </div>

        {/* Checklist */}
        {[
          { l: "Visual — color & consistency", val: "White, uniform",       pass: true,  spec: "Spec: Off-white ±5%" },
          { l: "Mesh size · 600",              val: "98.6%",                 pass: true,  spec: "Spec: ≥97%" },
          { l: "Moisture content",              val: "0.42%",                 pass: true,  spec: "Spec: <0.6%" },
          { l: "Loose density",                  val: "1.42 g/cc",             pass: true,  spec: "Spec: 1.4 ± 0.05" },
          { l: "Iron content (Fe₂O₃)",            val: "0.12%",                 pass: true,  spec: "Spec: <0.2%" },
          { l: "pH (5% aqueous)",                val: "9.4",                   pass: null,  spec: "Spec: 9.0 ± 0.5",  todo: true },
          { l: "Brightness (ISO)",                val: "Pending",                pass: null,  spec: "Spec: ≥92%",        todo: true },
        ].map((c, i) => (
          <div key={i} style={{
            background: "white", borderRadius: 12, padding: 12, marginBottom: 6,
            border: c.todo ? "1.5px dashed var(--border-strong)" : "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: c.pass ? "var(--success)" : c.pass === false ? "var(--danger)" : "var(--bg-sunken)",
              color: c.pass !== null ? "white" : "var(--fg-muted)",
              display: "grid", placeItems: "center",
              border: c.todo ? "1.5px solid var(--border-strong)" : "none",
            }}>
              {c.pass ? <Icon name="check" size={16} stroke={2.5} /> : c.pass === false ? <Icon name="x" size={16} /> : <Icon name="loader" size={14} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{c.l}</div>
              <div style={{ fontSize: 11, color: "var(--fg-subtle)" }}>{c.spec}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="mono" style={{ fontSize: 13, fontWeight: 600, color: c.pass === false ? "var(--danger)" : c.todo ? "var(--fg-muted)" : "var(--fg)" }}>{c.val}</div>
              {c.todo && <div style={{ fontSize: 10, color: "var(--warning)", fontWeight: 500 }}>Enter value</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0,
      padding: "12px 16px 32px", background: "white", borderTop: "1px solid var(--border)",
      display: "flex", gap: 8,
    }}>
      <button style={{
        flex: 1, padding: 14, borderRadius: 10,
        background: "var(--bg-sunken)", color: "var(--fg)", border: "none",
        fontSize: 13, fontWeight: 600,
      }}>Save draft</button>
      <button style={{
        flex: 2, padding: 14, borderRadius: 10,
        background: "var(--primary)", color: "white", border: "none",
        fontSize: 13, fontWeight: 600,
      }}>Complete remaining (2)</button>
    </div>
  </Phone>
);

/* ============================================================
   PRODUCTION — REPORT ISSUE
   ============================================================ */
const ProdIssue = () => (
  <Phone tint="light" time="15:12">
    <ScreenHeader title="Report issue" sub="L1 · Talc Mill A" />
    <div style={{ flex: 1, overflow: "auto", paddingBottom: 100, background: "var(--bg)" }}>
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>SEVERITY</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
          {[
            { l: "Minor",  c: "info",    active: false },
            { l: "Major",  c: "warning", active: true },
            { l: "Stop",   c: "danger",  active: false },
          ].map((s) => (
            <button key={s.l} style={{
              padding: 12, borderRadius: 10, border: s.active ? `1.5px solid var(--${s.c})` : "1px solid var(--border)",
              background: s.active ? `var(--${s.c}-soft)` : "white",
              color: s.active ? `var(--${s.c})` : "var(--fg)",
              fontSize: 13, fontWeight: 600,
            }}>{s.l}</button>
          ))}
        </div>

        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>CATEGORY</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
          {[
            { l: "Mechanical", i: "wrench",  active: true },
            { l: "Electrical", i: "bolt",     active: false },
            { l: "Material",   i: "box",      active: false },
            { l: "Other",      i: "alert",    active: false },
          ].map((s) => (
            <button key={s.l} style={{
              padding: 14, borderRadius: 10,
              border: s.active ? "1.5px solid var(--primary)" : "1px solid var(--border)",
              background: s.active ? "var(--primary-soft)" : "white",
              display: "flex", alignItems: "center", gap: 10,
              color: s.active ? "var(--primary)" : "var(--fg)", fontSize: 13, fontWeight: 600,
            }}>
              <Icon name={s.i} size={15} />
              {s.l}
            </button>
          ))}
        </div>

        <div className="field">
          <label className="field-label">Description</label>
          <textarea className="input" rows="3" defaultValue="Bearing on inlet side making high-pitched noise · suspect lubrication issue or wear" />
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>PHOTOS / VIDEO</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <div style={{
              aspectRatio: "1", borderRadius: 10,
              background: "linear-gradient(135deg, #5a5e66, #2c2f36)",
              border: "1px solid var(--border)", position: "relative",
            }}>
              <Icon name="play" size={18} style={{ position: "absolute", inset: 0, margin: "auto", color: "white" }} />
            </div>
            <div style={{
              aspectRatio: "1", borderRadius: 10,
              background: "linear-gradient(135deg, #efe3c8, #c8a04f)",
              border: "1px solid var(--border)",
            }}></div>
            <button style={{
              aspectRatio: "1", borderRadius: 10, border: "1.5px dashed var(--border-strong)",
              background: "var(--bg-sunken)", display: "grid", placeItems: "center",
              color: "var(--fg-muted)",
            }}>
              <Icon name="plus" size={20} />
            </button>
          </div>
        </div>

        <div style={{
          padding: 12, background: "var(--warning-soft)", borderRadius: 10,
          display: "flex", gap: 10, alignItems: "flex-start", marginTop: 16,
        }}>
          <Icon name="bell" size={14} style={{ color: "var(--warning)", flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 12 }}>
            <strong>Major issue</strong> — alerts Production Manager + Maintenance team. ETA response: 15 min.
          </div>
        </div>
      </div>
    </div>
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0,
      padding: "12px 16px 32px", background: "white", borderTop: "1px solid var(--border)",
    }}>
      <button style={{
        width: "100%", padding: 14, borderRadius: 10,
        background: "var(--danger)", color: "white", border: "none",
        fontSize: 15, fontWeight: 600,
      }}>Submit & alert team</button>
    </div>
  </Phone>
);

/* ============================================================
   PRODUCTION — BATCH LOG ENTRY
   ============================================================ */
const ProdLog = () => (
  <Phone tint="light" time="16:32">
    <ScreenHeader title="Hourly log" sub="B-4471 · 16:00 entry" />
    <div style={{ flex: 1, overflow: "auto", paddingBottom: 100, background: "var(--bg)" }}>
      <div style={{ padding: 16 }}>
        {/* Reading inputs */}
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>READINGS</div>
        <div style={{ background: "white", borderRadius: 12, padding: 14, border: "1px solid var(--border)", marginBottom: 16 }}>
          {[
            { l: "Output (MT)",        v: "2.4",   u: "MT/hr",   range: "2.0 – 2.8" },
            { l: "Power draw",          v: "184",  u: "kWh",     range: "170 – 200" },
            { l: "Motor temperature",    v: "62",   u: "°C",      range: "<75" },
            { l: "Vibration · main",     v: "3.8",  u: "mm/s",    range: "<6.0" },
          ].map((r, i, arr) => (
            <div key={r.l} style={{
              padding: "10px 0",
              borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{r.l}</div>
                <div style={{ fontSize: 11, color: "var(--fg-subtle)" }}>Normal: {r.range}</div>
              </div>
              <input className="input" defaultValue={r.v} style={{ width: 80, textAlign: "right" }} />
              <span className="mono subtle" style={{ fontSize: 11, width: 44 }}>{r.u}</span>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>OBSERVATIONS</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
          {[
            { l: "Smooth running", on: true,  i: "check" },
            { l: "Vibration",       on: false, i: "alert" },
            { l: "Unusual noise",   on: false, i: "alert" },
            { l: "Material flow OK", on: true,  i: "check" },
          ].map((t) => (
            <button key={t.l} style={{
              padding: 12, borderRadius: 10, display: "flex", gap: 8, alignItems: "center",
              border: t.on ? "1.5px solid var(--primary)" : "1px solid var(--border)",
              background: t.on ? "var(--primary-soft)" : "white",
              color: t.on ? "var(--primary)" : "var(--fg)",
              fontSize: 12, fontWeight: 500, textAlign: "left",
            }}>
              <Icon name={t.i} size={14} />
              {t.l}
            </button>
          ))}
        </div>

        <div className="field">
          <label className="field-label">Operator note (optional)</label>
          <textarea className="input" rows="2" placeholder="Anything noteworthy from this hour…" />
        </div>

        <div style={{
          marginTop: 16, padding: 14, background: "white", border: "1px solid var(--border)",
          borderRadius: 12,
        }}>
          <div style={{ fontSize: 11, color: "var(--fg-subtle)", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600, marginBottom: 8 }}>LAST 4 HOURS</div>
          <svg width="100%" height="60" viewBox="0 0 280 60">
            {[2.3, 2.4, 2.5, 2.3, 2.4, 2.2, 2.6, 2.4, 2.5].map((v, i, a) => {
              const x = (i / (a.length - 1)) * 280;
              const y = 50 - (v - 2) * 60;
              return <circle key={i} cx={x} cy={y} r="3" fill="var(--primary)" />;
            })}
            <polyline
              points={[2.3, 2.4, 2.5, 2.3, 2.4, 2.2, 2.6, 2.4, 2.5].map((v, i, a) => `${(i / (a.length - 1)) * 280},${50 - (v - 2) * 60}`).join(" ")}
              fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0,
      padding: "12px 16px 32px", background: "white", borderTop: "1px solid var(--border)",
    }}>
      <button style={{
        width: "100%", padding: 14, borderRadius: 10,
        background: "var(--primary)", color: "white", border: "none",
        fontSize: 15, fontWeight: 600,
      }}>Log & continue</button>
    </div>
  </Phone>
);

/* ============================================================
   OWNER MOBILE APP — SNAPSHOT
   ============================================================ */
const OwnerApp = () => (
  <Phone tint="light" time="08:24">
    <div style={{ flex: 1, overflow: "auto", paddingBottom: 90 }}>
      {/* Hero */}
      <div style={{
        background: "linear-gradient(155deg, #1a2349 0%, #2c3e7c 50%, #374d95 100%)",
        color: "white", padding: "16px 20px 26px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(300px 220px at 100% 0%, rgba(232,169,1,0.20), transparent 60%)" }}></div>
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 11, opacity: 0.65 }}>Good morning,</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, letterSpacing: "-0.015em" }}>Rajiv Mehta</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "rgba(255,255,255,0.14)", color: "white", display: "grid", placeItems: "center", position: "relative" }}>
                <Icon name="bell" size={15} />
                <span style={{ position: "absolute", top: 5, right: 5, width: 8, height: 8, borderRadius: 4, background: "var(--secondary)" }}></span>
              </button>
            </div>
          </div>

          <div style={{ fontSize: 11, opacity: 0.65, marginBottom: 4, letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 600 }}>GROUP REVENUE · MTD</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 600, letterSpacing: "-0.025em", lineHeight: 1 }}>₹11.82 <span style={{ fontSize: 18, opacity: 0.7 }}>Cr</span></div>
          <div style={{ fontSize: 12, marginTop: 6 }}>
            <span style={{ color: "#7ee5a0" }}>↑ 12.4%</span>
            <span style={{ opacity: 0.65 }}> vs last month</span>
          </div>

          <div style={{
            marginTop: 20,
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: 1, background: "rgba(255,255,255,0.10)",
            borderRadius: 10, overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            <div style={{ padding: 12, background: "rgba(255,255,255,0.04)" }}>
              <div style={{ fontSize: 10, opacity: 0.65 }}>Sudarshan Minerals</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em", marginTop: 2 }}>₹7.10 Cr</div>
              <div style={{ fontSize: 10, color: "#7ee5a0" }}>↑ 14.1%</div>
            </div>
            <div style={{ padding: 12, background: "rgba(255,255,255,0.04)" }}>
              <div style={{ fontSize: 10, opacity: 0.65 }}>Sudarshan Microns</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em", marginTop: 2 }}>₹4.72 Cr</div>
              <div style={{ fontSize: 10, color: "#7ee5a0" }}>↑ 9.2%</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI grid */}
      <div style={{ padding: "16px 16px 8px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { l: "Open orders", v: "78", c: "primary",  delta: "+12" },
            { l: "In transit",  v: "6",  c: "info",      delta: "live" },
            { l: "Gross margin",v: "34.8%", c: "success", delta: "+1.6pp" },
            { l: "Receivables", v: "₹1.84 Cr", c: "warning", delta: "₹84L > 60d" },
          ].map((k) => (
            <div key={k.l} style={{ background: "white", borderRadius: 12, padding: 12, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, color: "var(--fg-subtle)" }}>{k.l}</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", marginTop: 2 }}>{k.v}</div>
              <div style={{ fontSize: 10, color: `var(--${k.c})`, fontWeight: 500, marginTop: 2 }}>{k.delta}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Approvals */}
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>NEEDS YOUR APPROVAL</div>
          <Badge tone="warning">5</Badge>
        </div>
        {[
          { who: "Anil Kapoor", what: "PO ₹18.4 L · Hindustan Talc",     i: "cart",     c: "primary" },
          { who: "Neha Iyer",   what: "Salary revision · 4 employees",     i: "money",   c: "success" },
          { who: "Manish Joshi",what: "Production downtime > 4 hrs · L8",  i: "alert",   c: "danger" },
        ].map((a, i) => (
          <div key={i} style={{
            background: "white", borderRadius: 12, padding: 12, marginBottom: 6,
            border: "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ width: 32, height: 32, borderRadius: 8, background: `var(--${a.c}-soft)`, color: `var(--${a.c})`, display: "grid", placeItems: "center" }}>
              <Icon name={a.i} size={15} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{a.what}</div>
              <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>From {a.who}</div>
            </div>
            <button style={{
              width: 30, height: 30, borderRadius: 8,
              background: "var(--bg-sunken)", border: "none",
              display: "grid", placeItems: "center", color: "var(--danger)",
            }}><Icon name="x" size={14} /></button>
            <button style={{
              width: 30, height: 30, borderRadius: 8,
              background: "var(--success)", border: "none",
              display: "grid", placeItems: "center", color: "white",
            }}><Icon name="check" size={14} stroke={2.5} /></button>
          </div>
        ))}
      </div>
    </div>

    <TabBar items={[
      { i: "home", l: "Home" }, { i: "chart", l: "Reports" }, { i: "bell", l: "Approvals" }, { i: "user", l: "Profile" },
    ]} active="Home" />
  </Phone>
);

/* ============================================================
   OWNER — APPROVALS QUEUE (full screen)
   ============================================================ */
const OwnerApprovals = () => (
  <Phone tint="light" time="08:42">
    <ScreenHeader title="Approvals" sub="5 pending · ₹24.8 L total" back={false} />
    <div style={{ flex: 1, overflow: "auto", paddingBottom: 90, background: "var(--bg)" }}>
      {/* Tab filter */}
      <div className="tabs" style={{ border: "none", padding: "8px 16px 0", overflowX: "auto" }}>
        <span className="tab active">All <span className="tab-count">5</span></span>
        <span className="tab">POs <span className="tab-count">2</span></span>
        <span className="tab">HR <span className="tab-count">2</span></span>
        <span className="tab">Other <span className="tab-count">1</span></span>
      </div>

      <div style={{ padding: 16 }}>
        {[
          { type: "PO",  amt: "₹18.40 L", who: "Anil Kapoor",  date: "Today · 11:30 AM", what: "PO-2026-0142 · Hindustan Talc Mines",        sub: "20 MT Talc 600 mesh + 5 MT 800 mesh", i: "cart",   c: "primary", urgent: true },
          { type: "PO",  amt: "₹2.18 L",  who: "Sunita Verma", date: "Today · 10:15 AM", what: "PO-2026-0143 · Gujarat PP Yarns",            sub: "1,500 pcs FIBC 500 kg",                 i: "cart",   c: "primary", urgent: false },
          { type: "HR",  amt: "—",        who: "Neha Iyer",     date: "Yesterday",         what: "Salary revision · 4 employees",               sub: "Avg increase 8% · effective Jun 1",     i: "money", c: "success", urgent: false },
          { type: "HR",  amt: "—",        who: "Vinod Sharma",  date: "Yesterday",         what: "Leave application · 5 days sick",              sub: "May 22 → May 26 · medical certificate",  i: "calendar", c: "info", urgent: false },
          { type: "Ops", amt: "₹4.20 L",  who: "Manish Joshi", date: "2 days ago",        what: "Production downtime > 4 hrs · Line L8",      sub: "Zeolite dryer · gearbox failure",       i: "alert", c: "danger", urgent: true },
        ].map((a, i) => (
          <div key={i} style={{
            background: "white", borderRadius: 14, padding: 14, marginBottom: 8,
            border: a.urgent ? "1px solid var(--danger)" : "1px solid var(--border)",
            position: "relative",
          }}>
            {a.urgent && (
              <span style={{ position: "absolute", top: 14, right: 14,
                padding: "2px 7px", borderRadius: 4, background: "var(--danger-soft)",
                color: "var(--danger)", fontSize: 10, fontWeight: 600, letterSpacing: "0.05em",
              }}>URGENT</span>
            )}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <span style={{ width: 36, height: 36, borderRadius: 9, background: `var(--${a.c}-soft)`, color: `var(--${a.c})`, display: "grid", placeItems: "center", flexShrink: 0 }}>
                <Icon name={a.i} size={17} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <Badge tone="default" sq>{a.type}</Badge>
                  {a.amt !== "—" && <span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>{a.amt}</span>}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{a.what}</div>
                <div style={{ fontSize: 11, color: "var(--fg-muted)", marginTop: 4 }}>{a.sub}</div>
                <div style={{ fontSize: 11, color: "var(--fg-subtle)", marginTop: 4 }}>From {a.who} · {a.date}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
              <button style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid var(--border)", background: "white", fontSize: 12, fontWeight: 600 }}>
                Details
              </button>
              <button style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid var(--border)", background: "white", fontSize: 12, fontWeight: 600, color: "var(--danger)" }}>
                Reject
              </button>
              <button style={{ flex: 2, padding: 10, borderRadius: 8, border: "none", background: "var(--success)", color: "white", fontSize: 12, fontWeight: 600 }}>
                Approve
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
    <TabBar items={[
      { i: "home", l: "Home" }, { i: "chart", l: "Reports" }, { i: "bell", l: "Approvals" }, { i: "user", l: "Profile" },
    ]} active="Approvals" />
  </Phone>
);

/* ============================================================
   STORE — STOCK CHECK (with barcode scan placeholder)
   ============================================================ */
const StoreStockCheck = () => (
  <Phone tint="light" time="10:32">
    <ScreenHeader title="Stock check" sub="Plant A · Stores" action={<Icon name="filter" size={16} className="subtle" />} />
    <div style={{ flex: 1, overflow: "auto", paddingBottom: 100, background: "var(--bg)" }}>
      <div style={{ padding: 16 }}>
        {/* Scanner card */}
        <div style={{
          background: "var(--fg)", color: "white",
          borderRadius: 14, padding: 16, marginBottom: 16,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ fontSize: 11, opacity: 0.65, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>SCAN A SKU</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, letterSpacing: "-0.015em", marginTop: 4 }}>Tap to open camera</div>
          <div style={{
            marginTop: 14, height: 80, borderRadius: 10,
            border: "1.5px dashed rgba(255,255,255,0.3)",
            display: "grid", placeItems: "center", color: "rgba(255,255,255,0.7)",
            position: "relative",
          }}>
            <Icon name="search" size={26} />
            <div style={{
              position: "absolute", left: "20%", right: "20%", top: "50%",
              height: 2, background: "var(--secondary)", opacity: 0.8,
              boxShadow: "0 0 12px var(--secondary)",
            }}></div>
          </div>
          <div style={{ fontSize: 11, opacity: 0.6, marginTop: 8 }}>Align barcode within frame</div>
        </div>

        {/* Recent scans */}
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>RECENT</div>
        {[
          { code: "RM-TAL-001", name: "Talcum Powder",        stock: 84.5,  unit: "MT",  loc: "Bay 1",  status: "ok" },
          { code: "RM-CC-002",  name: "Calcium Carbonate",     stock: 12.3,  unit: "MT",  loc: "Bay 2",  status: "low" },
          { code: "SP-BLT-002", name: "V-Belt B-92",            stock: 4,     unit: "pcs", loc: "Rack 1", status: "low" },
          { code: "PK-FIBC-25", name: "FIBC Bag · 1000 kg",     stock: 4280,  unit: "pcs", loc: "Bay 3",  status: "ok" },
        ].map((s) => (
          <div key={s.code} style={{
            background: "white", borderRadius: 12, padding: 12, marginBottom: 6,
            border: "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 9, flexShrink: 0,
              background: s.status === "low" ? "var(--warning-soft)" : "var(--success-soft)",
              color: s.status === "low" ? "var(--warning)" : "var(--success)",
              display: "grid", placeItems: "center",
            }}>
              <Icon name="box" size={17} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div>
              <div style={{ fontSize: 11, color: "var(--fg-muted)" }} className="mono">{s.code} · {s.loc}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="mono" style={{ fontSize: 14, fontWeight: 600 }}>{s.stock}</div>
              <div style={{ fontSize: 10, color: "var(--fg-subtle)" }}>{s.unit}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
    <TabBar items={[
      { i: "search", l: "Scan" }, { i: "box", l: "Stock" }, { i: "download", l: "Receive" }, { i: "user", l: "Me" },
    ]} active="Scan" />
  </Phone>
);

/* ============================================================
   STORE — RECEIVE SHIPMENT
   ============================================================ */
const StoreReceive = () => (
  <Phone tint="light" time="11:08">
    <ScreenHeader title="Receive shipment" sub="Against PO-2026-0140" />
    <div style={{ flex: 1, overflow: "auto", paddingBottom: 100, background: "var(--bg)" }}>
      <div style={{ padding: 16 }}>
        {/* Vendor card */}
        <div style={{
          background: "white", borderRadius: 14, padding: 14,
          border: "1px solid var(--border)", marginBottom: 16,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <Avatar name="Bharat Polychem" color={3} size="lg" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>Vendor</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Bharat Polychem Industries</div>
            <div style={{ fontSize: 11, color: "var(--fg-subtle)" }} className="mono">PO-2026-0140 · ₹9.80 L</div>
          </div>
        </div>

        {/* Items */}
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>RECEIVE LINE ITEMS</div>
        {[
          { name: "Zeolite · 4A detergent grade", ordered: "20 MT", received: "20 MT", status: "matched" },
          { name: "Soda Ash · Light",               ordered: "15 MT", received: "14.8 MT", status: "short" },
          { name: "Sodium Silicate · 1.6 ratio",     ordered: "5 KL",  received: "5 KL",   status: "matched" },
          { name: "STPP · Tech 94%",                  ordered: "8 MT",  received: "", status: "pending" },
        ].map((p, i) => (
          <div key={i} style={{
            background: "white", borderRadius: 12, padding: 12, marginBottom: 6,
            border: p.status === "short" ? "1.5px solid var(--warning)" : "1px solid var(--border)",
            ...(p.status === "short" && { background: "var(--warning-soft)" }),
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, flex: 1, paddingRight: 8 }}>{p.name}</div>
              {p.status === "matched" && <span style={{ width: 22, height: 22, borderRadius: 6, background: "var(--success)", color: "white", display: "grid", placeItems: "center" }}><Icon name="check" size={12} stroke={2.5} /></span>}
              {p.status === "short" && <Badge tone="warning">Short</Badge>}
              {p.status === "pending" && <Badge tone="default">Pending</Badge>}
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ fontSize: 11 }}>
                <span className="muted">Ordered:</span> <span className="mono" style={{ fontWeight: 600 }}>{p.ordered}</span>
              </div>
              <Icon name="arrowRight" size={11} className="subtle" />
              <div style={{ flex: 1, display: "flex", gap: 6, alignItems: "center" }}>
                <input className="input" placeholder="Received qty" defaultValue={p.received} style={{ flex: 1, height: 30 }} />
                <span className="mono subtle" style={{ fontSize: 11 }}>{p.ordered.split(" ")[1]}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Photos */}
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginTop: 16, marginBottom: 8 }}>WEIGHBRIDGE & UNLOADING</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          <div style={{ aspectRatio: "1", borderRadius: 10, background: "linear-gradient(135deg, #5a5e66, #2c2f36)", border: "1px solid var(--border)", display: "grid", placeItems: "center", color: "white", fontSize: 10 }}>Weighbridge</div>
          <div style={{ aspectRatio: "1", borderRadius: 10, background: "linear-gradient(135deg, #efe3c8, #c8a04f)", border: "1px solid var(--border)" }}></div>
          <button style={{
            aspectRatio: "1", borderRadius: 10, border: "1.5px dashed var(--border-strong)",
            background: "var(--bg-sunken)", display: "grid", placeItems: "center",
            color: "var(--fg-muted)",
          }}>
            <Icon name="plus" size={20} />
          </button>
        </div>
      </div>
    </div>
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0,
      padding: "12px 16px 32px", background: "white", borderTop: "1px solid var(--border)",
      display: "flex", gap: 8,
    }}>
      <button style={{
        flex: 1, padding: 14, borderRadius: 10,
        background: "var(--bg-sunken)", color: "var(--fg)", border: "none",
        fontSize: 13, fontWeight: 600,
      }}>Save partial</button>
      <button style={{
        flex: 2, padding: 14, borderRadius: 10,
        background: "var(--primary)", color: "white", border: "none",
        fontSize: 13, fontWeight: 600,
      }}>Confirm receipt</button>
    </div>
  </Phone>
);

export { DriverHistory, DriverPOD, DriverVehicleCheck, SalesCustomer, SalesNewOrder, SalesHistory, EmpLeave, EmpPayslips, EmpProfile, ProdQC, ProdIssue, ProdLog, OwnerApp, OwnerApprovals, StoreStockCheck, StoreReceive };
