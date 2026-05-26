import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookie } from '@/server/auth/cookies';

export const runtime = 'nodejs';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_req: NextRequest): Promise<NextResponse> {
  const response = NextResponse.json({ ok: true });
  clearAuthCookie(response);
  return response;
}
