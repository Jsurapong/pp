#!/usr/bin/env tsx
import { seed } from '../src/server/db/seed';

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
