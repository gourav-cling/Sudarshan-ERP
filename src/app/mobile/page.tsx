import Link from "next/link";
import { MobileClient } from "./mobile-client";

export const dynamic = "force-dynamic";

export default function MobilePage() {
  return (
    <>
      <div className="mobile-page-header">
        <div>
          <h1 className="mobile-page-title">Mobile companion apps</h1>
          <p className="mobile-page-sub">
            20 role-based mobile screens for the Sudarshan ERP — Driver, Field
            Sales, Employee, Production, Owner, and Store/Inventory. Drag the
            canvas to pan, scroll to zoom, click any artboard to focus.
          </p>
        </div>
        <div className="header-stats">
          <div>
            <div className="header-stat-num">20</div>
            <div className="header-stat-label">Screens</div>
          </div>
          <div>
            <div className="header-stat-num">6</div>
            <div className="header-stat-label">Roles</div>
          </div>
          <Link href="/login" className="btn" style={{ alignSelf: "center" }}>
            ← Desktop ERP
          </Link>
        </div>
      </div>
      <div id="mobile-root">
        <MobileClient />
      </div>
      <style>{`
        .mobile-page-header {
          padding: 28px 40px 16px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          border-bottom: 1px solid var(--border);
          background: var(--bg-elev);
          position: relative;
          z-index: 10;
        }
        .mobile-page-title {
          font-family: var(--font-display);
          font-size: 26px;
          font-weight: 600;
          letter-spacing: -0.025em;
          margin: 0 0 4px;
        }
        .mobile-page-sub {
          font-size: 13px;
          color: var(--fg-muted);
          max-width: 700px;
        }
        .header-stats {
          display: flex;
          gap: 24px;
          flex-shrink: 0;
          align-items: center;
        }
        .header-stat-num {
          font-family: var(--font-display);
          font-size: 24px;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: var(--primary);
        }
        .header-stat-label {
          font-size: 11px;
          color: var(--fg-subtle);
          letter-spacing: 0.04em;
          text-transform: uppercase;
          font-weight: 500;
        }
        #mobile-root {
          width: 100%;
          height: calc(100vh - 110px);
        }
      `}</style>
    </>
  );
}
