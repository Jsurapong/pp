import { randomUUID } from 'crypto';
import { getDb } from './client';
import { hashPassword } from '../auth/password';

export async function seed(): Promise<void> {
  const db = getDb();
  const now = Date.now();

  const passwordHash = await hashPassword('password123');

  db.prepare(
    `INSERT OR IGNORE INTO users (id, email, password_hash, name, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(randomUUID(), 'demo@trademaster.local', passwordHash, 'Demo User', now, now);

  console.log('Seed complete — demo@trademaster.local is ready.');
}
