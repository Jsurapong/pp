import DatabaseConstructor, { type Database } from 'better-sqlite3';
import { migrate } from './migrate';

declare global {
  var __db: Database | undefined;
}

export function getDb(): Database {
  if (globalThis.__db) {
    return globalThis.__db;
  }

  const dbPath = process.env.DATABASE_PATH ?? 'data/trademaster.db';
  const db = new DatabaseConstructor(dbPath);

  // Performance & safety pragmas
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Auto-run migrations on first access (idempotent)
  migrate(db);

  globalThis.__db = db;
  return db;
}
