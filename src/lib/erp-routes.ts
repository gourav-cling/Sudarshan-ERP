/** ERP paths (formerly hash routes in Sudarshan ERP.html). */
export const ERP_ROUTES = [
  "/dashboard/master",
  "/dashboard/admin",
  "/dashboard/owner",
  "/dashboard/production",
  "/dashboard/dispatch",
  "/inventory/raw-material",
  "/inventory/packaging",
  "/inventory/spare-parts",
  "/procurement/vendors",
  "/procurement/po",
  "/procurement/invoices",
  "/customers",
  "/orders",
  "/field-sales",
  "/production",
  "/dispatch",
  "/hrms/employees",
  "/hrms/attendance",
  "/hrms/reports",
  "/hrms/leave",
  "/hrms/leave/policy",
  "/hrms/holidays",
  "/hrms/salary",
  "/hrms/payroll",
  "/reports",
  "/users",
  "/design-system",
] as const;

export type ErpRoute = (typeof ERP_ROUTES)[number];

export function pathToRoute(segments: string[] | undefined): string {
  if (!segments?.length) return "/dashboard/master";
  const route = "/" + segments.join("/");
  return (ERP_ROUTES as readonly string[]).includes(route) ? route : "/dashboard/master";
}

export function routeToSegments(route: string): string[] {
  return route.replace(/^\//, "").split("/").filter(Boolean);
}
