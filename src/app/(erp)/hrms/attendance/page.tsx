"use client";

import { Card, Typography, Table, Badge, Button, Select } from "antd";
import {
  ClockCircleOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

export default function AttendancePage() {
  const attendanceData = [
    { key: "1", id: "E-2014", name: "Rajiv Mehta", time: "09:02 AM", status: "On Time", method: "Bio-Metric" },
    { key: "2", id: "E-2018", name: "Priya Sharma", time: "08:55 AM", status: "On Time", method: "Bio-Metric" },
    { key: "3", id: "E-2019", name: "Anil Kapoor", time: "09:15 AM", status: "Late Entry", method: "Mobile App" },
    { key: "4", id: "E-2020", name: "Sunita Verma", time: "09:00 AM", status: "On Time", method: "Bio-Metric" },
    { key: "5", id: "E-2021", name: "Vikram Bhatia", time: "09:04 AM", status: "On Time", method: "Bio-Metric" },
  ];

  const columns = [
    { title: "Emp ID", dataIndex: "id", key: "id", render: (text: string) => <span className="font-bold">{text}</span> },
    { title: "Name", dataIndex: "name", key: "name", render: (text: string) => <span className="font-semibold">{text}</span> },
    { title: "Check-in Time", dataIndex: "time", key: "time" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Badge
          status={status === "On Time" ? "success" : "warning"}
          text={<span className={`font-semibold ${status === "On Time" ? "text-emerald-600" : "text-amber-600"}`}>{status}</span>}
        />
      ),
    },
    { title: "Method", dataIndex: "method", key: "method" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-[26px] font-bold tracking-tight text-zinc-950 leading-none">
          Attendance Tracker
        </h1>
        <p className="text-zinc-500 text-sm font-normal mt-2 leading-none">
          Real-time check-in logs and shift tracking
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="rounded-xl border-zinc-200/30 shadow-sm" bodyStyle={{ padding: "20px 24px" }}>
          <div className="flex justify-between items-start">
            <div>
              <div className="text-zinc-400 font-semibold text-[11px] uppercase tracking-wider">Present Today</div>
              <div className="text-[34px] font-extrabold text-zinc-900 mt-2">92%</div>
              <div className="text-emerald-500 text-xs font-semibold mt-2">282 / 306 present</div>
            </div>
            <div className="bg-emerald-50 text-emerald-500 h-9 w-9 rounded-lg flex items-center justify-center">
              <CheckCircleOutlined className="text-lg" />
            </div>
          </div>
        </Card>

        <Card className="rounded-xl border-zinc-200/30 shadow-sm" bodyStyle={{ padding: "20px 24px" }}>
          <div className="flex justify-between items-start">
            <div>
              <div className="text-zinc-400 font-semibold text-[11px] uppercase tracking-wider">Late Arrivals</div>
              <div className="text-[34px] font-extrabold text-zinc-900 mt-2">14</div>
              <div className="text-amber-500 text-xs font-semibold mt-2">Requires verification</div>
            </div>
            <div className="bg-amber-50 text-amber-500 h-9 w-9 rounded-lg flex items-center justify-center">
              <ClockCircleOutlined className="text-lg" />
            </div>
          </div>
        </Card>

        <Card className="rounded-xl border-zinc-200/30 shadow-sm" bodyStyle={{ padding: "20px 24px" }}>
          <div className="flex justify-between items-start">
            <div>
              <div className="text-zinc-400 font-semibold text-[11px] uppercase tracking-wider">Active Leaves</div>
              <div className="text-[34px] font-extrabold text-zinc-900 mt-2">8</div>
              <div className="text-zinc-400 text-xs font-normal mt-2">3 planned + 5 sick</div>
            </div>
            <div className="bg-zinc-50 text-zinc-400 h-9 w-9 rounded-lg flex items-center justify-center">
              <CalendarOutlined className="text-lg" />
            </div>
          </div>
        </Card>

        <Card className="rounded-xl border-zinc-200/30 shadow-sm" bodyStyle={{ padding: "20px 24px" }}>
          <div className="flex justify-between items-start">
            <div>
              <div className="text-zinc-400 font-semibold text-[11px] uppercase tracking-wider">No-Shows</div>
              <div className="text-[34px] font-extrabold text-rose-600 mt-2">16</div>
              <div className="text-rose-500 text-xs font-semibold mt-2">Unexcused absentees</div>
            </div>
            <div className="bg-rose-50 text-rose-500 h-9 w-9 rounded-lg flex items-center justify-center">
              <WarningOutlined className="text-lg" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden p-6 flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div className="font-bold text-zinc-900 text-base">Today's Check-ins</div>
          <Select defaultValue="today" style={{ width: 120 }}>
            <Select.Option value="today">Today</Select.Option>
            <Select.Option value="yesterday">Yesterday</Select.Option>
          </Select>
        </div>
        <Table dataSource={attendanceData} columns={columns} pagination={false} />
      </div>
    </div>
  );
}
