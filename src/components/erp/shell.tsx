// @ts-nocheck
'use client';


import React, { useState } from "react";
import { Icon } from "./icons";

/* ============================================================
   SIDEBAR + TOPBAR
   ============================================================ */


const NAV = [
  {
    id: "dashboards",
    label: "Dashboards",
    items: [
      { id: "/dashboard/master",     label: "Master",      icon: "master" },
      { id: "/dashboard/admin",      label: "Admin",       icon: "shield" },
      { id: "/dashboard/owner",      label: "Owner",       icon: "crown" },
      { id: "/dashboard/production", label: "Production",  icon: "factory" },
      { id: "/dashboard/dispatch",   label: "Dispatch",    icon: "truck" },
    ],
  },
  {
    id: "inventory",
    label: "Inventory",
    items: [
      { id: "/inventory/raw-material", label: "Raw Material", icon: "box" },
      { id: "/inventory/packaging",    label: "Packaging",    icon: "package" },
      { id: "/inventory/spare-parts",  label: "Spare Parts",  icon: "wrench" },
    ],
  },
  {
    id: "procurement",
    label: "Procurement",
    items: [
      { id: "/procurement/vendors",   label: "Vendors",          icon: "users" },
      { id: "/procurement/po",        label: "Purchase Orders",  icon: "cart" },
      { id: "/procurement/invoices",  label: "Invoice Verify",   icon: "invoice" },
    ],
  },
  {
    id: "sales",
    label: "Sales & Orders",
    items: [
      { id: "/customers",             label: "Customers",        icon: "users" },
      { id: "/orders",                label: "Customer Orders",  icon: "ticket" },
      { id: "/field-sales",           label: "Field Sales",      icon: "pin" },
    ],
  },
  {
    id: "ops",
    label: "Operations",
    items: [
      { id: "/production",            label: "Production",       icon: "factory" },
      { id: "/dispatch",              label: "Dispatch & Track", icon: "truck" },
    ],
  },
  {
    id: "people",
    label: "People",
    items: [
      { id: "/hrms/employees",   label: "Employees",   icon: "user" },
      { id: "/hrms/attendance",  label: "Attendance",  icon: "clock" },
      { id: "/hrms/payroll",     label: "Payroll",     icon: "money" },
    ],
  },
  {
    id: "system",
    label: "System",
    items: [
      { id: "/reports",        label: "Reports",          icon: "chart" },
      { id: "/users",          label: "User Management",  icon: "shield" },
      { id: "/design-system",  label: "Design System",    icon: "layout" },
    ],
  },
];

const Sidebar = ({ route, navigate, company, onCompanyClick, badgeMap = {} }) => {
  const [collapsed, setCollapsed] = useState({});
  const toggle = (id) => setCollapsed((c) => ({ ...c, [id]: !c[id] }));

  return (
    <aside className="sidebar">
      <div className="sb-brand" onClick={onCompanyClick} title="Switch company">
        <div className={`sb-brand-mark ${company.mark === "gold" ? "sec" : ""}`}>
          {company.mark === "gold" ? "M" : "S"}
        </div>
        <div className="sb-brand-text">
          <div className="sb-brand-name">{company.name}</div>
          <div className="sb-brand-sub">
            <span className="dot success" style={{ width: 5, height: 5 }}></span>
            {company.plant}
          </div>
        </div>
        <div className="sb-brand-switch">
          <Icon name="switch" size={14} />
        </div>
      </div>

      <div className="sb-search">
        <div className="sb-search-box">
          <Icon name="search" size={13} />
          <span>Search…</span>
          <div className="kbd-group" style={{ marginLeft: "auto", display: "flex", gap: 2 }}>
            <span className="kbd">⌘</span>
            <span className="kbd">K</span>
          </div>
        </div>
      </div>

      <nav className="sb-nav">
        {NAV.map((section) => (
          <div key={section.id} className={`sb-section ${collapsed[section.id] ? "collapsed" : ""}`}>
            <div className="sb-section-label" onClick={() => toggle(section.id)}>
              <span>{section.label}</span>
              <Icon name="chevDown" size={11} className="chev" />
            </div>
            <div className="sb-section-items">
              {section.items.map((item) => {
                const isActive = route === item.id || (route && route.startsWith(item.id));
                const badges = badgeMap[item.id];
                return (
                  <div
                    key={item.id}
                    className={`sb-item ${isActive ? "active" : ""}`}
                    onClick={() => navigate(item.id)}
                  >
                    <span className="sb-item-icon">
                      <Icon name={item.icon} size={15} />
                    </span>
                    <span className="sb-item-label">{item.label}</span>
                    {badges?.badge && <span className="sb-item-badge">{badges.badge}</span>}
                    {badges?.badgeAlert && (
                      <span className="sb-item-badge alert">{badges.badgeAlert}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="sb-foot">
        <div className="sb-foot-avatar">RM</div>
        <div className="sb-foot-info">
          <div className="sb-foot-name">Rajiv Mehta</div>
          <div className="sb-foot-role">Owner · Both companies</div>
        </div>
        <button className="sb-foot-btn" title="Settings">
          <Icon name="settings" size={14} />
        </button>
      </div>
    </aside>
  );
};

/* ============================================================
   TOPBAR
   ============================================================ */
const breadcrumbsFor = (route) => {
  const map = {
    "/dashboard/master":     ["Dashboards", "Master"],
    "/dashboard/admin":      ["Dashboards", "Admin"],
    "/dashboard/owner":      ["Dashboards", "Owner"],
    "/dashboard/production": ["Dashboards", "Production"],
    "/dashboard/dispatch":   ["Dashboards", "Dispatch"],
    "/inventory/raw-material":["Inventory", "Raw Material"],
    "/inventory/packaging":  ["Inventory", "Packaging"],
    "/inventory/spare-parts":["Inventory", "Spare Parts"],
    "/procurement/vendors":  ["Procurement", "Vendors"],
    "/procurement/po":       ["Procurement", "Purchase Orders"],
    "/procurement/invoices": ["Procurement", "Invoice Verification"],
    "/customers":            ["Sales", "Customers"],
    "/orders":               ["Sales", "Orders"],
    "/field-sales":          ["Sales", "Field Sales"],
    "/production":           ["Operations", "Production"],
    "/dispatch":             ["Operations", "Dispatch & Tracking"],
    "/hrms/employees":         ["People", "Employees"],
    "/hrms/attendance":        ["People", "Attendance"],
    "/hrms/payroll":           ["People", "Payroll"],
    "/reports":              ["System", "Reports"],
    "/users":                ["System", "User Management"],
    "/design-system":        ["System", "Design System"],
  };
  return map[route] || [route];
};

const Topbar = ({ route, onNotifClick, onMobileClick, onLogout }) => {
  const crumbs = breadcrumbsFor(route);
  return (
    <header className="topbar">
      <div className="tb-bread">
        <span className="crumb"><Icon name="home" size={14} /></span>
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            <span className="sep"><Icon name="chevRight" size={12} /></span>
            <span className={`crumb ${i === crumbs.length - 1 ? "last" : ""}`}>{c}</span>
          </React.Fragment>
        ))}
      </div>

      <div className="tb-actions">
        <button className="tb-iconbtn" title="Mobile preview" onClick={onMobileClick}>
          <Icon name="phone" size={15} />
        </button>
        <button className="tb-iconbtn" title="Help"><Icon name="help" size={15} /></button>
        <button className="tb-iconbtn" onClick={onNotifClick} title="Notifications">
          <Icon name="bell" size={15} />
          <span className="dot"></span>
        </button>
        <div className="divider v"></div>
        <button className="btn ghost" onClick={onLogout}>
          <Icon name="logout" size={13} />
        </button>
      </div>
    </header>
  );
};

export { Sidebar, Topbar, NAV };
