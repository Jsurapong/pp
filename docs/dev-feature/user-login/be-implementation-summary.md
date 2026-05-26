# Backend Implementation Summary: User Login

**Author:** Backend Dev (Bow)
**Date:** 2026-05-26
**Status:** Complete

---

## What Was Built

Full backend authentication stack for TradeMaster login/logout/session using Next.js App Router route handlers, SQLite (better-sqlite3), bcryptjs, and jsonwebtoken.

---

## Files Created

### Database layer
| File | Description |
|------|-------------|
| `data/.gitkeep` | Keeps `data/` directory in git; actual `.db` files are gitignored |
| `src/server/db/client.ts` | Singleton `better-sqlite3` instance cached on `globalThis` (HMR-safe), auto-runs migration on first access |
| `src/server/db/migrate.ts` | Idempotent schema: `users` table + `idx_users_email` index |
| `src/server/db/seed.ts` | Inserts `demo@trademaster.local / password123` via `INSERT OR IGNORE` |

### Auth utilities
| File | Description |
|------|-------------|
| `src/server/auth/password.ts` | `hashPassword` / `verifyPassword` (bcrypt cost 10) |
| `src/server/auth/jwt.ts` | `signToken` / `verifyToken` using `jsonwebtoken` (Node runtime, HS256, 1h) |
| `src/server/auth/jwt-edge.ts` | `verifyTokenEdge` using `jose` — for Edge runtime (middleware only) |
| `src/server/auth/cookies.ts` | `COOKIE_NAME`, `serializeAuthCookie`, `serializeClearCookie`, `setAuthCookie`, `clearAuthCookie` |
| `src/server/auth/session.ts` | `getCurrentUser(req)` — reads cookie, verifies JWT, queries DB |

### Validation
| File | Description |
|------|-------------|
| `src/server/validation/auth-schemas.ts` | `loginSchema` (zod): email + password ≥ 8 chars |

### API route handlers
| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/login` | POST | Validate → query user → bcrypt verify → sign JWT → Set-Cookie |
| `/api/auth/logout` | POST | Always clears cookie; returns `{ ok: true }` |
| `/api/auth/me` | GET | Reads session → 200 `{user}` or 401 UNAUTHORIZED |

### CLI scripts
| File | npm script | Description |
|------|------------|-------------|
| `scripts/db-migrate.ts` | `npm run db:migrate` | Runs migration (creates DB + schema) |
| `scripts/db-seed.ts` | `npm run db:seed` | Inserts demo user |

### Config changes
| File | Change |
|------|--------|
| `.gitignore` | Added `data/*.db`, `.db-journal`, `.db-wal`, `.db-shm` |
| `package.json` | Added `db:migrate` and `db:seed` scripts |
| `.env.local.example` | Added `JWT_SECRET` and `DATABASE_PATH` |

---

## API Contract

### POST /api/auth/login
**Request body:** `{ "email": string, "password": string }`

**Success (200):**
```json
{ "user": { "id": "...", "email": "...", "name": "..." } }
```
+ `Set-Cookie: tm_token=<jwt>; HttpOnly; SameSite=Lax; Path=/; Max-Age=3600`

**Errors:**
- `400 VALIDATION_ERROR` — invalid email format or password < 8 chars (includes `fields`)
- `401 INVALID_CREDENTIALS` — user not found or password mismatch

---

### POST /api/auth/logout
**Success (200):** `{ "ok": true }` + cookie cleared (`Max-Age=0`)

---

### GET /api/auth/me
**Success (200):** `{ "user": { "id", "email", "name" } }` + `Cache-Control: no-store`

**Error:** `401 UNAUTHORIZED`

---

### Error shape (all errors)
```json
{
  "error": {
    "code": "STRING",
    "message": "STRING",
    "fields": { "fieldName": "message" }   // only on VALIDATION_ERROR
  }
}
```

**Error codes:** `INVALID_CREDENTIALS` | `VALIDATION_ERROR` | `UNAUTHORIZED` | `INTERNAL_ERROR`

---

## Security Measures Implemented

- **bcrypt cost 10** — all password hashing
- **JWT HS256, 1h expiry** — secret from `JWT_SECRET` env; dev fallback only (throws in production if unset)
- **httpOnly cookie** — not accessible from JavaScript
- **Secure flag** — set only in production (`NODE_ENV === 'production'`)
- **SameSite: lax** — CSRF protection
- **Timing attack mitigation** — if user not found: 200ms delay + dummy bcrypt compare (same timing as real compare path)
- **No credential logging** — password and token never appear in console output
- **All route handlers:** `export const runtime = 'nodejs'` (prevents accidental Edge deployment of Node-only libs)

---

## Dependencies Added

### Runtime
- `better-sqlite3` — embedded SQLite, file: `data/trademaster.db`
- `bcryptjs` — pure-JS bcrypt (no native binding issues)
- `jsonwebtoken` — JWT sign/verify (Node runtime)
- `jose` — JWT verify for Edge runtime (middleware)
- `zod` — request validation

### Dev
- `@types/better-sqlite3`, `@types/bcryptjs`, `@types/jsonwebtoken`
- `tsx` — run TypeScript scripts directly

---

## Testing Notes

**No test framework is configured in this project.** Manual acceptance testing procedure:

```bash
# 1. Setup
npm run db:migrate
npm run db:seed

# 2. Start server
npm run dev

# 3. Test login (should succeed)
curl -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@trademaster.local","password":"password123"}'

# 4. Test me (should return user)
curl -b cookies.txt http://localhost:3000/api/auth/me

# 5. Test logout
curl -b cookies.txt -c cookies.txt -X POST http://localhost:3000/api/auth/logout

# 6. Test me after logout (should return 401)
curl -b cookies.txt http://localhost:3000/api/auth/me

# 7. Test wrong password (should 401)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@trademaster.local","password":"wrongpassword"}'

# 8. Test invalid email (should 400 VALIDATION_ERROR)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"notanemail","password":"password123"}'
```

---

## Known Limitations / Follow-up

1. **No test framework** — unit and integration tests should be added (Jest + supertest recommended)
2. **No refresh token** — session expires after 1 hour; a refresh mechanism would improve UX
3. **No rate limiting** — brute-force protection should be added at middleware or route level
4. **Single DB file** — fine for development; production deployments on serverless would need a different DB strategy
5. **No user management UI** — only the demo user exists; an admin panel or registration flow is a future feature
