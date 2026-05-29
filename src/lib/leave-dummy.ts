export type LeaveBalanceCard = {
  code: string;
  name: string;
  balance: string;
  detail: string;
  color: string;
  progress: number;
};

export type LeaveHistoryRow = {
  id: string;
  type: string;
  typeColor: string;
  from: string;
  to: string;
  days: number;
  reason: string;
  approver: string;
  appliedOn: string;
  status: "Approved" | "Pending" | "Cancelled";
};

export type LeaveLedgerRow = {
  type: string;
  typeColor: string;
  opening: number | string;
  earned: number | string;
  used: number | string;
  encashed: number | string;
  lapsed: number | string;
  carryFwd: number | string;
  closing: number | string;
};

export type LeaveApprovalRow = {
  id: string;
  employeeName: string;
  employeeId: string;
  department: string;
  type: string;
  typeColor: string;
  fromDate: string;
  toDate: string;
  fromTo: string;
  days: number;
  reason: string;
  description?: string;
  balanceAfter: string;
  applied: string;
  contact?: string;
  sla: string;
  slaTone: "success" | "warning" | "error";
};

export type ApprovalWorkflowRow = {
  id: string;
  leaveType: string;
  daysRange: string;
  l1Approver: string;
  l2Approver: string;
  l3Escalation: string;
  slaDays: number;
  autoApproveAfterSla: boolean;
};

export type LeaveTypeMasterRow = {
  code: string;
  name: string;
  yearly: string;
  accrual: string;
  carryFwd: string;
  encashable: boolean;
  halfDay: boolean;
  docRequired: boolean;
  appliesTo: string;
  active: boolean;
};

export type HolidayRow = {
  date: string;
  name: string;
  type: "public" | "optional";
};

const LEAVE_TYPE_COLORS: Record<string, string> = {
  PL: "green",
  CL: "blue",
  SL: "red",
  "Comp.Off": "orange",
  OD: "purple",
  LWP: "default",
};

export function leaveTypeColor(code: string) {
  return LEAVE_TYPE_COLORS[code] ?? "default";
}

export function getLeaveDummy() {
  const employee = {
    name: "Ramesh Kumar",
    id: "EMP-2048",
    department: "Production",
    shift: "Shift A",
    doj: "12-Aug-2019",
    confirmed: "12-Feb-2020",
    badge: "Permanent",
  };

  const balances: LeaveBalanceCard[] = [
    {
      code: "PL",
      name: "Privilege Leave",
      balance: "14.5",
      detail: "Earned 18 · Used 3.5 · Carry-fwd 0",
      color: "#059669",
      progress: 80,
    },
    {
      code: "CL",
      name: "Casual Leave",
      balance: "5",
      detail: "Allotted 7 · Used 2 · Lapses Mar-26",
      color: "#2563eb",
      progress: 71,
    },
    {
      code: "SL",
      name: "Sick Leave",
      balance: "3",
      detail: "Allotted 7 · Used 4",
      color: "#dc2626",
      progress: 43,
    },
    {
      code: "Comp.Off",
      name: "Comp. Off",
      balance: "2",
      detail: "Earned 3 · Used 1 · Expires 90d",
      color: "#d97706",
      progress: 67,
    },
    {
      code: "OD",
      name: "On Duty",
      balance: "—",
      detail: "Used 4 days this year",
      color: "#7c3aed",
      progress: 0,
    },
  ];

  const history: LeaveHistoryRow[] = [
    {
      id: "1",
      type: "PL",
      typeColor: "green",
      from: "20-Feb-2025",
      to: "22-Feb-2025",
      days: 3,
      reason: "Family function",
      approver: "Anita Desai",
      appliedOn: "10-Feb-2025",
      status: "Approved",
    },
    {
      id: "2",
      type: "CL",
      typeColor: "blue",
      from: "05-Mar-2025",
      to: "05-Mar-2025",
      days: 1,
      reason: "Personal",
      approver: "Anita Desai",
      appliedOn: "01-Mar-2025",
      status: "Pending",
    },
    {
      id: "3",
      type: "SL",
      typeColor: "red",
      from: "18-Jan-2025",
      to: "19-Jan-2025",
      days: 2,
      reason: "Fever — medical certificate attached",
      approver: "Anita Desai",
      appliedOn: "17-Jan-2025",
      status: "Approved",
    },
    {
      id: "4",
      type: "Comp.Off",
      typeColor: "orange",
      from: "08-Mar-2025",
      to: "08-Mar-2025",
      days: 1,
      reason: "Saturday work compensation",
      approver: "Anita Desai",
      appliedOn: "06-Mar-2025",
      status: "Approved",
    },
    {
      id: "5",
      type: "OD",
      typeColor: "purple",
      from: "12-Mar-2025",
      to: "14-Mar-2025",
      days: 3,
      reason: "Vendor visit Makrana plant",
      approver: "Anita Desai",
      appliedOn: "08-Mar-2025",
      status: "Cancelled",
    },
  ];

  const ledger: LeaveLedgerRow[] = [
    {
      type: "PL",
      typeColor: "green",
      opening: 2,
      earned: 18,
      used: 3.5,
      encashed: 0,
      lapsed: 0,
      carryFwd: 2,
      closing: 14.5,
    },
    {
      type: "CL",
      typeColor: "blue",
      opening: 0,
      earned: 7,
      used: 2,
      encashed: 0,
      lapsed: 0,
      carryFwd: 0,
      closing: 5,
    },
    {
      type: "SL",
      typeColor: "red",
      opening: 1,
      earned: 7,
      used: 4,
      encashed: 0,
      lapsed: 1,
      carryFwd: 0,
      closing: 3,
    },
    {
      type: "Comp.Off",
      typeColor: "orange",
      opening: 0,
      earned: 3,
      used: 1,
      encashed: 0,
      lapsed: 0,
      carryFwd: 0,
      closing: 2,
    },
    {
      type: "OD",
      typeColor: "purple",
      opening: "—",
      earned: "—",
      used: 4,
      encashed: "—",
      lapsed: "—",
      carryFwd: "—",
      closing: "—",
    },
  ];

  const approvalKpi = {
    pending: 12,
    pendingSla: 3,
    approvedMonth: 48,
    approvedDays: 142,
    approvedEmployees: 28,
    rejectedMonth: 3,
    onLeaveToday: 5,
    onLeaveBreakdown: "2 PL · 1 CL · 1 SL · 1 OD",
  };

  const pendingApprovals: LeaveApprovalRow[] = [
    {
      id: "a1",
      employeeName: "Ramesh Kumar",
      employeeId: "EMP-2048",
      department: "Production",
      type: "PL",
      typeColor: "green",
      fromDate: "12-Mar-2025",
      toDate: "14-Mar-2025",
      fromTo: "12 → 14 Mar 2025",
      days: 3,
      reason: "Family wedding",
      description: "Sister's marriage in home town — need 3 days PL. Backup arranged with Vikram Singh.",
      balanceAfter: "11.5 PL",
      applied: "10 Mar 2025",
      contact: "+91 98765 43210",
      sla: "1 day",
      slaTone: "warning",
    },
    {
      id: "a2",
      employeeName: "Priya Sharma",
      employeeId: "EMP-2051",
      department: "Quality",
      type: "SL",
      typeColor: "red",
      fromDate: "15-Mar-2025",
      toDate: "15-Mar-2025",
      fromTo: "15 Mar 2025",
      days: 1,
      reason: "Fever (cert. attached)",
      description: "High fever — medical certificate uploaded. Single day SL.",
      balanceAfter: "2 SL",
      applied: "14 Mar 2025",
      contact: "+91 91234 56780",
      sla: "Same day",
      slaTone: "success",
    },
    {
      id: "a3",
      employeeName: "Vikram Singh",
      employeeId: "EMP-2046",
      department: "Maintenance",
      type: "CL",
      typeColor: "blue",
      fromDate: "18-Mar-2025",
      toDate: "18-Mar-2025",
      fromTo: "18 Mar 2025",
      days: 1,
      reason: "Personal",
      description: "Personal errand — half day not required.",
      balanceAfter: "4 CL",
      applied: "15 Mar 2025",
      sla: "3 days",
      slaTone: "error",
    },
    {
      id: "a4",
      employeeName: "Lakshmi Reddy",
      employeeId: "EMP-2059",
      department: "Despatch",
      type: "Comp.Off",
      typeColor: "orange",
      fromDate: "20-Mar-2025",
      toDate: "20-Mar-2025",
      fromTo: "20 Mar 2025",
      days: 1,
      reason: "Saturday work compensation",
      description: "Worked on 08-Mar (Saturday) — availing compensatory off.",
      balanceAfter: "1 Comp.Off",
      applied: "17 Mar 2025",
      sla: "2 days",
      slaTone: "warning",
    },
  ];

  const approvalWorkflow: ApprovalWorkflowRow[] = [
    { id: "w1", leaveType: "PL", daysRange: "1–5", l1Approver: "Reporting Manager", l2Approver: "HR Admin", l3Escalation: "Plant Head", slaDays: 2, autoApproveAfterSla: false },
    { id: "w2", leaveType: "PL", daysRange: "6–10", l1Approver: "Reporting Manager", l2Approver: "HR Admin", l3Escalation: "Plant Head", slaDays: 3, autoApproveAfterSla: false },
    { id: "w3", leaveType: "PL", daysRange: ">10", l1Approver: "Reporting Manager", l2Approver: "HR Admin", l3Escalation: "Director HR", slaDays: 5, autoApproveAfterSla: false },
    { id: "w4", leaveType: "CL", daysRange: "Any", l1Approver: "Reporting Manager", l2Approver: "—", l3Escalation: "HR Admin", slaDays: 1, autoApproveAfterSla: false },
    { id: "w5", leaveType: "SL", daysRange: "1–2", l1Approver: "Reporting Manager", l2Approver: "—", l3Escalation: "—", slaDays: 1, autoApproveAfterSla: true },
    { id: "w6", leaveType: "SL", daysRange: ">2", l1Approver: "Reporting Manager", l2Approver: "HR Admin", l3Escalation: "—", slaDays: 2, autoApproveAfterSla: false },
    { id: "w7", leaveType: "Comp.Off", daysRange: "Any", l1Approver: "Reporting Manager", l2Approver: "HR Admin", l3Escalation: "—", slaDays: 2, autoApproveAfterSla: false },
    { id: "w8", leaveType: "OD", daysRange: "Any", l1Approver: "Reporting Manager", l2Approver: "Department Head", l3Escalation: "HR Admin", slaDays: 1, autoApproveAfterSla: false },
  ];

  const leaveTypes: LeaveTypeMasterRow[] = [
    {
      code: "PL",
      name: "Privilege Leave",
      yearly: "18",
      accrual: "Monthly (1.5)",
      carryFwd: "30",
      encashable: true,
      halfDay: true,
      docRequired: false,
      appliesTo: "Permanent",
      active: true,
    },
    {
      code: "CL",
      name: "Casual Leave",
      yearly: "7",
      accrual: "Yearly",
      carryFwd: "0",
      encashable: false,
      halfDay: true,
      docRequired: false,
      appliesTo: "All",
      active: true,
    },
    {
      code: "SL",
      name: "Sick Leave",
      yearly: "7",
      accrual: "Yearly",
      carryFwd: "0",
      encashable: false,
      halfDay: true,
      docRequired: true,
      appliesTo: "All",
      active: true,
    },
    {
      code: "Comp.Off",
      name: "Compensatory Off",
      yearly: "Unlimited",
      accrual: "Earned (work on holiday/Sun)",
      carryFwd: "Expires 90 d",
      encashable: false,
      halfDay: true,
      docRequired: false,
      appliesTo: "All",
      active: true,
    },
    {
      code: "OD",
      name: "On Duty",
      yearly: "—",
      accrual: "Per event",
      carryFwd: "—",
      encashable: false,
      halfDay: false,
      docRequired: false,
      appliesTo: "All",
      active: true,
    },
    {
      code: "LWP",
      name: "Leave Without Pay",
      yearly: "—",
      accrual: "—",
      carryFwd: "—",
      encashable: false,
      halfDay: true,
      docRequired: false,
      appliesTo: "All",
      active: true,
    },
  ];

  const holidays: HolidayRow[] = [
    { date: "14-Mar-2025", name: "Holi", type: "public" },
    { date: "29-Mar-2025", name: "Eid-ul-Fitr", type: "public" },
    { date: "15-Aug-2025", name: "Independence Day", type: "public" },
    { date: "02-Oct-2025", name: "Gandhi Jayanti", type: "optional" },
  ];

  const balancePreview = [
    { type: "PL — Privilege", value: "14.5" },
    { type: "CL — Casual", value: "5" },
    { type: "SL — Sick", value: "3", warn: true },
    { type: "Comp.Off", value: "2" },
    { type: "OD — On Duty", value: "—" },
    { type: "LWP this month", value: "0" },
  ];

  const recentApplications = [
    {
      type: "PL",
      range: "12–14 Mar",
      days: "3d",
      reason: "Family wedding",
      status: "Pending" as const,
    },
    {
      type: "CL",
      range: "05 Mar",
      days: "1d",
      reason: "Personal errand",
      status: "Approved" as const,
    },
    {
      type: "SL",
      range: "18–19 Jan",
      days: "2d",
      reason: "Fever",
      status: "Cancelled" as const,
    },
  ];

  return {
    employee,
    balances,
    history,
    ledger,
    approvalKpi,
    pendingApprovals,
    approvalWorkflow,
    leaveTypes,
    holidays,
    balancePreview,
    recentApplications,
    companies: [
      { value: "smi", label: "Sudarshan Minerals & Industries (Udaipur)" },
      { value: "makrana", label: "Sudarshan Marble (Makrana)" },
    ],
    employees: [
      {
        value: "EMP-2048",
        label: "EMP-2048 — Ramesh Kumar (Production)",
      },
    ],
    leaveYears: [{ value: "2025", label: "2025 (Apr–Mar)" }],
  };
}
