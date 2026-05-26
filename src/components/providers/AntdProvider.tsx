"use client";

import { App, ConfigProvider } from "antd";
import { antdTheme } from "@/design-system/antd-theme";

export default function AntdProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConfigProvider theme={antdTheme}>
      <App>{children}</App>
    </ConfigProvider>
  );
}
