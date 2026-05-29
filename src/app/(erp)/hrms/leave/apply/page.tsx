"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Select,
  DatePicker,
  Input,
  InputNumber,
  Radio,
  Upload,
  Tag,
  Collapse,
  Typography,
} from "antd";
import {
  SendOutlined,
  SaveOutlined,
  LeftOutlined,
  UploadOutlined,
  CalendarOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import dayjs from "dayjs";

import { getLeaveDummy } from "@/lib/leave-dummy";

const LEAVE_TYPES = ["PL", "CL", "SL", "Comp.Off", "OD", "LWP"];

export default function LeaveApplyPage() {
  const demo = getLeaveDummy();
  const [leaveType, setLeaveType] = useState("PL");
  const [duration, setDuration] = useState("full");
  const [totalDays, setTotalDays] = useState(3);

  useEffect(() => {
    document.documentElement.classList.add("leave-apply-mobile-route");
    return () => {
      document.documentElement.classList.remove("leave-apply-mobile-route");
    };
  }, []);

  return (
    <div className="leave-apply-mobile">
      <header className="leave-apply-header" aria-label="Apply leave">
        <Link href="/hrms/leave/record" className="leave-apply-back">
          <LeftOutlined aria-hidden />
          <span>Back</span>
        </Link>
        <h1 className="leave-apply-title">Apply leave</h1>
        <Button
          type="primary"
          size="small"
          className="leave-apply-header-submit"
          icon={<SendOutlined />}
          style={{ background: "#0d9488", borderColor: "#0d9488" }}
        >
          Submit
        </Button>
      </header>

      <div className="leave-apply-body">
        <p className="leave-apply-employee">
          {demo.employee.id} — {demo.employee.name}
        </p>

        <section className="leave-apply-section" aria-labelledby="leave-type-label">
          <Typography.Text
            id="leave-type-label"
            className="leave-apply-label"
          >
            Leave type
          </Typography.Text>
          <div className="leave-type-chips" role="group" aria-label="Leave type">
            {LEAVE_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                className={`leave-type-chip${leaveType === t ? " leave-type-chip--active" : ""}`}
                onClick={() => setLeaveType(t)}
                aria-pressed={leaveType === t}
              >
                {t}
              </button>
            ))}
          </div>
        </section>

        <section className="leave-apply-section">
          <label className="leave-apply-label" htmlFor="leave-from-date">
            From date
          </label>
          <DatePicker
            id="leave-from-date"
            className="leave-apply-field"
            defaultValue={dayjs("2025-03-12")}
          />
        </section>

        <section className="leave-apply-section">
          <label className="leave-apply-label" htmlFor="leave-to-date">
            To date
          </label>
          <DatePicker
            id="leave-to-date"
            className="leave-apply-field"
            defaultValue={dayjs("2025-03-14")}
          />
        </section>

        <section className="leave-apply-section leave-apply-duration">
          <Typography.Text className="leave-apply-label">Duration</Typography.Text>
          <Radio.Group
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="leave-apply-radios"
          >
            <Radio value="full">Full day</Radio>
            <Radio value="first-half-first">First half (1st day)</Radio>
            <Radio value="second-half-first">Second half (1st day)</Radio>
            <Radio value="first-half-last">First half (last day)</Radio>
            <Radio value="second-half-last">Second half (last day)</Radio>
          </Radio.Group>
        </section>

        <section className="leave-apply-section">
          <label className="leave-apply-label" htmlFor="leave-total-days">
            Total days
          </label>
          <InputNumber
            id="leave-total-days"
            className="leave-apply-field"
            min={0.5}
            step={0.5}
            value={totalDays}
            onChange={(v) => setTotalDays(v ?? 1)}
          />
        </section>

        <section className="leave-apply-section">
          <label className="leave-apply-label" htmlFor="leave-approver">
            Approver
          </label>
          <Select
            id="leave-approver"
            className="leave-apply-field"
            defaultValue="anita"
            options={[
              { value: "anita", label: "Anita Desai (HR Manager)" },
            ]}
          />
        </section>

        <section className="leave-apply-section">
          <label className="leave-apply-label" htmlFor="leave-backup">
            Backup / coverage by
          </label>
          <Select
            id="leave-backup"
            className="leave-apply-field"
            defaultValue="EMP-2046"
            options={[
              {
                value: "EMP-2046",
                label: "EMP-2046 — Vikram Singh",
              },
            ]}
          />
        </section>

        <section className="leave-apply-section">
          <label className="leave-apply-label" htmlFor="leave-reason">
            Reason
          </label>
          <Input.TextArea
            id="leave-reason"
            className="leave-apply-field"
            rows={3}
            placeholder="Family wedding — sister's marriage in home town..."
            defaultValue="Family wedding — sister's marriage in home town"
          />
        </section>

        <section className="leave-apply-section">
          <label className="leave-apply-label" htmlFor="leave-contact">
            Contact while away
          </label>
          <Input
            id="leave-contact"
            className="leave-apply-field"
            placeholder="+91 98765 43210"
            defaultValue="+91 98765 43210"
          />
        </section>

        <section className="leave-apply-section">
          <Typography.Text className="leave-apply-label">
            Supporting document
          </Typography.Text>
          <Upload.Dragger
            className="leave-apply-upload"
            multiple={false}
            beforeUpload={() => false}
          >
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="leave-apply-upload-hint">PDF, JPG, PNG up to 5MB</p>
          </Upload.Dragger>
        </section>

        <div className="leave-apply-preview" role="status">
          <strong>Preview:</strong> Applying for {totalDays} {leaveType} from
          12-Mar-2025 to 14-Mar-2025 · Approver Anita Desai · Balance after
          approval: 11.5 PL
        </div>

        <div className="leave-apply-actions">
          <Button
            type="primary"
            block
            size="large"
            icon={<SendOutlined />}
            className="leave-apply-submit-btn"
            style={{ background: "#0d9488", borderColor: "#0d9488" }}
          >
            Submit request
          </Button>
          <Button block size="large" icon={<SaveOutlined />}>
            Save draft
          </Button>
        </div>

        <Collapse
          className="leave-apply-collapse"
          bordered={false}
          items={[
            {
              key: "balance",
              label: (
                <span className="leave-apply-collapse-label">
                  <WalletOutlined />
                  Balance preview
                </span>
              ),
              children: (
                <>
                  <ul className="leave-balance-list">
                    {demo.balancePreview.map((b) => (
                      <li key={b.type}>
                        <span>{b.type}</span>
                        <span
                          className={
                            "warn" in b && b.warn
                              ? "leave-balance-warn"
                              : undefined
                          }
                        >
                          {b.value}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="leave-balance-note">
                    SL balance is below 5 days — keep medical certificate ready
                    if more SL needed.
                  </div>
                </>
              ),
            },
            {
              key: "holidays",
              label: (
                <span className="leave-apply-collapse-label">
                  <CalendarOutlined />
                  Holiday calendar (next 30 d)
                </span>
              ),
              children: (
                <ul className="leave-holiday-list">
                  {demo.holidays.slice(0, 3).map((h) => (
                    <li key={h.date}>
                      <span className="leave-holiday-date">{h.date}</span>
                      {h.name}
                    </li>
                  ))}
                </ul>
              ),
            },
            {
              key: "recent",
              label: "My recent applications",
              children: (
                <ul className="leave-recent-list">
                  {demo.recentApplications.map((app, i) => (
                    <li key={i}>
                      <div className="leave-recent-main">
                        <Tag>{app.type}</Tag>
                        <span className="leave-recent-range">{app.range}</span>
                        <span className="leave-recent-meta">{app.days}</span>
                      </div>
                      <p className="leave-recent-reason">{app.reason}</p>
                      <Tag
                        className="leave-recent-status"
                        color={
                          app.status === "Approved"
                            ? "success"
                            : app.status === "Pending"
                              ? "warning"
                              : "error"
                        }
                      >
                        {app.status}
                      </Tag>
                    </li>
                  ))}
                </ul>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
