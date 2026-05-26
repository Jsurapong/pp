import type { Metadata } from 'next';
import { LoginForm } from '@/features/auth';

export const metadata: Metadata = {
  title: 'เข้าสู่ระบบ — TradeMaster',
  description: 'เข้าสู่ระบบ TradeMaster',
};

export default function LoginPage() {
  return <LoginForm />;
}
