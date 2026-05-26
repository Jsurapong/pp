"use client";

import { Button, Card, Space, Typography } from "antd";
import { LineChartOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Card style={{ maxWidth: 480, width: "100%" }}>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Title level={3} style={{ margin: 0 }}>
            TradeMaster
          </Title>
          <Paragraph type="secondary" style={{ margin: 0 }}>
            Next.js + Ant Design is ready. Start building your portfolio and
            risk management platform.
          </Paragraph>
          <Button type="primary" icon={<LineChartOutlined />}>
            Get Started
          </Button>
        </Space>
      </Card>
    </div>
  );
}
