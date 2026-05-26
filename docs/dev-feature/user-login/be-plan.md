# Backend Plan: User Login

ผู้รับผิดชอบ: Backend Dev
อ้างอิง: `requirement.md`, `requirement-discuss.md`

## เป้าหมาย
สร้าง API endpoints สำหรับ login / logout / me ด้วย Next.js App Router route handlers + SQLite. ทุก endpoint ต้องสอดคล้องกับ contract ใน `requirement-discuss.md`

## Dependencies ที่ต้องติดตั้ง
```
npm i better-sqlite3 bcryptjs jsonwebtoken jose zod
npm i -D @types/better-sqlite3 @types/bcryptjs @types/jsonwebtoken
```

## ไฟล์ที่ต้องสร้าง / แก้ไข

### สร้างใหม่
```
data/                            ← directory เก็บ DB file (gitignore)
data/.gitkeep

src/server/db/
├── client.ts                    ← singleton better-sqlite3 instance
├── migrate.ts                   ← สร้าง schema (run ครั้งเดียวตอน startup)
└── seed.ts                      ← เพิ่ม dev user (รันด้วย script)

src/server/auth/
├── password.ts                  ← bcrypt hash + compare
├── jwt.ts                       ← sign / verify (Node — jsonwebtoken)
├── jwt-edge.ts                  ← verify สำหรับ Edge (jose) — ใช้ใน middleware
├── cookies.ts                   ← helper set/clear cookie ที่มี config ถูกต้อง
└── session.ts                   ← getCurrentUser(req) อ่าน cookie + verify + query DB

src/server/validation/
└── auth-schemas.ts              ← zod schemas สำหรับ login payload

src/app/api/auth/
├── login/route.ts               ← POST /api/auth/login
├── logout/route.ts              ← POST /api/auth/logout
└── me/route.ts                  ← GET  /api/auth/me

scripts/
├── db-migrate.ts                ← cli: รัน migrate
└── db-seed.ts                   ← cli: รัน seed
```

### แก้ไข
```
.gitignore                       ← เพิ่ม data/*.db
package.json                     ← เพิ่ม scripts: db:migrate, db:seed
.env.local.example               ← เพิ่ม JWT_SECRET, DATABASE_PATH
```

## รายละเอียดแต่ละไฟล์

### `src/server/db/client.ts`
- สร้าง singleton `Database` instance จาก `better-sqlite3`
- Path = `process.env.DATABASE_PATH ?? 'data/trademaster.db'`
- Set pragma: `journal_mode = WAL`, `foreign_keys = ON`
- Export `getDb(): Database.Database`
- ใช้ `globalThis` cache เพื่อป้องกัน reload ตอน dev (Next.js HMR)
- ตอน init ครั้งแรกให้รัน migrate อัตโนมัติ (idempotent — `CREATE TABLE IF NOT EXISTS`)

### `src/server/db/migrate.ts`
- Schema:
  ```sql
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,             -- uuid
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at INTEGER NOT NULL,     -- unix ms
    updated_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  ```
- Export `migrate(db: Database.Database): void`

### `src/server/db/seed.ts`
- Insert dev user ถ้ายังไม่มี:
  - email: `demo@trademaster.local`
  - password: `password123` (hash ด้วย bcrypt cost 10)
  - name: `Demo User`
- Idempotent — ใช้ `INSERT OR IGNORE`

### `src/server/auth/password.ts`
- `hashPassword(plain: string): Promise<string>` — bcrypt 10 rounds
- `verifyPassword(plain: string, hash: string): Promise<boolean>`

### `src/server/auth/jwt.ts` (Node runtime)
- `signToken(payload: { sub: string; email: string }): string`
  - algorithm HS256, expiresIn `1h`, secret จาก env
- `verifyToken(token: string): { sub: string; email: string } | null`
- ใช้ใน route handlers (Node)

### `src/server/auth/jwt-edge.ts` (Edge runtime)
- ใช้ `jose.jwtVerify` กับ `TextEncoder().encode(JWT_SECRET)`
- `verifyTokenEdge(token: string): Promise<{ sub: string; email: string } | null>`
- ใช้ใน `src/middleware.ts` เท่านั้น
- Throw safe — catch error คืน `null` แทน

### `src/server/auth/cookies.ts`
- Constant `COOKIE_NAME = 'tm_token'`
- `serializeAuthCookie(token: string): { name, value, options }` — options:
  ```
  httpOnly: true
  secure: process.env.NODE_ENV === 'production'
  sameSite: 'lax'
  path: '/'
  maxAge: 60 * 60       // 1 ชั่วโมง
  ```
- `serializeClearCookie(): { name, value: '', options: { ...same, maxAge: 0 } }`
- Helper ที่รับ `NextResponse` แล้ว set/clear ให้

### `src/server/auth/session.ts`
- `getCurrentUser(req: NextRequest): User | null`
  - อ่าน cookie ผ่าน `req.cookies.get(COOKIE_NAME)`
  - verify JWT ด้วย `verifyToken`
  - query DB `SELECT id, email, name FROM users WHERE id = ?`
  - คืน user หรือ null

### `src/server/validation/auth-schemas.ts`
- `loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) })`
- Export inferred type

### `src/app/api/auth/login/route.ts`
- Export `async function POST(req: NextRequest)`
- ขั้นตอน:
  1. Parse JSON body — catch parse error → 400 `VALIDATION_ERROR`
  2. `loginSchema.safeParse(body)` → ถ้า fail → 400 `VALIDATION_ERROR` + `fields`
  3. Query user: `SELECT * FROM users WHERE email = ?`
  4. ถ้าไม่มี user → **delay 200ms (timing attack mitigation)** + return 401 `INVALID_CREDENTIALS`
  5. `verifyPassword(password, user.password_hash)` → ถ้า false → 401 `INVALID_CREDENTIALS`
  6. `signToken({ sub: user.id, email: user.email })`
  7. Build `NextResponse.json({ user: { id, email, name } })` + set cookie
- ห้าม log password / token

### `src/app/api/auth/logout/route.ts`
- Export `async function POST(req: NextRequest)`
- Clear cookie + return `{ ok: true }`
- ไม่ต้องเช็คว่า token valid หรือไม่ — clear cookie เสมอ

### `src/app/api/auth/me/route.ts`
- Export `async function GET(req: NextRequest)`
- `const user = getCurrentUser(req)`
- ถ้า null → 401 `{ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }`
- ถ้ามี → 200 `{ user }`
- เพิ่ม header `Cache-Control: no-store`

### `scripts/db-migrate.ts` + `scripts/db-seed.ts`
- รันด้วย `tsx` หรือ `ts-node`
- เพิ่ม script ใน `package.json`:
  ```
  "db:migrate": "tsx scripts/db-migrate.ts",
  "db:seed": "tsx scripts/db-seed.ts"
  ```
- ติดตั้ง `tsx` เป็น dev dependency ถ้ายังไม่มี

### `.gitignore`
- เพิ่ม:
  ```
  data/*.db
  data/*.db-journal
  data/*.db-wal
  data/*.db-shm
  ```

### `.env.local.example`
```
JWT_SECRET=replace-with-32+chars-random-string
DATABASE_PATH=data/trademaster.db
```

## Runtime config
- Route handlers ทุกตัวต้อง `export const runtime = 'nodejs'` (default แต่เขียนชัดเพื่อกัน Edge — `better-sqlite3` + `bcryptjs` + `jsonwebtoken` ใช้ Edge ไม่ได้)
- `middleware.ts` ทำงานบน Edge อยู่แล้ว — ใช้ `jose` เท่านั้น

## Error response shape (มาตรฐาน)
```json
{ "error": { "code": "STRING", "message": "STRING", "fields": { "field": "msg" } } }
```
`fields` มีเฉพาะกรณี `VALIDATION_ERROR`

## Acceptance ฝั่ง BE
- [ ] `npm run db:migrate` สร้าง DB + table users
- [ ] `npm run db:seed` insert demo user
- [ ] POST `/api/auth/login` ด้วย `demo@trademaster.local` / `password123` → 200 + Set-Cookie
- [ ] POST `/api/auth/login` ด้วย password ผิด → 401 `INVALID_CREDENTIALS`
- [ ] POST `/api/auth/login` ด้วย email format ผิด → 400 `VALIDATION_ERROR`
- [ ] POST `/api/auth/login` ด้วย password < 8 → 400 `VALIDATION_ERROR`
- [ ] GET `/api/auth/me` มี cookie valid → 200 + user
- [ ] GET `/api/auth/me` ไม่มี cookie → 401
- [ ] POST `/api/auth/logout` → 200 + cookie ถูก clear
- [ ] Token expire หลัง 1 ชั่วโมง (manual override `expiresIn` เพื่อทดสอบ)
- [ ] ไม่มี password / token ใน log

## Security checklist
- [ ] bcrypt cost = 10
- [ ] JWT secret มาจาก env (throw ถ้าไม่มีใน prod)
- [ ] Cookie httpOnly + secure (prod) + sameSite Lax
- [ ] ตอบ error เดียวกันสำหรับ "user ไม่มี" และ "password ผิด"
- [ ] Constant-time-ish: เรียก bcrypt compare เสมอแม้ user ไม่มี (ใช้ dummy hash) **หรือ** delay เพื่อกัน timing attack
- [ ] ห้าม log body request ที่มี password
