interface ComingSoonProps {
  title: string;
}

export default function ComingSoon({ title }: ComingSoonProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 16, color: "var(--ant-text-3)" }}>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12,6 12,12 16,14" />
      </svg>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 20, fontWeight: 600, color: "var(--ant-text)", marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 14 }}>เร็วๆ นี้</div>
      </div>
    </div>
  );
}
