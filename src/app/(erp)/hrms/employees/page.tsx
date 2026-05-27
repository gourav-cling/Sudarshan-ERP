"use client";

import { useState, useMemo, useEffect } from "react";
import { Avatar, Button, Input, Select, Space, Tabs, Tag } from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  TeamOutlined,
  UsergroupAddOutlined,
  UserDeleteOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  DownloadOutlined,
  FilterOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import Link from "next/link";

import CommonTable, {
  type CommonTableColumn,
} from "@/components/common/CommonTable";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";

interface Employee {
  id: string;
  name: string;
  initials: string;
  bg: string;
  fg: string;
  role: string;
  department: string;
  joined: number;
  reportingTo: string;
  status: "Active" | "Onboarding" | "On leave";
}

const STATUS_TAG_COLORS: Record<Employee["status"], string> = {
  Active: "success",
  Onboarding: "processing",
  "On leave": "warning",
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | Employee["status"]>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");

  // Fetch dynamic employees from MongoDB
  useEffect(() => {
    async function loadEmployees() {
      try {
        setLoading(true);
        const response = await fetch("/api/hrms/employees");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const mapped: Employee[] = data.data.map((emp: any) => {
              const names = emp.fullName.trim().split(" ");
              const initials =
                names.length > 1
                  ? (names[0][0] + names[names.length - 1][0]).toUpperCase()
                  : names[0].substring(0, 2).toUpperCase();

              // Generate premium background palette based on name characters
              const bgColors = [
                "#fef3c7",
                "#dbeafe",
                "#ffedd5",
                "#dcfce7",
                "#f3e8ff",
                "#e0e7ff",
                "#fee2e2",
              ];
              const fgColors = [
                "#b45309",
                "#1d4ed8",
                "#c2410c",
                "#15803d",
                "#7e22ce",
                "#4338ca",
                "#b91c1c",
              ];
              const index = emp.fullName.charCodeAt(0) % bgColors.length;

              return {
                id: emp.employeeId,
                name: emp.fullName,
                initials,
                bg: bgColors[index],
                fg: fgColors[index],
                role: emp.designation,
                department: emp.department,
                joined: emp.dateJoining
                  ? parseInt(emp.dateJoining.split("/")[2]) || 2026
                  : 2026,
                reportingTo: emp.reportingManager
                  ? emp.reportingManager.split(" — ")[0]
                  : "—",
                status:
                  emp.employmentType === "Apprentice" ? "Onboarding" : "Active",
              };
            });

            setEmployees(mapped);
          }
        }
      } catch (e) {
        console.error("Failed to fetch employees:", e);
      } finally {
        setLoading(false);
      }
    }
    loadEmployees();
  }, []);

  const counts = useMemo(() => {
    const base: Record<Employee["status"], number> = {
      Active: 0,
      Onboarding: 0,
      "On leave": 0,
    };
    employees.forEach((e) => {
      base[e.status] += 1;
    });
    return base;
  }, [employees]);

  const dataSource = useMemo(() => {
    return employees
      .filter((emp) => activeTab === "all" || emp.status === activeTab)
      .filter((emp) => {
        if (selectedDept === "all") return true;
        return emp.department.toLowerCase() === selectedDept.toLowerCase();
      })
      .filter((emp) => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (
          emp.name.toLowerCase().includes(q) ||
          emp.role.toLowerCase().includes(q) ||
          emp.id.toLowerCase().includes(q)
        );
      });
  }, [employees, activeTab, selectedDept, searchTerm]);

  const columns: CommonTableColumn<Employee>[] = [
    {
      title: "Emp ID",
      dataIndex: "id",
      key: "id",
      render: (id: string) => (
        <span className="font-bold text-zinc-800 text-[13px]">{id}</span>
      ),
      width: "12%",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_, record: Employee) => (
        <div className="flex items-center gap-3">
          <Avatar
            style={{
              backgroundColor: record.bg,
              color: record.fg,
              fontWeight: 600,
              fontSize: 13,
            }}
            size={32}
          >
            {record.initials}
          </Avatar>
          <span className="font-bold text-zinc-900 text-[13.5px]">
            {record.name}
          </span>
        </div>
      ),
      width: "25%",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: string) => (
        <span className="text-zinc-500 font-medium text-[13px]">{role}</span>
      ),
      width: "18%",
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      render: (dept: string) => (
        <span className="text-zinc-600 font-normal text-[13px]">{dept}</span>
      ),
      width: "15%",
    },
    {
      title: "Joined",
      dataIndex: "joined",
      key: "joined",
      render: (joined: number) => (
        <span className="text-zinc-500 font-normal text-[13px]">{joined}</span>
      ),
      width: "10%",
    },
    {
      title: "Reporting To",
      dataIndex: "reportingTo",
      key: "reportingTo",
      render: (rep: string) => (
        <span className="text-zinc-500 font-normal text-[13px]">{rep}</span>
      ),
      width: "15%",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: Employee["status"]) => {
        const color = STATUS_TAG_COLORS[status];
        return <Tag color={color}>{status}</Tag>;
      },
      width: "12%",
    },
    {
      title: "",
      key: "action",
      render: (_, record: Employee) => (
        <Link href={`/hrms/employees/${record.id}`}>
          <span className="text-[#374d95] hover:text-[#2a3c74] font-medium text-[12.5px] cursor-pointer flex items-center gap-1">
            <span>View</span>
            <ArrowRightOutlined className="text-[9px]" />
          </span>
        </Link>
      ),
      width: "8%",
      align: "right" as const,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <PageHeader
        title="Employees"
        subtitle="HR master across both companies"
        date="May 21, 2026 - Thu"
        actions={
          <Space>
            <Button icon={<FilterOutlined />}>Filters</Button>
            <Button icon={<DownloadOutlined />}>Import</Button>
            <Link href="/hrms/employees/add">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                style={{ background: "#374d95", border: "none" }}
              >
                Add employee
              </Button>
            </Link>
          </Space>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '24px', marginBottom: '20px' }}>
        <StatCard
          icon={TeamOutlined}
          label="Total headcount"
          value={employees.length.toString()}
          hint="Aggregated headcount logs"
        />
        <StatCard
          icon={UsergroupAddOutlined}
          label="New hires (MTD)"
          value="4"
          hint="2 onboarding"
          hintTone="positive"
        />
        <StatCard
          icon={UserDeleteOutlined}
          label="Exits (MTD)"
          value="1"
          hint="0.3% attrition"
        />
        <StatCard
          icon={ExclamationCircleOutlined}
          label="Pending actions"
          value={<span className="text-amber-600">6</span>}
          hint="3 approvals + 3 docs"
          hintTone="warning"
        />
      </div>

      {/* Main Table and Tabs Wrapper */}
      <div className="rounded-lg border border-zinc-200 bg-white" style={{ marginTop: '24px' }}>
        <div className="flex flex-col gap-3 border-b border-zinc-100 px-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <Tabs
            activeKey={activeTab}
            onChange={(k) => setActiveTab(k as typeof activeTab)}
            items={[
              {
                key: "all",
                label: <TabLabel label="All" count={employees.length} />,
              },
              {
                key: "Active",
                label: (
                  <TabLabel
                    icon={<CheckCircleOutlined />}
                    label="Active"
                    count={counts.Active}
                  />
                ),
              },
              {
                key: "Onboarding",
                label: (
                  <TabLabel
                    icon={<PlusOutlined className="text-xs" />}
                    label="Onboarding"
                    count={counts.Onboarding}
                  />
                ),
              },
              {
                key: "On leave",
                label: (
                  <TabLabel
                    icon={<ClockCircleOutlined />}
                    label="On leave"
                    count={counts["On leave"]}
                  />
                ),
              },
            ]}
          />
          <Space className="pb-3 sm:pb-0">
            <Select
              defaultValue="all"
              onChange={(val) => setSelectedDept(val)}
              style={{ width: 130 }}
              options={[
                { value: "all", label: "All depts" },
                { value: "leadership", label: "Leadership" },
                { value: "operations", label: "Operations" },
                { value: "procurement", label: "Procurement" },
                { value: "production", label: "Production" },
                { value: "logistics", label: "Logistics" },
                { value: "hr", label: "HR" },
                { value: "marketing", label: "Marketing" },
                { value: "quality", label: "Quality" },
              ]}
            />
            <Input
              allowClear
              placeholder="Search by ID, name, role..."
              prefix={<SearchOutlined className="text-zinc-400" />}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 220 }}
            />
          </Space>
        </div>

        <CommonTable<Employee>
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
          bordered={false}
          loading={loading}
          pagination={{ pageSize: 8, showSizeChanger: false }}
        />
      </div>
    </div>
  );
}

function TabLabel({
  icon,
  label,
  count,
}: {
  icon?: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 font-semibold">
      {icon}
      {label}
      <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[11px] font-medium text-zinc-600">
        {count}
      </span>
    </span>
  );
}
