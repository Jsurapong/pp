'use client';

import { Alert, App, Button, Form, Input } from 'antd';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setLoading, setUser, setError } from '@/lib/features/auth/authSlice';
import { loginRequest } from '@/lib/features/auth/authApi';
import type { AuthErrorCode, LoginPayload } from '@/lib/types/auth';

const errorMessages: Record<AuthErrorCode, string> = {
  INVALID_CREDENTIALS: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
  VALIDATION_ERROR: 'ข้อมูลที่กรอกไม่ถูกต้อง',
  INTERNAL_ERROR: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
  NETWORK_ERROR: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
  UNAUTHORIZED: 'ไม่มีสิทธิ์เข้าถึง กรุณาเข้าสู่ระบบใหม่',
};

export default function LoginForm() {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const { message } = App.useApp();

  const isLoading = status === 'loading';

  async function onFinish(values: LoginPayload) {
    dispatch(setLoading());
    try {
      const user = await loginRequest(values);
      dispatch(setUser(user));
      message.success('เข้าสู่ระบบสำเร็จ');
      router.replace('/dashboard');
    } catch (err: unknown) {
      const errObj = err as { code?: AuthErrorCode };
      dispatch(setError(errObj?.code ?? 'INTERNAL_ERROR'));
    }
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 420,
        background: 'var(--ant-card)',
        borderRadius: 'var(--ant-radius)',
        boxShadow: 'var(--ant-shadow-2)',
        padding: '40px 40px 32px',
      }}
    >
      {/* Logo + App Name */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: 'var(--ant-radius)',
            background: 'var(--ant-primary)',
            marginBottom: 12,
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
          </svg>
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ant-text)', lineHeight: 1.3 }}>
          TradeMaster
        </div>
        <div style={{ fontSize: 13, color: 'var(--ant-text-3)', marginTop: 4 }}>
          Portfolio &amp; Risk Management Platform
        </div>
      </div>

      <h1
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: 'var(--ant-text)',
          textAlign: 'center',
          margin: '0 0 24px',
        }}
      >
        เข้าสู่ระบบ
      </h1>

      {/* Error Alert */}
      {status === 'error' && error && (
        <div role="alert" aria-live="polite" style={{ marginBottom: 20 }}>
          <Alert
            type="error"
            title={errorMessages[error] ?? 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'}
            showIcon
          />
        </div>
      )}

      <Form layout="vertical" onFinish={onFinish} requiredMark={false} size="large">
        <Form.Item
          label="อีเมล"
          name="email"
          rules={[
            { required: true, message: 'กรุณากรอกอีเมล' },
            { type: 'email', message: 'รูปแบบอีเมลไม่ถูกต้อง' },
          ]}
        >
          <Input placeholder="กรุณากรอกอีเมลของคุณ" autoComplete="email" />
        </Form.Item>

        <Form.Item
          label="รหัสผ่าน"
          name="password"
          rules={[
            { required: true, message: 'กรุณากรอกรหัสผ่าน' },
            { min: 8, message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' },
          ]}
        >
          <Input.Password
            placeholder="กรุณากรอกรหัสผ่าน"
            autoComplete="current-password"
            iconRender={(visible) =>
              visible ? (
                <EyeOutlined aria-label="ซ่อนรหัสผ่าน" />
              ) : (
                <EyeInvisibleOutlined aria-label="แสดงรหัสผ่าน" />
              )
            }
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            block
            size="large"
            style={{ fontWeight: 600 }}
          >
            {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </Button>
        </Form.Item>
      </Form>

      <p
        style={{
          textAlign: 'center',
          marginTop: 24,
          marginBottom: 0,
          fontSize: 13,
          color: 'var(--ant-text-3)',
        }}
      >
        ยังไม่มีบัญชี? ติดต่อผู้ดูแลระบบ
      </p>
    </div>
  );
}
