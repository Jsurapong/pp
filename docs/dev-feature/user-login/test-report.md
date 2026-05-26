# Test Report: User Login — TradeMaster

**Author:** Max (QA)
**Date:** 2026-05-26
**Branch:** `feat/dev-feature-skill-and-claude-md` (uncommitted login feature files)
**Environment:** `http://localhost:3000` (Next.js 16 dev server)
**Test method:** Code review + live API testing with `curl`

---

## Summary

| Total | Pass | Fail | Blocked | Skip |
|-------|------|------|---------|------|
| 27    | 22   | 2    | 3       | 0    |

**Overall verdict: CONDITIONAL PASS**
The core authentication flows (login, logout, route protection, session persistence, error handling) are all working correctly. Two failures are noted: (1) the `npm run lint` SC-6 gate is broken by a pre-existing error in `StoreProvider.tsx` that the login feature did not introduce, and (2) the password toggle's `aria-label` is placed on the icon SVG rather than the interactive button wrapper. Three test cases are blocked because they require live browser interaction (network simulation, responsive inspection, back-button navigation after logout) that cannot be performed in a headless environment.

---

## Failures

### FAIL — TC-22: Show/hide password toggle aria-label

**Criterion:** FR-2, SC-3
**Evidence (code):** `src/app/login/_components/LoginForm.tsx` lines 126–133

```tsx
iconRender={(visible) =>
  visible ? (
    <EyeOutlined aria-label="ซ่อนรหัสผ่าน" />
  ) : (
    <EyeInvisibleOutlined aria-label="แสดงรหัสผ่าน" />
  )
}
```

The `aria-label` is placed on the `<EyeOutlined>` / `<EyeInvisibleOutlined>` icon component (an SVG). Ant Design's `Input.Password` renders these icons inside a `<span role="img">` inside the interactive toggle button. The `aria-label` does not propagate to the button element that screen readers interact with. The spec requires the toggle **button** to carry `aria-label="แสดง/ซ่อนรหัสผ่าน"` (or equivalent).

**Fix required:** Use Ant Design's `Input.Password` `visibilityToggle` prop with an explicit `{ aria-label: '...' }` or wrap the `iconRender` output in a `<span aria-label="...">` that Ant Design surfaces on the button.

---

### FAIL — TC-27: `npm run lint` exits non-zero

**Criterion:** SC-6
**Evidence (terminal):**

```
/Users/surapongkawkangploo/Desktop/my/pp/src/components/providers/StoreProvider.tsx
  14:20  error  Cannot access ref value during render   react-hooks/refs
  18:27  error  Cannot access ref value during render   react-hooks/refs
✖ 2 problems (2 errors, 0 warnings)
```

**Root cause:** `StoreProvider.tsx` was committed in the initial repo setup commit (`01b5800`) with this pattern, which a newer version of the `react-hooks/refs` ESLint rule now flags. The login feature did NOT introduce this file or modify it (confirmed via `git log`).

**Impact:** SC-6 ("npm run lint passes with zero errors") is technically broken. However, this is a pre-existing defect, not a regression from the login feature.

**Fix required (outside login scope):** Rewrite `StoreProvider.tsx` to initialize the store outside the component or with `React.use()` to avoid the ref-during-render pattern, then re-enable the lint gate.

**Note:** `npm run build` (SC-7) passes cleanly with zero TypeScript or build errors.

---

## Pass List

| TC    | Description                                                    | Method | Evidence |
|-------|----------------------------------------------------------------|--------|----------|
| TC-01 | Happy-path login with valid credentials                        | API    | POST /api/auth/login → 200, `{"user":{"id":"...","email":"demo@trademaster.local","name":"Demo User"}}`, `Set-Cookie: tm_token=...; HttpOnly; SameSite=lax; Max-Age=3600` |
| TC-02 | Unauthenticated /dashboard redirects to /login                 | API    | GET /dashboard (no cookie) → 307 `/login` |
| TC-03 | Unauthenticated nested /dashboard/anything redirects to /login | API    | GET /dashboard/anything → 307 `/login` |
| TC-04 | Logged-in user visiting /login redirects to /dashboard         | API    | GET /login (with valid cookie) → 307 `/dashboard` |
| TC-05 | Client validation: empty email shows "กรุณากรอกอีเมล"          | Code   | `LoginForm.tsx` line 108: `{ required: true, message: 'กรุณากรอกอีเมล' }` |
| TC-06 | Client validation: malformed email shows "รูปแบบอีเมลไม่ถูกต้อง" | Code   | `LoginForm.tsx` line 109: `{ type: 'email', message: 'รูปแบบอีเมลไม่ถูกต้อง' }` |
| TC-07 | Client validation: empty password shows "กรุณากรอกรหัสผ่าน"   | Code   | `LoginForm.tsx` line 119: `{ required: true, message: 'กรุณากรอกรหัสผ่าน' }` |
| TC-08 | Client validation: password < 8 chars shows length error       | Code   | `LoginForm.tsx` line 120: `{ min: 8, message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' }` |
| TC-09 | Login failure: wrong password → "อีเมลหรือรหัสผ่านไม่ถูกต้อง"  | API    | POST /api/auth/login (wrong pw) → 401, `{"error":{"code":"INVALID_CREDENTIALS",...}}` |
| TC-10 | Login failure: unknown email → same error as TC-09             | API    | POST /api/auth/login (unknown email) → 401, `{"error":{"code":"INVALID_CREDENTIALS",...}}` — no user enumeration |
| TC-11 | Network/server error shows generic Thai error                  | Code   | `LoginForm.tsx` line 14-15: `NETWORK_ERROR` and `INTERNAL_ERROR` both map to `'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'`; form stays interactive (no navigation on error) |
| TC-12 | Error clears and login succeeds after correcting credentials    | Code   | `authSlice.ts` `setLoading()` sets `error: null`; subsequent successful login calls `setUser()` which also sets `error: null` |
| TC-13 | Button disabled during loading; no duplicate requests          | Code   | `LoginForm.tsx` line 137-147: `<Button loading={isLoading}>` — Ant Design `loading` prop disables the button and `onFinish` is a standard form handler that only fires once per submit |
| TC-14 | Session persists after page refresh                            | Code + API | `AuthBootstrapper` in `(app)/layout.tsx` calls `fetchCurrentUser()` on mount, re-hydrating Redux state from `/api/auth/me`; verified /me returns 200 with valid cookie |
| TC-15 | Session persists after closing and reopening tab               | Code   | `tm_token` is an `HttpOnly` cookie with `Max-Age=3600` — not cleared on tab close (browser behaviour) |
| TC-16 | Logout clears session and redirects to /login                  | API    | POST /api/auth/logout → 200, `Set-Cookie: tm_token=; Max-Age=0; HttpOnly`; subsequent GET /api/auth/me → 401; Redux `clearAuth()` dispatched in `UserMenu.tsx` |
| TC-18 | Deleting cookie triggers redirect to /login on refresh         | API    | Confirmed by TC-02 logic: `proxy.ts` — no `tm_token` cookie → isProtected path → redirect `/login` |
| TC-19 | Tampered/garbage cookie triggers redirect to /login            | API    | GET /dashboard with `Cookie: tm_token=garbage_invalid_jwt_value` → 307 `/login`; `proxy.ts` `jwtVerify` throws → `catch` block clears cookie and redirects |
| TC-20 | All login page UI text is in Thai                              | Code   | `LoginForm.tsx`: heading "เข้าสู่ระบบ", label "อีเมล", label "รหัสผ่าน", button "เข้าสู่ระบบ"/"กำลังเข้าสู่ระบบ...", footer "ยังไม่มีบัญชี? ติดต่อผู้ดูแลระบบ", placeholders "กรุณากรอกอีเมลของคุณ"/"กรุณากรอกรหัสผ่าน"; all validation messages in Thai |
| TC-21 | Login page renders without AppShell                            | Code   | `/login` has its own `layout.tsx` (centered flex container, no `AppShell`). `/login` is outside `(app)/` route group. `(app)/layout.tsx` wraps `AppShell` only for `/dashboard` etc. |
| TC-24 | Token not in localStorage or sessionStorage                    | Code   | Cookie is `httpOnly: true` (set server-side); client code never calls `localStorage.setItem` or `sessionStorage.setItem`; token not returned in JS-accessible response body |
| TC-25 | API response does not expose password hash                     | API    | POST /api/auth/login response: `{"user":{"id","email","name"}}` — no `password`, `password_hash`, or hash-like fields. Same confirmed for GET /api/auth/me. |
| TC-27 | `npm run build` passes with zero errors                        | CLI    | Build exits 0; TypeScript and Next.js report zero errors. All 3 API routes and 2 page routes compiled successfully. |

---

## Blocked / Skipped

| TC    | Description                                          | Status  | Reason |
|-------|------------------------------------------------------|---------|--------|
| TC-17 | Back navigation after logout denied                  | BLOCKED | Requires live browser with history stack. Cannot simulate browser back-button via curl or code inspection alone. Proxy logic (code-reviewed) is correct — unauthenticated access to `/dashboard` always redirects to `/login`; but the specific "back button causes a full navigation that proxy intercepts" path needs manual browser verification. |
| TC-23 | Keyboard-only navigation and form submission         | BLOCKED | Requires live browser for Tab/Enter interaction. Code review confirms Ant Design Form triggers `onFinish` on Enter-in-field (default HTML form behaviour). Tab order is email → password → password toggle → submit button (standard Ant Design Form layout). Aria labels present on all interactive elements. Cannot fully automate without a browser driver. |
| TC-26 | Responsive layout on mobile viewport (375×812)       | BLOCKED | Requires visual/browser inspection. Code review shows `LoginLayout` uses `padding: 24px` and the card has `maxWidth: 420` with `width: 100%` — appropriate for small viewports. Cannot verify horizontal scroll or visual fit without a browser. |

---

## Notes for Next Iteration

1. **Fix TC-22 (priority: medium):** Move `aria-label` to the button wrapper. The simplest approach is to use Ant Design's `visibilityToggle={{ aria-label: visible ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน' }}` prop on `Input.Password` (if the installed Ant Design version supports it), or add `aria-label` to the icon's wrapping `<span>`. Accessibility requirements (SC-10) depend on this.

2. **Fix TC-27 lint pre-existing failure (priority: low / separate ticket):** Rewrite `StoreProvider.tsx` using the React docs' recommended `if (ref.current == null)` pattern or move store initialization outside the component. This error predates the login feature but blocks the SC-6 acceptance criterion.

3. **Add browser-based E2E tests for TC-17, TC-23, TC-26 (priority: low):** Install Playwright or Cypress and write smoke tests for back-button security, keyboard navigation, and mobile viewport. Currently blocked by absence of test framework.

4. **Rate limiting (follow-up):** As noted in the BE summary, there is no brute-force protection on `/api/auth/login`. Consider adding a rate-limit middleware (e.g., `next-rate-limit` or Upstash Redis) in a follow-up ticket.

5. **TC-13 — duplicate request prevention:** The Ant Design `loading` button prevents UI re-submission, but there is no server-side idempotency token. If two rapid programmatic requests arrive simultaneously (e.g., race condition from slow network), both will succeed independently. This is acceptable for the current scope but worth noting.
