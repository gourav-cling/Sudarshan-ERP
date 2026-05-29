"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Table, Button, Select, Tag, message } from "antd";
import {
  FilterOutlined,
  DownloadOutlined,
  LockOutlined,
} from "@ant-design/icons";
import PageHeader from "@/components/common/PageHeader";
import ReportSection from "@/components/hrms/ReportSection";
import {
  getDailyWageWorkers,
  filterWorkers,
  getDailyWageKpi,
  getTradeSummary,
  getDisbursementSummary,
  getContractorSplit,
  calcWorkerPay,
  getSampleWorker,
  formatInr,
  formatLakhs,
  hourlyRate,
  PAY_PERIODS,
  PAY_FREQUENCIES,
  UNITS,
  SKILL_FILTERS,
  CONTRACTORS,
  DISBURSEMENT_FILTERS,
} from "@/lib/daily-wage-dummy";

function skillTagClass(skill: string) {
  if (skill === "Skilled") return "daily-wage-skill-tag--skilled";
  if (skill === "Semi") return "daily-wage-skill-tag--semi";
  return "daily-wage-skill-tag--unskilled";
}

export default function DailyWagePayrollPage() {
  const allWorkers = useMemo(() => getDailyWageWorkers(), []);

  const [payPeriod, setPayPeriod] = useState("2025-03");
  const [payFrequency, setPayFrequency] = useState("Monthly");
  const [unit, setUnit] = useState("All");
  const [skill, setSkill] = useState("All");
  const [contractor, setContractor] = useState("All");
  const [disbursement, setDisbursement] = useState("All");

  const workers = useMemo(
    () => filterWorkers(allWorkers, { unit, skill, contractor, disbursement }),
    [allWorkers, unit, skill, contractor, disbursement],
  );

  const kpi = useMemo(() => getDailyWageKpi(workers), [workers]);
  const tradeRows = useMemo(() => getTradeSummary(workers), [workers]);
  const disbursementRows = useMemo(
    () => getDisbursementSummary(workers),
    [workers],
  );
  const contractorSplit = useMemo(() => getContractorSplit(workers), [workers]);
  const sample = useMemo(() => getSampleWorker(workers), [workers]);
  const samplePay = sample ? calcWorkerPay(sample) : null;

  const periodLabel =
    PAY_PERIODS.find((p) => p.value === payPeriod)?.label ?? payPeriod;

  const tableData = useMemo(
    () =>
      workers.map((w) => {
        const p = calcWorkerPay(w);
        return { ...w, ...p, key: w.id };
      }),
    [workers],
  );

  const totals = useMemo(() => {
    let days = 0,
      wages = 0,
      otHrs = 0,
      otAmt = 0,
      gross = 0,
      ded = 0,
      net = 0;
    for (const r of tableData) {
      days += r.days;
      wages += r.wages;
      otHrs += r.otHours;
      otAmt += r.otAmount;
      gross += r.gross;
      ded += r.deductions;
      net += r.net;
    }
    return { days, wages, otHrs, otAmt, gross, ded, net };
  }, [tableData]);

  const columns = [
    {
      title: "CODE",
      dataIndex: "code",
      key: "code",
      width: 100,
      render: (v: string) => (
        <span
          style={{ fontFamily: "monospace", fontWeight: 600, fontSize: 12 }}
        >
          {v}
        </span>
      ),
    },
    {
      title: "NAME",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (v: string) => <span style={{ fontWeight: 600 }}>{v}</span>,
    },
    {
      title: "SKILL",
      dataIndex: "skill",
      key: "skill",
      width: 100,
      render: (v: string) => (
        <Tag
          className={skillTagClass(v)}
          style={{ borderRadius: 20, fontWeight: 600 }}
        >
          {v}
        </Tag>
      ),
    },
    { title: "TRADE", dataIndex: "trade", key: "trade", width: 90 },
    {
      title: "CONTRACTOR",
      dataIndex: "contractor",
      key: "contractor",
      width: 150,
      ellipsis: true,
    },
    {
      title: "DAILY RATE (₹)",
      dataIndex: "dailyRate",
      key: "rate",
      width: 110,
      align: "right" as const,
      render: (v: number) => formatInr(v),
    },
    {
      title: "DAYS",
      dataIndex: "days",
      key: "days",
      width: 60,
      align: "center" as const,
    },
    {
      title: "WAGES (₹)",
      dataIndex: "wages",
      key: "wages",
      width: 100,
      align: "right" as const,
      render: (v: number) => formatInr(v),
    },
    {
      title: "OT HRS",
      dataIndex: "otHours",
      key: "otHrs",
      width: 70,
      align: "center" as const,
    },
    {
      title: "OT (₹)",
      dataIndex: "otAmount",
      key: "otAmt",
      width: 90,
      align: "right" as const,
      render: (v: number) => formatInr(v),
    },
    {
      title: "GROSS (₹)",
      dataIndex: "gross",
      key: "gross",
      width: 100,
      align: "right" as const,
      render: (v: number) => (
        <span style={{ fontWeight: 600 }}>{formatInr(v)}</span>
      ),
    },
    {
      title: "DEDUCTIONS (₹)",
      dataIndex: "deductions",
      key: "ded",
      width: 110,
      align: "right" as const,
      render: (v: number) => (
        <span style={{ color: "#e11d48" }}>{formatInr(v)}</span>
      ),
    },
    {
      title: "NET PAY (₹)",
      dataIndex: "net",
      key: "net",
      width: 110,
      align: "right" as const,
      render: (v: number) => (
        <span style={{ fontWeight: 800 }}>{formatInr(v)}</span>
      ),
    },
    { title: "MODE", dataIndex: "mode", key: "mode", width: 70 },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (v: string) => (
        <Tag
          color={v === "Approved" ? "green" : "orange"}
          style={{ borderRadius: 20, border: 0, fontWeight: 600 }}
        >
          {v}
        </Tag>
      ),
    },
  ];

  return (
    <div className="attendance-reports-page daily-wage-page">
      <PageHeader
        title="Daily Wage Payroll"
        subtitle="Wage labour — daily rate × days worked + overtime, separate from monthly CTC payroll."
        actions={
          <>
            <Link href="/hrms/salary/monthly">
              <Button>Monthly CTC payroll</Button>
            </Link>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => message.info("Export Excel — preview")}
            >
              Export Excel
            </Button>
            <Button
              type="primary"
              icon={<LockOutlined />}
              style={{ background: "#059669", borderColor: "#059669" }}
              onClick={() =>
                message.success("Payroll generated & locked (preview)")
              }
            >
              Generate &amp; lock
            </Button>
          </>
        }
      />

      <div className="daily-wage-info-banner">
        Pay is computed as <strong>Daily wage rate × Days worked</strong> + (
        <strong>Overtime hrs × 2 × Hourly rate</strong>). PF/ESI applicability
        depends on rate slab. Cash &amp; bank disbursement supported.
      </div>

      <ReportSection title="Filters" flush>
        <div
          className="attendance-filters-grid"
          style={{ padding: "16px 20px" }}
        >
          <div>
            <span className="text-[11px] font-bold uppercase text-zinc-500 block mb-2">
              Pay Period
            </span>
            <Select
              style={{ width: "100%" }}
              value={payPeriod}
              onChange={setPayPeriod}
              options={PAY_PERIODS.map((p) => ({
                value: p.value,
                label: p.label,
              }))}
            />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-zinc-500 block mb-2">
              Pay Frequency
            </span>
            <Select
              style={{ width: "100%" }}
              value={payFrequency}
              onChange={setPayFrequency}
              options={PAY_FREQUENCIES.map((f) => ({ value: f, label: f }))}
            />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-zinc-500 block mb-2">
              Unit / Site
            </span>
            <Select
              style={{ width: "100%" }}
              value={unit}
              onChange={setUnit}
              options={UNITS.map((u) => ({ value: u, label: u }))}
            />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-zinc-500 block mb-2">
              Skill Category
            </span>
            <Select
              style={{ width: "100%" }}
              value={skill}
              onChange={setSkill}
              options={SKILL_FILTERS.map((s) => ({ value: s, label: s }))}
            />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-zinc-500 block mb-2">
              Contractor
            </span>
            <Select
              style={{ width: "100%" }}
              value={contractor}
              onChange={setContractor}
              options={CONTRACTORS.map((c) => ({ value: c, label: c }))}
            />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-zinc-500 block mb-2">
              Disbursement
            </span>
            <Select
              style={{ width: "100%" }}
              value={disbursement}
              onChange={setDisbursement}
              options={DISBURSEMENT_FILTERS.map((d) => ({
                value: d,
                label: d,
              }))}
            />
          </div>
          <div className="attendance-filters-grid__actions">
            <Button
              type="primary"
              icon={<FilterOutlined />}
              style={{ background: "#374d95", borderColor: "#374d95" }}
            >
              Apply
            </Button>
          </div>
        </div>
      </ReportSection>

      <div className="daily-wage-kpi-grid">
        <div className="daily-wage-kpi-card">
          <p className="daily-wage-kpi-card__label">Total Wage Labour</p>
          <p className="daily-wage-kpi-card__value">{kpi.headcount}</p>
          <p className="daily-wage-kpi-card__hint">
            {kpi.skilled} skilled · {kpi.semi} semi · {kpi.unskilled} unskilled
          </p>
        </div>
        <div className="daily-wage-kpi-card">
          <p className="daily-wage-kpi-card__label">Mandays Worked</p>
          <p className="daily-wage-kpi-card__value">
            {kpi.mandays.toLocaleString("en-IN")}
          </p>
          <p className="daily-wage-kpi-card__hint">
            Avg {kpi.avgDays} days · {kpi.absentees} absentees
          </p>
        </div>
        <div className="daily-wage-kpi-card">
          <p className="daily-wage-kpi-card__label">Overtime Hours</p>
          <p className="daily-wage-kpi-card__value">{kpi.otHours}</p>
          <p className="daily-wage-kpi-card__hint">
            Avg {kpi.avgOt} hrs / labour
          </p>
        </div>
        <div className="daily-wage-kpi-card">
          <p className="daily-wage-kpi-card__label">Total Wage Payout</p>
          <p className="daily-wage-kpi-card__value">
            {formatLakhs(kpi.totalPayout)}
          </p>
          <p className="daily-wage-kpi-card__hint">
            {formatLakhs(kpi.totalWages)} wages · {formatLakhs(kpi.totalOt)} OT
          </p>
        </div>
      </div>

      {sample && samplePay && (
        <ReportSection
          title={`Sample calculation — ${sample.name} (${sample.code})`}
          meta="Illustrative row"
        >
          <div className="daily-wage-sample-grid">
            <div className="daily-wage-sample-tile">
              <p className="daily-wage-sample-tile__label">Daily Rate</p>
              <p className="daily-wage-sample-tile__value">
                {formatInr(sample.dailyRate)}
              </p>
              <p className="daily-wage-sample-tile__sub">
                {sample.skill} — {sample.trade.toLowerCase()}
              </p>
            </div>
            <div className="daily-wage-sample-tile">
              <p className="daily-wage-sample-tile__label">Days Worked</p>
              <p className="daily-wage-sample-tile__value">{sample.days}</p>
              <p className="daily-wage-sample-tile__sub">
                of {sample.days} attended
              </p>
            </div>
            <div className="daily-wage-sample-tile">
              <p className="daily-wage-sample-tile__label">
                Wages (Rate × Days)
              </p>
              <p className="daily-wage-sample-tile__value">
                {formatInr(samplePay.wages)}
              </p>
              <p className="daily-wage-sample-tile__sub">
                {sample.dailyRate} × {sample.days}
              </p>
            </div>
            <div className="daily-wage-sample-tile">
              <p className="daily-wage-sample-tile__label">OT Hours</p>
              <p className="daily-wage-sample-tile__value">
                {sample.otHours} hrs
              </p>
              <p className="daily-wage-sample-tile__sub">Sun + weekdays</p>
            </div>
            <div className="daily-wage-sample-tile">
              <p className="daily-wage-sample-tile__label">OT Amount</p>
              <p className="daily-wage-sample-tile__value">
                {formatInr(samplePay.otAmount)}
              </p>
              <p className="daily-wage-sample-tile__sub">
                ({sample.dailyRate}/8) × {sample.otHours} × 2
              </p>
            </div>
            <div className="daily-wage-sample-tile">
              <p className="daily-wage-sample-tile__label">Gross</p>
              <p className="daily-wage-sample-tile__value">
                {formatInr(samplePay.gross)}
              </p>
              <p className="daily-wage-sample-tile__sub">Wages + OT</p>
            </div>
            <div className="daily-wage-sample-tile">
              <p className="daily-wage-sample-tile__label">PF (12%)</p>
              <p className="daily-wage-sample-tile__value">
                {formatInr(samplePay.pf)}
              </p>
              <p className="daily-wage-sample-tile__sub">on basic wage</p>
            </div>
            <div className="daily-wage-sample-tile">
              <p className="daily-wage-sample-tile__label">Advance Recovery</p>
              <p className="daily-wage-sample-tile__value">
                {formatInr(sample.advance)}
              </p>
              <p className="daily-wage-sample-tile__sub">running</p>
            </div>
            <div className="daily-wage-sample-tile daily-wage-sample-tile--highlight">
              <p className="daily-wage-sample-tile__label">Net Pay</p>
              <p
                className="daily-wage-sample-tile__value"
                style={{ color: "#059669" }}
              >
                {formatInr(samplePay.net)}
              </p>
              <p className="daily-wage-sample-tile__sub">
                {sample.mode} transfer
              </p>
            </div>
          </div>
          <p className="daily-wage-formula">
            Net = (Daily rate × Days worked) + (OT hrs × 2 × Hourly rate) − PF −
            ESI − Advance
            <br />= ({sample.dailyRate} × {sample.days}) + ({sample.otHours} × 2
            × {hourlyRate(sample.dailyRate).toFixed(1)}) −{" "}
            {samplePay.pf.toLocaleString("en-IN")} − {sample.esi} −{" "}
            {sample.advance}
            <br />= {samplePay.wages.toLocaleString("en-IN")} +{" "}
            {samplePay.otAmount.toLocaleString("en-IN")} −{" "}
            {samplePay.deductions.toLocaleString("en-IN")} ={" "}
            <strong>{formatInr(samplePay.net)}</strong>
          </p>
        </ReportSection>
      )}

      <ReportSection
        title={`Wage labour payroll — ${periodLabel.split(" ")[0]} ${periodLabel.split(" ")[1] ?? ""}`}
        meta={`${workers.length} labourers · ${formatLakhs(kpi.totalPayout)}`}
        flush
      >
        <Table
          dataSource={tableData}
          columns={columns}
          rowKey="key"
          size="small"
          scroll={{ x: 1400 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (t, range) =>
              `Total (showing ${range[0]}-${range[1]} of ${t})`,
          }}
          className="attendance-report-table"
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row
                style={{ background: "#fafafa", fontWeight: 700 }}
              >
                <Table.Summary.Cell index={0} colSpan={5}>
                  Total
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5} align="center">
                  {totals.days}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={6} align="right">
                  {formatInr(totals.wages)}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={7} align="center">
                  {totals.otHrs}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={8} align="right">
                  {formatInr(totals.otAmt)}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={9} align="right">
                  {formatInr(totals.gross)}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={10} align="right">
                  {formatInr(totals.ded)}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={11} align="right">
                  {formatInr(totals.net)}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={12} colSpan={2} />
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </ReportSection>

      <div className="daily-wage-bottom-grid">
        <ReportSection title="Trade-wise summary" flush>
          <Table
            dataSource={tradeRows}
            rowKey="trade"
            size="small"
            pagination={false}
            className="attendance-report-table"
            columns={[
              { title: "TRADE", dataIndex: "trade", key: "trade" },
              {
                title: "COUNT",
                dataIndex: "count",
                key: "count",
                align: "center" as const,
              },
              {
                title: "AVG RATE",
                dataIndex: "avgRate",
                key: "avg",
                align: "right" as const,
                render: (v: number) => formatInr(v),
              },
              {
                title: "MANDAYS",
                dataIndex: "mandays",
                key: "md",
                align: "center" as const,
              },
              {
                title: "WAGES (₹)",
                dataIndex: "wages",
                key: "wages",
                align: "right" as const,
                render: (v: number) => formatInr(v),
              },
            ]}
          />
        </ReportSection>

        <ReportSection title="Disbursement summary" flush>
          <Table
            dataSource={disbursementRows}
            rowKey="mode"
            size="small"
            pagination={false}
            className="attendance-report-table"
            columns={[
              { title: "MODE", dataIndex: "mode", key: "mode" },
              {
                title: "LABOURERS",
                dataIndex: "labourers",
                key: "lab",
                align: "center" as const,
              },
              {
                title: "AMOUNT (₹)",
                dataIndex: "amount",
                key: "amt",
                align: "right" as const,
                render: (v: number) => formatInr(v),
              },
              {
                title: "STATUS",
                dataIndex: "status",
                key: "status",
                render: (v: string, row: { statusTone: string }) => (
                  <Tag
                    color={row.statusTone === "warning" ? "orange" : "blue"}
                    style={{ borderRadius: 20, border: 0 }}
                  >
                    {v}
                  </Tag>
                ),
              },
            ]}
          />
          <p
            style={{
              padding: "12px 20px",
              margin: 0,
              fontSize: 12,
              color: "#71717a",
            }}
          >
            Contractor split:{" "}
            {contractorSplit.map((c, i) => (
              <span key={c.name}>
                {i > 0 && " · "}
                <strong>{c.name}</strong> {formatLakhs(c.amount)}
              </span>
            ))}
          </p>
          <div
            style={{
              padding: "0 20px 16px",
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <Button
              style={{
                background: "#0d9488",
                borderColor: "#0d9488",
                color: "#fff",
              }}
              onClick={() => message.info("Cash voucher")}
            >
              Cash voucher
            </Button>
            <Button onClick={() => message.info("Bank file (NEFT)")}>
              Bank file (NEFT)
            </Button>
            <Button onClick={() => message.info("Print muster")}>
              Print muster
            </Button>
          </div>
        </ReportSection>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <Link href="/hrms/salary">
          <Button>← Salary hub</Button>
        </Link>
      </div>
    </div>
  );
}
