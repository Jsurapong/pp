"use client";

import { usePathname } from "next/navigation";
import UserMenu from "./UserMenu";

interface HeaderProps {
  onToggle: () => void;
}

function IconMenu() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
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

const pathLabels: Record<string, string[]> = {
  "/dashboard": ["TradeMaster", "Dashboard"],
  "/portfolios": ["TradeMaster", "Portfolios"],
  "/journal": ["Trading", "Trade Journal"],
  "/calculator": ["Trading", "Money Calculator"],
  "/analytics": ["Analytics", "Performance"],
  "/reports": ["Analytics", "Reports"],
  "/settings": ["Account", "Settings"],
};

export default function Header({ onToggle }: HeaderProps) {
  const pathname = usePathname();

  const segments = pathLabels[pathname] ?? ["TradeMaster", pathname.replace("/", "")];
  const [parent, current] = segments;

  return (
    <header className="shell-header">
      <button className="shell-header-toggle" onClick={onToggle} aria-label="Toggle sidebar">
        <IconMenu />
      </button>

      <div className="shell-breadcrumb">
        <span>{parent}</span>
        <IconChevron />
        <span className="current">{current}</span>
      </div>

      <div className="shell-search">
        <IconSearch />
        <input type="text" placeholder="Search trades, symbols..." />
        <span style={{ fontSize: 11, border: "1px solid var(--ant-border)", borderRadius: 4, padding: "0 5px", lineHeight: "18px", flexShrink: 0 }}>
          ⌘K
        </span>
      </div>

      <div className="shell-header-actions">
        <button className="shell-icon-btn" aria-label="Notifications">
          <IconBell />
          <span className="dot" />
        </button>

        <button className="shell-icon-btn" aria-label="Settings">
          <IconSettings />
        </button>

        <button className="tm-btn tm-btn-primary" style={{ fontWeight: 500 }}>
          <IconPlus />
          New Trade
        </button>

        <UserMenu />
      </div>
    </header>
  );
}
