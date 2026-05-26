'use client';

import { useState } from 'react';
import { App } from 'antd';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/shared/lib/hooks';
import { setLoading, setUser, setError, loginRequest } from '@/features/auth';
import type { AuthErrorCode } from '@/features/auth';

const errorMessages: Record<AuthErrorCode, string> = {
  INVALID_CREDENTIALS: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
  VALIDATION_ERROR:    'ข้อมูลที่กรอกไม่ถูกต้อง',
  INTERNAL_ERROR:      'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
  NETWORK_ERROR:       'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
  UNAUTHORIZED:        'ไม่มีสิทธิ์เข้าถึง กรุณาเข้าสู่ระบบใหม่',
};

function Icon({ name, size = 16, color = 'currentColor', sw = 1.5 }: {
  name: 'pulse' | 'chart' | 'sparkle' | 'check' | 'right' | 'eye' | 'eye-off';
  size?: number; color?: string; sw?: number;
}) {
  const paths: Record<string, React.ReactNode> = {
    pulse:   <path d="M3 12h4l2-7 4 14 2-7h6" />,
    chart:   <path d="M4 19V5M4 19h16M8 15l3-4 3 2 5-7" />,
    sparkle: <path d="M12 3l1.6 5L18.5 9.5 13.6 11l-1.6 5-1.6-5L5.5 9.5 10.4 8 12 3zM18 15l.8 2.5 2.5.8-2.5.8L18 21.5l-.8-2.5-2.5-.8 2.5-.8L18 15z" />,
    check:   <path d="M5 12l4.5 4.5L19 7" />,
    right:   <path d="M9 6l6 6-6 6" />,
    eye:     <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
    'eye-off': <><path d="M17.9 17.9A9.9 9.9 0 0112 19c-6 0-10-7-10-7a18.4 18.4 0 015.1-5.9M9.9 4.2A9.8 9.8 0 0112 4c6 0 10 7 10 7a18.4 18.4 0 01-2.1 3M3 3l18 18" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      {paths[name]}
    </svg>
  );
}

const FEATURES = [
  { icon: 'pulse'   as const, title: 'Position Size อัตโนมัติ',    desc: 'กรอกทุน, ความเสี่ยง %, Entry และ Stop Loss — ระบบบอก Lot ที่ถูกต้องทันที' },
  { icon: 'chart'   as const, title: 'Multi-Portfolio Dashboard',  desc: 'จัดการหลายพอร์ตในที่เดียว ดู Equity Curve, Win Rate และ RRR เฉลี่ย' },
  { icon: 'sparkle' as const, title: 'Frictionless Journaling',    desc: 'บันทึกเทรดพร้อมภาพ TradingView, Confidence และ Emotion ใน 30 วินาที' },
];

export default function LoginForm() {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((s) => s.auth);
  const router = useRouter();
  const { message } = App.useApp();

  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPw,      setShowPw]      = useState(false);
  const [rememberMe,  setRememberMe]  = useState(true);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const isLoading = status === 'loading';

  function validate() {
    const e: { email?: string; password?: string } = {};
    if (!email)                                    e.email    = 'กรุณากรอกอีเมล';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    if (!password)                                 e.password = 'กรุณากรอกรหัสผ่าน';
    else if (password.length < 8)                  e.password = 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    dispatch(setLoading());
    try {
      const user = await loginRequest({ email, password });
      dispatch(setUser(user));
      message.success('เข้าสู่ระบบสำเร็จ');
      router.replace('/dashboard');
    } catch (err: unknown) {
      const e = err as { code?: AuthErrorCode };
      dispatch(setError(e?.code ?? 'INTERNAL_ERROR'));
    }
  }

  return (
    <div className="tm-login-shell">

      {/* ── Left: brand panel ── */}
      <div className="tm-login-left">
        <div>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'var(--ant-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 17, fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>T</div>
            <span style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--ant-text)' }}>
              TradeMaster
            </span>
          </div>

          {/* Headline */}
          <div style={{ marginTop: 64 }}>
            <div style={{
              fontSize: 13, color: 'var(--ant-primary)', fontWeight: 600,
              letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14,
            }}>
              Journal + Money management
            </div>
            <h1 style={{
              fontSize: 40, fontWeight: 700, letterSpacing: '-0.03em',
              lineHeight: 1.1, margin: 0, color: 'var(--ant-text)',
            }}>
              วินัยในการเทรด<br />
              เริ่มต้นที่{' '}
              <span style={{ color: 'var(--ant-primary)' }}>การจดบันทึก</span>
            </h1>
            <p style={{ fontSize: 15, color: 'var(--ant-text-2)', marginTop: 18, lineHeight: 1.65, maxWidth: 440 }}>
              บอกลา Excel — ระบบจะคำนวณขนาด Lot, RRR และความเสี่ยงให้อัตโนมัติ
              พร้อมแสดงผลสถิติพอร์ตของคุณแบบเรียลไทม์
            </p>
          </div>

          {/* Feature list */}
          <div className="tm-feat-list">
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} className="tm-feat">
                <div className="tm-feat-icon">
                  <Icon name={icon} size={20} sw={1.7} />
                </div>
                <div>
                  <div className="tm-feat-title">{title}</div>
                  <div className="tm-feat-desc">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer stat */}
        <div style={{ position: 'relative', zIndex: 1, fontSize: 12, color: 'var(--ant-text-3)' }}>
          ใช้งานโดยเทรดเดอร์กว่า 12,400 คน · 1.2M+ trades logged
        </div>

        {/* Radial glow */}
        <div className="tm-login-left-glow" />
      </div>

      {/* ── Right: form panel ── */}
      <div className="tm-login-right">
        <div className="tm-login-form-box">
          <h2>เข้าสู่ระบบ</h2>
          <p className="tm-login-form-sub">ยินดีต้อนรับกลับ — มาดูพอร์ตของคุณกัน</p>

          {/* Google (UI-only — OAuth not yet wired) */}
          <button type="button" className="tm-login-btn-google" disabled aria-disabled="true">
            <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4c-.2 1.2-.9 2.3-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z" />
              <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6C4.7 19.7 8.1 22 12 22z" />
              <path fill="#FBBC05" d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1C2.4 8.8 2 10.4 2 12s.4 3.2 1.1 4.6L6.4 14z" />
              <path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 2.9 14.7 2 12 2 8.1 2 4.7 4.3 3.1 7.4L6.4 10c.8-2.3 3-4.1 5.6-4.1z" />
            </svg>
            เข้าสู่ระบบด้วย Google
          </button>

          <div className="tm-login-divider-or">หรือใช้อีเมล</div>

          {/* API error */}
          {status === 'error' && error && (
            <div role="alert" aria-live="polite" className="tm-login-error">
              {errorMessages[error] ?? 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="tm-login-field">
              <label className="tm-login-label" htmlFor="email">อีเมล</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="กรุณากรอกอีเมลของคุณ"
                className={`tm-login-input${fieldErrors.email ? ' error' : ''}`}
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldErrors(v => ({ ...v, email: undefined })); }}
                aria-describedby={fieldErrors.email ? 'email-err' : undefined}
              />
              {fieldErrors.email && <div id="email-err" className="tm-login-field-error">{fieldErrors.email}</div>}
            </div>

            {/* Password */}
            <div className="tm-login-field">
              <label className="tm-login-label" htmlFor="password"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>รหัสผ่าน</span>
                <span style={{ fontSize: 13, color: 'var(--ant-primary)', fontWeight: 400, cursor: 'default' }}>
                  ลืมรหัสผ่าน?
                </span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="กรุณากรอกรหัสผ่าน"
                  className={`tm-login-input${fieldErrors.password ? ' error' : ''}`}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors(v => ({ ...v, password: undefined })); }}
                  style={{ paddingRight: 44 }}
                  aria-describedby={fieldErrors.password ? 'pw-err' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  aria-label={showPw ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                    color: 'var(--ant-text-3)', display: 'flex', alignItems: 'center',
                  }}
                >
                  <Icon name={showPw ? 'eye-off' : 'eye'} size={16} sw={1.5} />
                </button>
              </div>
              {fieldErrors.password && <div id="pw-err" className="tm-login-field-error">{fieldErrors.password}</div>}
            </div>

            {/* Remember me */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0 24px' }}>
              <button
                type="button"
                role="checkbox"
                aria-checked={rememberMe}
                onClick={() => setRememberMe(v => !v)}
                style={{
                  width: 16, height: 16, borderRadius: 4, border: 'none', padding: 0, flexShrink: 0,
                  background: rememberMe ? 'var(--ant-primary)' : 'var(--ant-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                {rememberMe && <Icon name="check" size={11} color="#fff" sw={3} />}
              </button>
              <span style={{ fontSize: 13, color: 'var(--ant-text-2)' }}>จดจำฉันไว้ในระบบนี้</span>
            </div>

            {/* Submit */}
            <button type="submit" className="tm-login-submit" disabled={isLoading}>
              {isLoading
                ? 'กำลังเข้าสู่ระบบ...'
                : <><span>เข้าสู่ระบบ</span><Icon name="right" size={14} sw={2} /></>
              }
            </button>
          </form>

          <div style={{ marginTop: 28, textAlign: 'center', fontSize: 13, color: 'var(--ant-text-3)' }}>
            ยังไม่มีบัญชี?{' '}
            <span style={{ color: 'var(--ant-text-2)', fontWeight: 500 }}>ติดต่อผู้ดูแลระบบ</span>
          </div>
        </div>
      </div>

    </div>
  );
}
