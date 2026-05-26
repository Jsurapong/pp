"use client";

import { usePathname } from "next/navigation";

interface HeaderProps {
  onToggle: () => void;
}

function IconMenu() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="6" /><path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0112 0v4l2 3H4l2-3V8z" /><path d="M10 19a2 2 0 004 0" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function IconChevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9,18 15,12 9,6" />
    </svg>
  );
}

const pathLabels: Record<string, [string, string]> = {
  "/dashboard":  ["TradeMaster",  "แดชบอร์ด"],
  "/portfolios": ["TradeMaster",  "พอร์ตโฟลิโอ"],
  "/journal":    ["การเทรด",     "บันทึกการเทรด"],
  "/new":        ["การเทรด",     "เปิดออเดอร์ใหม่"],
  "/calculator": ["การเทรด",     "เครื่องคิดเลข"],
  "/analytics":  ["วิเคราะห์",   "สถิติประสิทธิภาพ"],
  "/insights":   ["วิเคราะห์",   "Insights"],
  "/reports":    ["วิเคราะห์",   "รายงาน"],
  "/settings":   ["บัญชี",       "ตั้งค่า"],
};

export default function Header({ onToggle }: HeaderProps) {
  const pathname = usePathname();
  const [parent, current] = pathLabels[pathname] ?? ["TradeMaster", pathname.replace("/", "")];

  return (
    <header className="shell-header">
      <button className="shell-header-toggle" onClick={onToggle} aria-label="เปิด/ปิด sidebar">
        <IconMenu />
      </button>

      <div className="shell-breadcrumb">
        <span>{parent}</span>
        <IconChevron />
        <span className="current">{current}</span>
      </div>

      <div className="shell-search">
        <IconSearch />
        <input type="text" placeholder="ค้นหา symbol, การเทรด…" />
        <span style={{ fontSize: 11, border: "1px solid var(--ant-border)", borderRadius: 4, padding: "0 5px", lineHeight: "18px", flexShrink: 0 }}>
          ⌘K
        </span>
      </div>

      <div className="shell-header-actions">
        <button className="shell-icon-btn" aria-label="การแจ้งเตือน">
          <IconBell />
          <span className="dot" />
        </button>

        <button className="tm-btn tm-btn-primary" style={{ fontWeight: 500 }}>
          <IconPlus />
          เปิดออเดอร์ใหม่
        </button>
      </div>
    </header>
  );
}
