import type { ReactNode } from "react";

export default function ReportSection({
  title,
  meta,
  footer,
  flush,
  children,
}: {
  title: string;
  meta?: string;
  footer?: string;
  flush?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="attendance-report-section">
      <div className="attendance-report-section__head">
        <h2 className="attendance-report-section__head-title">{title}</h2>
        {meta && (
          <span className="attendance-report-section__head-meta">{meta}</span>
        )}
      </div>
      <div
        className={
          flush
            ? "attendance-report-section__body attendance-report-section__body--flush"
            : "attendance-report-section__body"
        }
      >
        {children}
      </div>
      {footer && (
        <p className="attendance-report-section__footer">{footer}</p>
      )}
    </section>
  );
}
