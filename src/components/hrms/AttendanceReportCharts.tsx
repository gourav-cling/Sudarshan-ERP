"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type {
  DeptBreakdownPoint,
  WeeklyTrendPoint,
} from "@/lib/attendance-report-dummy";

const PRESENT_COLOR = "#16a34a";
const ABSENT_COLOR = "#dc2626";
const DEPT_COLORS = [
  "#4f46e5",
  "#0891b2",
  "#d97706",
  "#7c3aed",
  "#db2777",
  "#059669",
  "#64748b",
];

export function AttendanceTrendChart({ data }: { data: WeeklyTrendPoint[] }) {
  return (
    <div className="chart-frame">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart
          data={data}
          margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis dataKey="week" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="present"
            name="Present"
            stroke={PRESENT_COLOR}
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="absent"
            name="Absent"
            stroke={ABSENT_COLOR}
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="chart-legend">
        <span className="chart-legend-item">
          <span
            className="chart-legend-swatch"
            style={{ background: PRESENT_COLOR }}
          />
          Present
        </span>
        <span className="chart-legend-item">
          <span
            className="chart-legend-swatch"
            style={{ background: ABSENT_COLOR }}
          />
          Absent
        </span>
      </div>
    </div>
  );
}

export function DepartmentBreakdownChart({
  data,
}: {
  data: DeptBreakdownPoint[];
}) {
  return (
    <div className="chart-frame">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
            unit="%"
          />
          <YAxis
            type="category"
            dataKey="dept"
            width={108}
            tick={{ fontSize: 11 }}
          />
          <Tooltip formatter={(v) => [`${v}%`, "Present"]} />
          <Bar dataKey="presentPct" name="Present %" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
