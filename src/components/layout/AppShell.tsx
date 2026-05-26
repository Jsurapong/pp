"use client";

import { useState } from "react";
import Sider from "./Sider";
import Header from "./Header";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="shell-layout">
      <Sider collapsed={collapsed} />
      <div className="shell-main">
        <Header onToggle={() => setCollapsed((c) => !c)} />
        <main className="shell-content">{children}</main>
      </div>
    </div>
  );
}
