import type { NextRequest } from 'next/server';
import { COOKIE_NAME } from './cookies';
import { verifyToken } from './jwt';
import { getDb } from '../db/client';

export interface User {
  id: string;
  email: string;
  name: string;
}

export function getCurrentUser(req: NextRequest): User | null {
  const cookie = req.cookies.get(COOKIE_NAME);
  if (!cookie?.value) return null;

  const payload = verifyToken(cookie.value);
  if (!payload) return null;

  const db = getDb();
  const user = db
    .prepare<[string], User>('SELECT id, email, name FROM users WHERE id = ?')
    .get(payload.sub);

  return user ?? null;
}
