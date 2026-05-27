"use client";

import { CalendarOutlined } from "@ant-design/icons";
import { Typography } from "antd";
import type { ReactNode } from "react";

export interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  date?: ReactNode;
  actions?: ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  date,
  actions,
}: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="flex items-center gap-3">
          <Typography.Title level={3} className="mb-0!">
            {title}
          </Typography.Title>
          {date && (
            <span className="inline-flex items-center gap-1 text-sm text-zinc-500">
              <CalendarOutlined />
              {date}
            </span>
          )}
        </div>
        {subtitle && (
          <Typography.Text type="secondary" className="text-sm">
            {subtitle}
          </Typography.Text>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
