export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--ant-bg-3)',
        padding: '24px',
      }}
    >
      {children}
    </div>
  );
}
