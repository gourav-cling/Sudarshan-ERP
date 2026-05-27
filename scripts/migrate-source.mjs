#!/usr/bin/env node
/**
 * Copies and transforms Sudarshan Group JSX sources for Next.js.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SRC_ROOT = path.join(ROOT, "..");
const OUT = path.join(ROOT, "src", "components", "erp");

const FILES = [
  { from: "src/icons.jsx", out: "icons.tsx" },
  { from: "src/data.jsx", out: "data.ts" },
  { from: "src/ui.jsx", out: "ui.tsx" },
  { from: "src/shell.jsx", out: "shell.tsx" },
  { from: "src/auth.jsx", out: "auth.tsx" },
  { from: "src/dashboards.jsx", out: "dashboards.tsx" },
  { from: "src/modules.jsx", out: "modules.tsx" },
  { from: "src/modules2.jsx", out: "modules2.tsx" },
  { from: "src/modules3.jsx", out: "modules3.tsx" },
  { from: "src/modules4.jsx", out: "modules4.tsx" },
  { from: "src/admin.jsx", out: "admin.tsx" },
  { from: "src/mobile.jsx", out: "mobile.tsx" },
  { from: "src/mobile2.jsx", out: "mobile2.tsx" },
  { from: "starter/design-canvas.jsx", out: "design-canvas.tsx" },
  { from: "starter/ios-frame.jsx", out: "ios-frame.tsx" },
];

const EXPORT_MAP = {
  "icons.tsx": ["Icon"],
  "data.ts": ["DATA"],
  "ui.tsx": [
    "Btn", "Badge", "StatusBadge", "Avatar", "Bar", "Sparkline", "Kpi", "Modal",
    "fmtINR", "fmtINRFull", "fmtNum", "AreaChart", "BarChart", "Donut",
  ],
  "shell.tsx": ["Sidebar", "Topbar", "NAV"],
  "auth.tsx": ["Login", "Forgot", "CompanySelect"],
  "dashboards.tsx": [
    "MasterDashboard", "AdminDashboard", "OwnerDashboard",
    "ProductionDashboard", "DispatchDashboard", "DashHead", "SectionH",
  ],
  "modules.tsx": ["RawMaterialInventory", "Vendors", "DispatchTracking"],
  "modules2.tsx": ["Customers", "CustomerOrders", "FieldSales", "InvoiceVerify"],
  "modules3.tsx": ["Employees", "Attendance", "Payroll", "Reports", "PackagingInventory"],
  "modules4.tsx": ["SparePartsInventory"],
  "admin.tsx": ["UserManagement", "DesignSystem", "Placeholder"],
  "mobile.tsx": ["DriverApp", "FieldSalesApp", "EmployeeApp", "ProductionApp", "Phone"],
  "mobile2.tsx": [
    "DriverHistory", "DriverPOD", "DriverVehicleCheck",
    "SalesCustomer", "SalesNewOrder", "SalesHistory",
    "EmpLeave", "EmpPayslips", "EmpProfile",
    "ProdQC", "ProdIssue", "ProdLog",
    "OwnerApp", "OwnerApprovals",
    "StoreStockCheck", "StoreReceive",
  ],
  "design-canvas.tsx": ["DesignCanvas", "DCSection", "DCArtboard", "DCPostIt"],
  "ios-frame.tsx": null, // read from file after transform
};

function transform(content, outName) {
  let s = content;

  // Remove global comments
  s = s.replace(/^\/\* global[\s\S]*?\*\/\s*\n?/m, "");

  // use client
  if (!s.startsWith("'use client'")) {
    s = "'use client';\n\n" + s;
  }

  // React import + hook destructuring
  const hookAliases = [];
  const hookMatch = s.match(
    /const\s*\{\s*([^}]+)\s*\}\s*=\s*React\s*;/
  );
  if (hookMatch) {
    const parts = hookMatch[1].split(",").map((p) => p.trim());
    const imports = [];
    for (const part of parts) {
      const m = part.match(/(\w+)(?:\s*:\s*(\w+))?/);
      if (!m) continue;
      const orig = m[1];
      const alias = m[2] || orig;
      if (alias !== orig) hookAliases.push([orig, alias]);
      if (!imports.includes(orig)) imports.push(orig);
    }
    s = s.replace(hookMatch[0], "");
    const hookImport = `import { ${imports.join(", ")} } from "react";\n`;
    s = s.replace("'use client';\n\n", `'use client';\n\nimport React from "react";\n${hookImport}\n`);
    for (const [orig, alias] of hookAliases) {
      const re = new RegExp(`\\b${alias}\\b`, "g");
      s = s.replace(re, orig);
    }
  } else if (!s.includes('from "react"')) {
    s = s.replace(
      "'use client';\n\n",
      `'use client';\n\nimport React from "react";\n`
    );
  }

  // window.DATA = { ... } -> export const DATA = { ... }
  s = s.replace(/window\.DATA\s*=\s*/, "export const DATA = ");

  // Remove window.X = X lines
  s = s.replace(/^window\.\w+\s*=\s*\w+;\s*\n?/gm, "");

  // Remove Object.assign(window, { ... });
  s = s.replace(/Object\.assign\(window,\s*\{[\s\S]*?\}\);\s*\n?/g, "");

  // design-canvas state file path for API
  s = s.replace(
    "const DC_STATE_FILE = '.design-canvas.state.json';",
    "const DC_STATE_FILE = '/api/design-canvas/state';"
  );

  // fetch('./' + DC_STATE_FILE) -> fetch(DC_STATE_FILE)
  s = s.replace(/fetch\('\.\/' \+ DC_STATE_FILE\)/g, "fetch(DC_STATE_FILE)");

  return s;
}

function addExports(s, outName) {
  const names = EXPORT_MAP[outName];
  if (!names || names.length === 0) return s;
  const existing = names.filter((n) => s.includes(`export ${n}`) || s.includes(`export function ${n}`) || s.includes(`export const ${n}`));
  const toExport = names.filter((n) => !existing.includes(n));
  if (toExport.length === 0) return s;
  return `${s.trim()}\n\nexport { ${toExport.join(", ")} };\n`;
}

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(path.join(ROOT, "src", "styles"), { recursive: true });

for (const css of ["tokens.css", "app.css"]) {
  fs.copyFileSync(
    path.join(SRC_ROOT, "styles", css),
    path.join(ROOT, "src", "styles", css)
  );
}

for (const { from, out } of FILES) {
  const srcPath = path.join(SRC_ROOT, from);
  let content = fs.readFileSync(srcPath, "utf8");
  content = transform(content, out);
  content = addExports(content, out);

  // Per-file import fixes
  if (out === "data.ts") {
    content = content.replace(/^import React[^\n]*\n\n/m, "");
    content = content.replace("'use client';\n\n", "");
  }

  const importBlocks = {
    "ui.tsx": `import { Icon } from "./icons";\n`,
    "shell.tsx": `import { Icon } from "./icons";\nimport { DATA } from "./data";\n`,
    "auth.tsx": `import { Icon } from "./icons";\nimport { DATA } from "./data";\nimport { Btn, Badge } from "./ui";\n`,
    "dashboards.tsx": `import { Icon } from "./icons";\nimport { DATA } from "./data";\nimport { Btn, Badge, StatusBadge, Avatar, Bar, Sparkline, Kpi, Modal, fmtINR, fmtINRFull, fmtNum, AreaChart, BarChart, Donut } from "./ui";\n`,
    "modules.tsx": `import { Icon } from "./icons";\nimport { DATA } from "./data";\nimport { Btn, Badge, StatusBadge, Avatar, Bar, Sparkline, Kpi, Modal, fmtINR, fmtINRFull, fmtNum, AreaChart, BarChart, Donut } from "./ui";\nimport { DashHead, SectionH } from "./dashboards";\n`,
    "modules2.tsx": `import { Icon } from "./icons";\nimport { DATA } from "./data";\nimport { Btn, Badge, StatusBadge, Avatar, Bar, Sparkline, Kpi, Modal, fmtINR, fmtINRFull, fmtNum, AreaChart, BarChart, Donut } from "./ui";\nimport { DashHead, SectionH } from "./dashboards";\n`,
    "modules3.tsx": `import { Icon } from "./icons";\nimport { DATA } from "./data";\nimport { Btn, Badge, StatusBadge, Avatar, Bar, Sparkline, Kpi, Modal, fmtINR, fmtINRFull, fmtNum, AreaChart, BarChart, Donut } from "./ui";\nimport { DashHead, SectionH } from "./dashboards";\n`,
    "modules4.tsx": `import { Icon } from "./icons";\nimport { DATA } from "./data";\nimport { Btn, Badge, StatusBadge, Avatar, Bar, Sparkline, Kpi, Modal, fmtINR, fmtINRFull, fmtNum, AreaChart, BarChart, Donut } from "./ui";\nimport { DashHead, SectionH } from "./dashboards";\n`,
    "admin.tsx": `import { Icon } from "./icons";\nimport { DATA } from "./data";\nimport { Btn, Badge, StatusBadge, Avatar, Bar, Sparkline, Kpi, Modal, fmtINR, fmtINRFull, fmtNum, AreaChart, BarChart, Donut } from "./ui";\n`,
    "mobile.tsx": `import { Icon } from "./icons";\nimport { DATA } from "./data";\nimport { Btn, Badge, StatusBadge, Avatar, Bar, Sparkline, Kpi, Modal, fmtINR, fmtINRFull, fmtNum } from "./ui";\n`,
    "mobile2.tsx": `import { Icon } from "./icons";\nimport { DATA } from "./data";\nimport { Btn, Badge, StatusBadge, Avatar, Bar, Sparkline, Kpi, Modal, fmtINR, fmtINRFull, fmtNum } from "./ui";\nimport { Phone } from "./mobile";\n`,
  };

  if (importBlocks[out]) {
    content = content.replace(
      /'use client';\n\nimport React[^\n]*\n(?:import \{[^}]+\} from "react";\n)?\n?/,
      `'use client';\n\nimport React from "react";\n${importBlocks[out]}\n`
    );
  }

  fs.writeFileSync(path.join(OUT, out), content);
  console.log("Wrote", out);
}

console.log("Migration complete.");
