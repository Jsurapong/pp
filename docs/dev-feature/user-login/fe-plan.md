# Frontend Plan: User Login

ผู้รับผิดชอบ: Frontend Dev
อ้างอิง: `requirement.md`, `requirement-discuss.md`

## เป้าหมาย
สร้าง UI สำหรับ login/logout, integrate กับ Redux และ middleware, ทุกข้อความเป็นภาษาไทย, ใช้ Ant Design + design tokens เท่านั้น

## ไฟล์ที่ต้องสร้าง / แก้ไข

### สร้างใหม่
```
src/app/login/
├── layout.tsx              ← layout ของหน้า login (ไม่มี AppShell)
└── page.tsx                ← หน้า login

src/app/login/_components/
└── LoginForm.tsx           ← client component สำหรับฟอร์ม

src/lib/features/auth/
├── authSlice.ts            ← Redux slice
├── authApi.ts              ← thunks / fetch functions
└── selectors.ts            ← typed selectors (optional)

src/components/app-shell/
└── UserMenu.tsx            ← dropdown user + ปุ่ม logout (ใส่ใน Header)

src/middleware.ts           ← route protection (Edge runtime)

src/lib/types/auth.ts       ← type definitions: User, AuthState, ApiError
```

### แก้ไข
```
src/lib/store.ts            ← register authReducer
src/app/(app)/layout.tsx    ← hydrate user info จาก /api/auth/me ตอน mount
src/components/app-shell/Header.tsx  ← mount <UserMenu />
.env.local.example          ← เพิ่ม JWT_SECRET (สำหรับ dev อ้างอิง)
```
> หมายเหตุ: ชื่อไฟล์ Header / AppShell ปัจจุบันอาจแตกต่าง — ให้เช็ค `src/components/` ที่มีอยู่ก่อนเริ่มงาน

## รายละเอียดแต่ละไฟล์

### `src/lib/types/auth.ts`
- `User`: `{ id: string; email: string; name: string }`
- `AuthStatus`: `'idle' | 'loading' | 'authenticated' | 'error'`
- `AuthState`: `{ user: User | null; status: AuthStatus; error: AuthErrorCode | null }`
- `AuthErrorCode`: `'INVALID_CREDENTIALS' | 'VALIDATION_ERROR' | 'INTERNAL_ERROR' | 'UNAUTHORIZED' | 'NETWORK_ERROR'`
- `LoginPayload`: `{ email: string; password: string }`
- `ApiErrorBody`: `{ error: { code: string; message: string; fields?: Record<string, string> } }`

### `src/lib/features/auth/authSlice.ts`
- ใช้ `createSlice` จาก Redux Toolkit
- Initial state: `{ user: null, status: 'idle', error: null }`
- Reducers (sync):
  - `setUser(state, action: PayloadAction<User>)` → status `authenticated`, error `null`
  - `clearAuth(state)` → reset ทั้งหมด
  - `setError(state, action: PayloadAction<AuthErrorCode>)` → status `error`
  - `setLoading(state)` → status `loading`
- Export reducer + actions

### `src/lib/features/auth/authApi.ts`
- ฟังก์ชัน async ที่ wrap `fetch` — **ไม่ใช้ createAsyncThunk** เพื่อความง่าย (ทีมสามารถเลือกใช้ thunk ก็ได้ แต่ recommend plain async fn)
- `loginRequest({ email, password }): Promise<User>` → POST `/api/auth/login`, throw object `{ code: AuthErrorCode }` เมื่อ error
- `logoutRequest(): Promise<void>` → POST `/api/auth/logout`
- `fetchCurrentUser(): Promise<User | null>` → GET `/api/auth/me`, คืน null เมื่อ 401
- ใส่ `credentials: 'include'` ทุก call เพื่อให้ส่ง cookie
- Error mapping:
  - HTTP 401 + code `INVALID_CREDENTIALS` → throw `{ code: 'INVALID_CREDENTIALS' }`
  - HTTP 400 → throw `{ code: 'VALIDATION_ERROR' }`
  - HTTP 500 / network error → throw `{ code: 'INTERNAL_ERROR' }`

### `src/lib/store.ts`
- เพิ่ม `authReducer` ใน `combineReducers` หรือ `reducer: { auth: authReducer }`

### `src/app/login/layout.tsx`
- Minimal layout: centered container, background สี neutral, ไม่มี Sider/Header
- ใช้ design token สำหรับ spacing/color
- ถ้าจำเป็นต้อง wrap ConfigProvider ซ้ำ — ไม่ต้อง เพราะ root layout ครอบให้แล้ว

### `src/app/login/page.tsx`
- Server component minimal ที่ render `<LoginForm />`
- ใส่ `<title>เข้าสู่ระบบ — TradeMaster</title>` ผ่าน `metadata` export

### `src/app/login/_components/LoginForm.tsx` (client component)
- Layout:
  - Logo + "TradeMaster" ด้านบน
  - หัวข้อ "เข้าสู่ระบบ"
  - Ant Design `<Form>` (layout vertical)
  - Field 1: `<Form.Item label="อีเมล" name="email" rules=[...]><Input placeholder="กรุณากรอกอีเมลของคุณ" /></Form.Item>`
  - Field 2: `<Form.Item label="รหัสผ่าน" name="password" rules=[...]><Input.Password placeholder="กรุณากรอกรหัสผ่าน" iconRender={...} /></Form.Item>`
  - Submit button: `<Button type="primary" htmlType="submit" loading={status==='loading'} block>{status==='loading' ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</Button>`
  - บริเวณบนฟอร์ม (เหนือ field): Alert แสดง error เมื่อ status === 'error' (ใช้ `<Alert type="error" />`)
  - ใต้ฟอร์ม: "ยังไม่มีบัญชี? ติดต่อผู้ดูแลระบบ"
- Validation rules:
  - email: `[{ required: true, message: 'กรุณากรอกอีเมล' }, { type: 'email', message: 'รูปแบบอีเมลไม่ถูกต้อง' }]`
  - password: `[{ required: true, message: 'กรุณากรอกรหัสผ่าน' }, { min: 8, message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' }]`
- Flow ตอน submit:
  1. dispatch `setLoading()`
  2. เรียก `loginRequest({ email, password })`
  3. สำเร็จ → dispatch `setUser(user)`, แสดง `message.success('เข้าสู่ระบบสำเร็จ')`, `router.replace('/dashboard')`
  4. ล้มเหลว → dispatch `setError(code)`
- Error code → ข้อความ Thai mapping:
  - `INVALID_CREDENTIALS` → "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
  - `INTERNAL_ERROR` / `NETWORK_ERROR` → "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง"
  - `VALIDATION_ERROR` → "ข้อมูลที่กรอกไม่ถูกต้อง"
- Accessibility:
  - Alert error: `role="alert"` + `aria-live="polite"`
  - Input ทุกตัวมี `<label>` (Form.Item label ครอบให้แล้ว แต่ตรวจ DOM output)
  - ปุ่มสลับ show/hide password: `aria-label="แสดง/ซ่อนรหัสผ่าน"`
- Use hooks: `useAppDispatch`, `useAppSelector` จาก `src/lib/hooks.ts`, `useRouter` จาก `next/navigation`

### `src/components/app-shell/UserMenu.tsx`
- ใช้ Ant Design `<Dropdown>` + `<Avatar>` หรือ text ชื่อผู้ใช้
- Menu item:
  - แสดงอีเมลผู้ใช้ (disabled item)
  - Divider
  - "ออกจากระบบ" (มี icon `LogoutOutlined`)
- ตอนกด logout:
  1. เรียก `logoutRequest()` (ignore error)
  2. dispatch `clearAuth()`
  3. `router.replace('/login')`
- Read user จาก `useAppSelector(state => state.auth.user)`

### `src/app/(app)/layout.tsx` (แก้ไข)
- เพิ่ม client component child ที่ทำ hydration:
  - ตอน mount เรียก `fetchCurrentUser()` แล้ว dispatch `setUser` หรือ `clearAuth`
  - หรือทำใน `<StoreProvider>` ก็ได้
- ทางเลือกที่แนะนำ: สร้าง `<AuthBootstrapper />` client component ที่ใช้ `useEffect` เรียก `fetchCurrentUser` ครั้งเดียวตอน mount

### `src/middleware.ts`
- Import `jwtVerify` จาก `jose`
- Logic:
  ```
  const token = req.cookies.get('tm_token')?.value
  const isProtected = pathname เริ่มต้นด้วย /dashboard (หรือ list ของ app routes)
  const isLogin = pathname === '/login'

  if (token) verify ด้วย jose
    valid:
      if isLogin → redirect /dashboard
      else → next()
    invalid:
      ลบ cookie + ถ้า isProtected → redirect /login
  else:
    if isProtected → redirect /login
    else → next()
  ```
- Export `config = { matcher: ['/login', '/dashboard/:path*'] }` (เพิ่ม route ตามที่แอปมี — ปัจจุบันมีแค่ dashboard)
- JWT secret อ่านจาก `process.env.JWT_SECRET` แล้ว encode เป็น Uint8Array สำหรับ `jose`

### `.env.local.example`
- เพิ่ม `JWT_SECRET=change-me-in-production-min-32-chars`

## Design tokens ที่ใช้
- Background: `--color-bg-base`
- Card: `--color-bg-elevated` + border-radius token
- Primary button: ตาม Ant Design theme (มาจาก `antd-theme.ts`)
- Error text: `--color-error`
- Spacing: `--space-*` tokens
- ห้าม hard-code hex หรือ px ที่ไม่ผ่าน token

## Acceptance ฝั่ง FE
- [ ] กรอก email/password ถูกต้อง → ไป `/dashboard` + เห็นชื่อใน UserMenu
- [ ] กรอกผิด → เห็น Alert "อีเมลหรือรหัสผ่านไม่ถูกต้อง" บนฟอร์ม
- [ ] กรอกไม่ครบ → เห็น inline error ใต้ field
- [ ] กด Logout → cookie หาย + redirect ไป `/login`
- [ ] เข้า `/dashboard` ตรง ๆ โดยไม่ login → ถูก redirect ไป `/login`
- [ ] login แล้ว refresh → ยังอยู่หน้าเดิม + user info ยังอยู่
- [ ] Tab + Enter ทำงานครบ
- [ ] `npm run lint` ผ่าน
- [ ] `npm run build` ผ่าน
- [ ] ทุกข้อความบนหน้า login + UserMenu เป็นภาษาไทย

## Out of scope สำหรับ FE
- ไม่ทำ Sign up form
- ไม่ทำ Forgot password
- ไม่ sync state ระหว่าง tab
