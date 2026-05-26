#!/usr/bin/env tsx
import { getDb } from '../src/server/db/client';

console.log('Running database migration...');
getDb(); // triggers migrate() automatically on first access
console.log('Migration complete.');
