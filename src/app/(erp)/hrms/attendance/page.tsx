"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Select, Card, Typography } from "antd";
import {
  LoginOutlined,
  LogoutOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import dayjs from "dayjs";

import PageHeader from "@/components/common/PageHeader";
import { useErpData } from "@/context/erp-data-provider";
import {
  useAttendancePunch,
  type WorkSite,
} from "@/hooks/use-attendance-punch";

type TodayRow = {
  id: string;
  name: string;
  inTime: string | null;
  outTime: string | null;
  status: string;
  punchLog?: { type: string; isoTime: string }[];
};

export default function AttendancePunchPage() {
  const { data } = useErpData();
  const { punch, punching } = useAttendancePunch({ source: "mobile" });
  const [now, setNow] = useState(dayjs());
  const [companyId, setCompanyId] = useState<string>("");
  const [workSite, setWorkSite] = useState<WorkSite>("office");
  const [myRow, setMyRow] = useState<TodayRow | null>(null);
  const [loading, setLoading] = useState(true);

  const companies = data.COMPANIES;

  useEffect(() => {
    if (!companyId && companies[0]) setCompanyId(companies[0].id);
  }, [companies, companyId]);

  useEffect(() => {
    const t = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(t);
  }, []);

  const loadToday = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hrms/attendance/today?mine=1", {
        cache: "no-store",
      });
      const json = await res.json();
      if (res.ok && !json?.error) {
        const rows: TodayRow[] = json.data?.rows ?? [];
        setMyRow(rows[0] ?? null);
      }
    } catch {
      /* non-blocking */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadToday();
  }, []);

  const punchInTime = useMemo(() => {
    if (!myRow?.punchLog?.length) return null;
    const ins = myRow.punchLog
      .filter((p) => p.type === "in")
      .sort(
        (a, b) =>
          new Date(a.isoTime).getTime() - new Date(b.isoTime).getTime()
      );
    return ins[0] ? dayjs(ins[0].isoTime) : null;
  }, [myRow]);

  const punchOutTime = useMemo(() => {
    if (!myRow?.punchLog?.length) return null;
    const outs = myRow.punchLog
      .filter((p) => p.type === "out")
      .sort(
        (a, b) =>
          new Date(b.isoTime).getTime() - new Date(a.isoTime).getTime()
      );
    return outs[0] ? dayjs(outs[0].isoTime) : null;
  }, [myRow]);

  const canPunchIn = !myRow || myRow.status !== "In";
  const canPunchOut = myRow?.status === "In";

  const handlePunch = async (type: "in" | "out") => {
    const ok = await punch(type, workSite);
    if (ok) await loadToday();
  };

  const selectedCompany = companies.find((c) => c.id === companyId);

  return (
    <div className="attendance-punch-page">
      <div className="attendance-punch-page__inner">
        <PageHeader
          title={
            <span className="inline-flex items-center gap-2">
              <ClockCircleOutlined className="text-[#374d95]" />
              Attendance
            </span>
          }
          subtitle="Punch in/out — GPS/location-based on phone"
          actions={
            <div className="flex flex-wrap gap-2">
              <Link href="/hrms/reports">
                <Button icon={<BarChartOutlined />}>Reports</Button>
              </Link>
              <Link href="/hrms/employees">
                <Button icon={<TeamOutlined />}>Employee list</Button>
              </Link>
            </div>
          }
        />

        <div className="attendance-my-filters">
          <Typography.Text
            type="secondary"
            className="text-[11px] font-semibold uppercase tracking-wide"
          >
            Company / unit
          </Typography.Text>
          <Select
            className="w-full"
            value={companyId || undefined}
            onChange={setCompanyId}
            options={companies.map((c) => ({
              value: c.id,
              label: `${c.name} (${c.plant})`,
            }))}
          />
          <Typography.Text
            type="secondary"
            className="mt-3 block text-[11px] font-semibold uppercase tracking-wide"
          >
            Work site
          </Typography.Text>
          <Select
            className="w-full"
            value={workSite}
            onChange={setWorkSite}
            options={[
              { value: "office", label: "In office / plant" },
              { value: "field", label: "Field" },
            ]}
          />
        </div>

        <Card className="attendance-punch-card attendance-punch-card--in" bordered>
          <Typography.Text
            type="secondary"
            className="text-[11px] font-bold uppercase tracking-wide"
          >
            Punch in
          </Typography.Text>
          <div className="attendance-punch-time">
            {punchInTime ? punchInTime.format("HH:mm") : now.format("HH:mm")}
          </div>
          <Typography.Text type="secondary" className="block text-[13px]">
            {now.format("DD MMM YYYY")}
            {punchInTime ? ` · In at ${punchInTime.format("HH:mm")}` : ""}
          </Typography.Text>
          <Button
            type="primary"
            size="large"
            block
            className="attendance-punch-btn attendance-punch-btn--in"
            icon={<LoginOutlined />}
            loading={punching === "in"}
            disabled={!canPunchIn || loading}
            onClick={() => handlePunch("in")}
          >
            Punch in
          </Button>
        </Card>

        <Card
          className="attendance-punch-card attendance-punch-card--out"
          bordered
        >
          <Typography.Text
            type="secondary"
            className="text-[11px] font-bold uppercase tracking-wide"
          >
            Punch out
          </Typography.Text>
          <div className="attendance-punch-time attendance-punch-time--muted">
            {punchOutTime
              ? punchOutTime.format("HH:mm")
              : canPunchOut
                ? "—"
                : "Not punched out yet"}
          </div>
          <Typography.Text type="secondary" className="block text-[13px]">
            {punchOutTime
              ? `Out at ${punchOutTime.format("HH:mm")}`
              : myRow?.status === "In"
                ? "You are currently punched in"
                : "Punch in first to enable punch out"}
          </Typography.Text>
          <Button
            type="primary"
            size="large"
            block
            className="attendance-punch-btn attendance-punch-btn--out"
            icon={<LogoutOutlined />}
            loading={punching === "out"}
            disabled={!canPunchOut || loading}
            onClick={() => handlePunch("out")}
          >
            Punch out
          </Button>
        </Card>

        <Card size="small" className="attendance-my-info">
          <div className="flex gap-2">
            <EnvironmentOutlined className="mt-0.5 text-[#374d95]" />
            <Typography.Text
              type="secondary"
              className="text-[12px] leading-relaxed"
            >
              <strong>GPS/location-based attendance:</strong> Punch in/out using
              your phone when you are at{" "}
              <strong>{selectedCompany?.name ?? "office"}</strong> or an approved
              location. The system records your location so only on-site punches
              are accepted. Field staff can mark <strong>Field</strong> when
              working outside the plant.
            </Typography.Text>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[12px] text-zinc-500">
            <ClockCircleOutlined />
            <span>Today&apos;s status: {myRow?.status ?? "—"}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
