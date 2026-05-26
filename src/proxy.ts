import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'tm_token';

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET ?? '';
  return new TextEncoder().encode(secret);
}

const PROTECTED_PREFIXES = ['/dashboard'];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isLogin = pathname === '/login';
  const isProtected = isProtectedRoute(pathname);

  const tokenValue = req.cookies.get(COOKIE_NAME)?.value;

  if (tokenValue) {
    try {
      await jwtVerify(tokenValue, getJwtSecret());
      if (isLogin) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      return NextResponse.next();
    } catch {
      const res = isProtected
        ? NextResponse.redirect(new URL('/login', req.url))
        : NextResponse.next();
      res.cookies.delete(COOKIE_NAME);
      return res;
    }
  } else {
    if (isProtected) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/login', '/dashboard/:path*'],
};
