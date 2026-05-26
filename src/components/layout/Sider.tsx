"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Dropdown, type MenuProps } from "antd";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { clearAuth } from "@/lib/features/auth/authSlice";
import { logoutRequest } from "@/lib/features/auth/authApi";

interface SiderProps {
  collapsed: boolean;
}

function Icon({ n, s = 17, c = "currentColor", sw = 1.5 }: {
  n: string; s?: number; c?: string; sw?: number;
}) {
  const paths: Record<string, React.ReactNode> = {
    dashboard: <><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></>,
    wallet:    <><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M16 15h3"/></>,
    file:      <><path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z"/><path d="M14 3v6h6M9 13h6M9 17h4"/></>,
    plus:      <path d="M12 5v14M5 12h14"/>,
    pulse:     <path d="M3 12h4l2-7 4 14 2-7h6"/>,
    chart:     <path d="M4 19V5M4 19h16M8 15l3-4 3 2 5-7"/>,
    sparkle:   <path d="M12 3l1.6 5L18.5 9.5 13.6 11l-1.6 5-1.6-5L5.5 9.5 10.4 8 12 3zM18 15l.8 2.5 2.5.8-2.5.8L18 21.5l-.8-2.5-2.5-.8 2.5-.8L18 15z"/>,
    settings:  <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1A1.7 1.7 0 004.6 9a1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001 1.5H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/></>,
    logout:    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>,
  };
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c}
      strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0 }}>
      {paths[n]}
    </svg>
  );
}

const navGroups = [
  {
    label: "ภาพรวม",
    items: [
      { label: "แดชบอร์ด",     href: "/dashboard",  icon: "dashboard" },
      { label: "พอร์ตโฟลิโอ",  href: "/portfolios",  icon: "wallet"    },
    ],
  },
  {
    label: "การเทรด",
    items: [
      { label: "บันทึกการเทรด",    href: "/journal",    icon: "file"  },
      { label: "เปิดออเดอร์ใหม่", href: "/new",         icon: "plus"  },
      { label: "เครื่องคิดเลข",   href: "/calculator",  icon: "pulse" },
    ],
  },
  {
    label: "วิเคราะห์",
    items: [
      { label: "สถิติประสิทธิภาพ", href: "/analytics", icon: "chart"   },
      { label: "Insights",          href: "/insights",  icon: "sparkle" },
    ],
  },
  {
    label: "บัญชี",
    items: [
      { label: "ตั้งค่า", href: "/settings", icon: "settings" },
    ],
  },
];

export default function Sider({ collapsed }: SiderProps) {
  const pathname  = usePathname();
  const dispatch  = useAppDispatch();
  const router    = useRouter();
  const user      = useAppSelector((s) => s.auth.user);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "TM";

  async function handleLogout() {
    await logoutRequest();
    dispatch(clearAuth());
    router.replace("/login");
  }

  const dropdownItems: MenuProps["items"] = [
    {
      key: "email",
      label: <span style={{ color: "var(--ant-text-3)", fontSize: 12 }}>{user?.email ?? ""}</span>,
      disabled: true,
    },
    { type: "divider" },
    { key: "logout", label: "ออกจากระบบ", danger: true, onClick: handleLogout },
  ];

  return (
    <aside className={`shell-sider${collapsed ? " collapsed" : ""}`}>
      {/* Logo */}
      <div className="shell-sider-logo">
        <div className="shell-sider-logo-mark">T</div>
        <span className="shell-sider-logo-text">TradeMaster</span>
      </div>

      {/* Navigation */}
      <nav className="shell-menu">
        {navGroups.map((group) => (
          <div key={group.label}>
            <div className="shell-menu-group-title">{group.label}</div>
            {group.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shell-menu-item${isActive ? " active" : ""}`}
                  title={item.label}
                >
                  <Icon n={item.icon} s={17} sw={1.5} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer — user info + logout */}
      <div className="shell-sider-footer">
        <Dropdown menu={{ items: dropdownItems }} placement="topLeft" trigger={["click"]}>
          <button
            aria-label="เมนูผู้ใช้งาน"
            style={{
              background: "linear-gradient(135deg, color-mix(in srgb, var(--ant-primary) 70%, #fff 30%), var(--ant-primary))",
              width: 32, height: 32, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 13, fontWeight: 600,
              border: "none", cursor: "pointer", flexShrink: 0,
            }}
          >
            {initials}
          </button>
        </Dropdown>

        <div className="footer-text" style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {user?.name ?? "Trader"}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>Pro Plan</div>
        </div>

        <Link href="/settings" aria-label="ตั้งค่า" style={{ display: "flex", alignItems: "center" }}>
          <Icon n="settings" s={14} c="rgba(255,255,255,0.4)" sw={1.5} />
        </Link>
      </div>
    </aside>
  );
}
