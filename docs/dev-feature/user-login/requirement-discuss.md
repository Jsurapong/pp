# Technical Discussion: User Login

เอกสารนี้สรุปการตัดสินใจเชิงเทคนิคสำหรับฟีเจอร์ User Login โดย Aut (CTO) ก่อนเข้าสู่ขั้น implementation จุดประสงค์คือเพื่อให้ FE / BE / QA มี contract และข้อสมมติเดียวกัน

## Decisions

### 1. Backend: Next.js Route Handlers + SQLite
- ไม่มี backend server แยก ใช้ App Router route handlers ที่ `src/app/api/auth/*`
- ใช้ `better-sqlite3` (synchronous, lightweight, ไม่ต้องการ Docker)
- ไฟล์ database อยู่ที่ `data/trademaster.db` (gitignore)
- มี migration script ง่าย ๆ สำหรับสร้าง schema + seed user สำหรับ dev
- เหตุผล: ตอบ requirement ที่บอกว่า "no separate backend server" และ keep stack เล็ก

### 2. Authentication: JWT in httpOnly Cookie
- ใช้ `jsonwebtoken` (HS256) sign ด้วย secret จาก env `JWT_SECRET`
- Access token อายุ **1 ชั่วโมง** (สั้นเพื่อความปลอดภัย)
- **ไม่มี refresh token** ใน scope นี้ — เมื่อหมดอายุให้ผู้ใช้ login ใหม่
- เก็บใน cookie `tm_token` ที่มี flag: `httpOnly`, `secure` (prod), `sameSite=Lax`, `path=/`
- เหตุผล: httpOnly ป้องกัน XSS, sameSite=Lax ป้องกัน CSRF ในระดับที่เพียงพอสำหรับ login form ที่ POST จาก origin เดียวกัน
- หมายเหตุ: requirement บอก session 24h แต่เราย่อเป็น 1h เพราะ refresh token อยู่นอก scope; QA ต้องทดสอบ flow expire

### 3. Password Hashing: bcryptjs
- ใช้ `bcryptjs` (pure JS) ไม่ใช้ `bcrypt` native — เพื่อหลีกเลี่ยงปัญหา native build บน Next.js / Vercel
- Cost factor = 10
- ห้าม log password ทุกกรณี (เพิ่ม ESLint rule ภายหลังถ้าจำเป็น)

### 4. Route Protection: Next.js Middleware
- สร้าง `src/middleware.ts` ตรวจ cookie `tm_token`
- Matcher: ทุก path ภายใต้ `/dashboard`, `/portfolio`, ฯลฯ (ทุกอย่างที่ map กับ `(app)/`) + `/login`
- ถ้าไม่มี token หรือ token invalid และพยายามเข้า protected route → redirect ไป `/login`
- ถ้ามี token valid และพยายามเข้า `/login` → redirect ไป `/dashboard`
- Middleware ใช้ `jose` (Edge-compatible) สำหรับ verify JWT — `jsonwebtoken` ใช้ Node API ไม่ทำงานบน Edge runtime

### 5. State Management: Redux `authSlice`
- เพิ่ม `authSlice` ที่ `src/lib/features/auth/authSlice.ts`
- State: `{ user: { id, email, name } | null, status: 'idle' | 'loading' | 'authenticated' | 'error', error: string | null }`
- ไม่เก็บ `token` ใน Redux เพราะ token อยู่ใน httpOnly cookie (frontend อ่านไม่ได้)
- Hydrate user info จาก `GET /api/auth/me` ตอน app mount (ใน `(app)/layout.tsx`)
- ลงทะเบียน reducer ใน `src/lib/store.ts`

### 6. Form Validation
- ใช้ Ant Design `Form` rules สำหรับ client-side validation
- Email: required + `type: 'email'`
- Password: required + `min: 8`
- ฝั่ง server validate ซ้ำด้วย `zod` schema เดียวกัน (defensive)

### 7. UI Layout
- หน้า `/login` อยู่ที่ `src/app/login/page.tsx` **นอก** route group `(app)/` เพื่อไม่ให้แสดง AppShell
- ปุ่ม Logout อยู่ใน Header ของ AppShell (ใน dropdown ของชื่อผู้ใช้)

### 8. Error Handling Contract
- API คืน HTTP status + body `{ error: { code, message } }` เสมอ
- Frontend map `code` → ข้อความภาษาไทย (ไม่ใช้ `message` จาก backend โดยตรงสำหรับโชว์ผู้ใช้)
- Code ที่ใช้: `INVALID_CREDENTIALS`, `VALIDATION_ERROR`, `INTERNAL_ERROR`, `UNAUTHORIZED`

### 9. CSRF
- เนื่องจาก cookie เป็น `sameSite=Lax` และ login เป็น POST ผ่าน same-origin fetch จึง**ไม่ต้องการ CSRF token แยก** ใน scope นี้
- ถ้าในอนาคตเปิด API ให้ third-party origin ค่อยเพิ่ม CSRF token

### 10. Rate Limiting
- **Out of scope** ในรอบนี้ (ตาม open question #4) — ไม่ทำ
- เพิ่ม TODO comment ที่ login handler เพื่ออ้างอิงภายหลัง

## Resolved Open Questions

| # | Question | Decision |
|---|---|---|
| 1 | Backend API | สร้างจริงด้วย Next.js route handlers + SQLite |
| 2 | Token strategy | JWT ใน httpOnly cookie |
| 3 | Session duration | 1 ชั่วโมง, ไม่มี refresh token |
| 4 | Rate limiting | ไม่ทำ (out of scope) |
| 5 | เกณฑ์รหัสผ่าน | ขั้นต่ำ 8 ตัวอักษร (ตามที่ requirement ระบุ) ไม่เพิ่มเงื่อนไขอื่น |
| 6 | User identifier | อีเมลอย่างเดียว |
| 7 | Logo/Branding | ใช้ text "TradeMaster" + emoji/icon placeholder ก่อน |
| 8 | Multi-tab logout | ไม่ทำ sync ระหว่าง tab ใน scope นี้ |

## API Contract (สรุปเพื่อให้ FE / BE ตรงกัน)

### POST `/api/auth/login`
**Request body**
```json
{ "email": "user@example.com", "password": "password123" }
```
**Response 200**
```json
{ "user": { "id": "uuid", "email": "user@example.com", "name": "User Name" } }
```
- Set-Cookie: `tm_token=<jwt>; HttpOnly; Secure; SameSite=Lax; Max-Age=3600; Path=/`

**Response 400** — validation
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Invalid input", "fields": { "email": "..." } } }
```
**Response 401** — wrong credentials
```json
{ "error": { "code": "INVALID_CREDENTIALS", "message": "Invalid email or password" } }
```
**Response 500**
```json
{ "error": { "code": "INTERNAL_ERROR", "message": "Internal server error" } }
```

### POST `/api/auth/logout`
- Clears cookie `tm_token`
- **Response 200**: `{ "ok": true }`

### GET `/api/auth/me`
- ใช้ cookie `tm_token` ในการ authenticate
- **Response 200**: `{ "user": { "id", "email", "name" } }`
- **Response 401**: `{ "error": { "code": "UNAUTHORIZED" } }`

## Dependencies to add
- `better-sqlite3`
- `bcryptjs` + `@types/bcryptjs`
- `jsonwebtoken` + `@types/jsonwebtoken`
- `jose` (สำหรับ middleware verify บน Edge)
- `zod`

## Risks / Mitigation
- **Edge runtime ไม่รองรับ `jsonwebtoken`** → ใช้ `jose` ใน middleware เท่านั้น, route handlers ใช้ `jsonwebtoken` ได้ปกติ
- **`better-sqlite3` ต้อง native build** → ต้องบันทึก node version ที่ใช้ (Node 20+) + `npm rebuild` ใน CI ภายหลัง
- **JWT secret leak** → secret ต้องอยู่ใน `.env.local` (ไม่ commit) และมี fallback ที่ throw error ถ้าไม่มี env var ใน production
