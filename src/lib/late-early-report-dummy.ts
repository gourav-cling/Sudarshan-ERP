export type LateEarlyEmployeeRow = {
  employeeId: string;
  employeeName: string;
  department: string;
  shift: string;
  unit: string;
  latePunches: number;
  totalLateMins: number;
  avgLateMins: number;
  earlyGoing: number;
  totalEarlyMins: number;
  repeatOffender: boolean;
  critical: boolean;
  pattern: number[];
};

export type LateEarlyDeptRow = {
  department: string;
  headcount: number;
  lateIncidents: number;
  lateMinsTotal: number;
  avgLatePerEmp: number;
  earlyGoingIncidents: number;
  compliancePct: number;
};

export type LateEarlyShiftRow = {
  shift: string;
  lateIncidents: number;
  avgLateMins: number;
  earlyGoing: number;
};

export type LateEarlyUnitRow = {
  unit: string;
  headcount: number;
  late: number;
  early: number;
  compliancePct: number;
};

export type LateEarlyKpi = {
  latePunches: number;
  lateAvgMins: number;
  lateEmployeesAffected: number;
  earlyIncidents: number;
  earlyAvgMins: number;
  earlyEmployees: number;
  repeatOffenders: number;
  criticalOffenders: number;
  onTimeCount: number;
  totalEmployees: number;
};

const EMPLOYEES: LateEarlyEmployeeRow[] = [
  {
    employeeId: "EMP-2046",
    employeeName: "Vikram Singh",
    department: "Maintenance",
    shift: "Shift A",
    unit: "Udaipur",
    latePunches: 8,
    totalLateMins: 186,
    avgLateMins: 23,
    earlyGoing: 2,
    totalEarlyMins: 45,
    repeatOffender: true,
    critical: false,
    pattern: [2, 1, 3, 0, 2, 1, 2],
  },
  {
    employeeId: "EMP-2049",
    employeeName: "Suresh K.",
    department: "Production",
    shift: "Shift A",
    unit: "Udaipur",
    latePunches: 6,
    totalLateMins: 112,
    avgLateMins: 19,
    earlyGoing: 1,
    totalEarlyMins: 22,
    repeatOffender: true,
    critical: false,
    pattern: [1, 2, 1, 1, 0, 1, 1],
  },
  {
    employeeId: "EMP-2052",
    employeeName: "Priya Sharma",
    department: "Quality",
    shift: "General",
    unit: "Udaipur",
    latePunches: 2,
    totalLateMins: 28,
    avgLateMins: 14,
    earlyGoing: 0,
    totalEarlyMins: 0,
    repeatOffender: false,
    critical: false,
    pattern: [0, 1, 0, 0, 1, 0, 0],
  },
  {
    employeeId: "EMP-2058",
    employeeName: "Rajesh Mehta",
    department: "Despatch",
    shift: "Shift B",
    unit: "Makrana",
    latePunches: 5,
    totalLateMins: 95,
    avgLateMins: 19,
    earlyGoing: 3,
    totalEarlyMins: 78,
    repeatOffender: true,
    critical: false,
    pattern: [1, 1, 2, 1, 0, 1, 2],
  },
  {
    employeeId: "EMP-2061",
    employeeName: "Anita Desai",
    department: "Stores",
    shift: "General",
    unit: "Udaipur",
    latePunches: 1,
    totalLateMins: 12,
    avgLateMins: 12,
    earlyGoing: 0,
    totalEarlyMins: 0,
    repeatOffender: false,
    critical: false,
    pattern: [0, 0, 1, 0, 0, 0, 0],
  },
  {
    employeeId: "EMP-2065",
    employeeName: "Kiran Patel",
    department: "Production",
    shift: "Shift C",
    unit: "Udaipur",
    latePunches: 11,
    totalLateMins: 248,
    avgLateMins: 23,
    earlyGoing: 1,
    totalEarlyMins: 30,
    repeatOffender: true,
    critical: true,
    pattern: [3, 2, 2, 1, 2, 2, 1],
  },
  {
    employeeId: "EMP-2070",
    employeeName: "Meena Joshi",
    department: "HR & Admin",
    shift: "General",
    unit: "Udaipur",
    latePunches: 0,
    totalLateMins: 0,
    avgLateMins: 0,
    earlyGoing: 0,
    totalEarlyMins: 0,
    repeatOffender: false,
    critical: false,
    pattern: [0, 0, 0, 0, 0, 0, 0],
  },
  {
    employeeId: "EMP-2074",
    employeeName: "Deepak Jain",
    department: "Quality",
    shift: "Shift B",
    unit: "Makrana",
    latePunches: 4,
    totalLateMins: 72,
    avgLateMins: 18,
    earlyGoing: 2,
    totalEarlyMins: 40,
    repeatOffender: false,
    critical: false,
    pattern: [1, 0, 1, 1, 0, 1, 0],
  },
];

const DEPARTMENTS: LateEarlyDeptRow[] = [
  {
    department: "Production",
    headcount: 96,
    lateIncidents: 68,
    lateMinsTotal: 1240,
    avgLatePerEmp: 13,
    earlyGoingIncidents: 8,
    compliancePct: 88,
  },
  {
    department: "Quality",
    headcount: 28,
    lateIncidents: 12,
    lateMinsTotal: 186,
    avgLatePerEmp: 7,
    earlyGoingIncidents: 2,
    compliancePct: 95,
  },
  {
    department: "Maintenance",
    headcount: 34,
    lateIncidents: 22,
    lateMinsTotal: 420,
    avgLatePerEmp: 12,
    earlyGoingIncidents: 4,
    compliancePct: 82,
  },
  {
    department: "Despatch",
    headcount: 22,
    lateIncidents: 18,
    lateMinsTotal: 310,
    avgLatePerEmp: 14,
    earlyGoingIncidents: 6,
    compliancePct: 71,
  },
  {
    department: "HR & Admin",
    headcount: 18,
    lateIncidents: 2,
    lateMinsTotal: 24,
    avgLatePerEmp: 1,
    earlyGoingIncidents: 0,
    compliancePct: 98,
  },
  {
    department: "Stores",
    headcount: 24,
    lateIncidents: 8,
    lateMinsTotal: 96,
    avgLatePerEmp: 4,
    earlyGoingIncidents: 1,
    compliancePct: 92,
  },
];

const SHIFTS: LateEarlyShiftRow[] = [
  { shift: "Shift A (06:00)", lateIncidents: 52, avgLateMins: 19, earlyGoing: 6 },
  { shift: "Shift B (14:00)", lateIncidents: 38, avgLateMins: 17, earlyGoing: 9 },
  { shift: "Shift C (22:00)", lateIncidents: 28, avgLateMins: 21, earlyGoing: 4 },
  { shift: "General (09:00)", lateIncidents: 24, avgLateMins: 14, earlyGoing: 4 },
];

const UNITS: LateEarlyUnitRow[] = [
  { unit: "Udaipur", headcount: 168, late: 98, early: 14, compliancePct: 78 },
  { unit: "Makrana", headcount: 76, late: 44, early: 9, compliancePct: 74 },
];

export function getLateEarlyReportDummy() {
  const kpi: LateEarlyKpi = {
    latePunches: 142,
    lateAvgMins: 18,
    lateEmployeesAffected: 38,
    earlyIncidents: 23,
    earlyAvgMins: 25,
    earlyEmployees: 12,
    repeatOffenders: 9,
    criticalOffenders: 2,
    onTimeCount: 186,
    totalEmployees: 244,
  };

  return {
    kpi,
    employees: EMPLOYEES,
    departments: DEPARTMENTS,
    shifts: SHIFTS,
    units: UNITS,
    filterDepartments: [
      "Production",
      "Quality",
      "Maintenance",
      "Despatch",
      "HR & Admin",
      "Stores",
    ],
  };
}
