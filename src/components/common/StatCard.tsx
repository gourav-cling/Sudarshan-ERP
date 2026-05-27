"use client";

import { Card, Typography, theme } from "antd";
import type { ComponentType, ReactNode } from "react";

export interface StatCardProps {
  icon: ComponentType;
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  hintTone?: "default" | "positive" | "negative" | "warning";
}

const HINT_COLORS: Record<NonNullable<StatCardProps["hintTone"]>, string> = {
  default: "#71717a",
  positive: "#16a34a",
  negative: "#dc2626",
  warning: "#d97706",
};

export default function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  hintTone = "default",
}: StatCardProps) {
  const { token } = theme.useToken();

  return (
    <Card
      size="small"
      styles={{ body: { padding: 16 } }}
      style={{ borderColor: token.colorBorderSecondary }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#71717a' }}>
            <Icon />
            <Typography.Text type="secondary" style={{ fontSize: '13px', fontWeight: 600 }}>
              {label}
            </Typography.Text>
          </div>
          {hint !== undefined && (
            <div
              style={{ fontSize: '12px', color: HINT_COLORS[hintTone] }}
            >
              {hint}
            </div>
          )}
        </div>
        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#18181b', lineHeight: 1 }}>{value}</div>
      </div>
    </Card>
  );
}
