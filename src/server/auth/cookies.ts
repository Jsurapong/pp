import type { NextResponse } from 'next/server';

export const COOKIE_NAME = 'tm_token';

interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax';
  path: string;
  maxAge: number;
}

function baseOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60, // 1 hour
  };
}

export function serializeAuthCookie(token: string): {
  name: string;
  value: string;
  options: CookieOptions;
} {
  return {
    name: COOKIE_NAME,
    value: token,
    options: baseOptions(),
  };
}

export function serializeClearCookie(): {
  name: string;
  value: string;
  options: CookieOptions;
} {
  return {
    name: COOKIE_NAME,
    value: '',
    options: { ...baseOptions(), maxAge: 0 },
  };
}

export function setAuthCookie(res: NextResponse, token: string): void {
  const { name, value, options } = serializeAuthCookie(token);
  res.cookies.set(name, value, options);
}

export function clearAuthCookie(res: NextResponse): void {
  const { name, value, options } = serializeClearCookie();
  res.cookies.set(name, value, options);
}
