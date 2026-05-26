# QA Test Cases: User Login — TradeMaster

Phase A — Design only. Do NOT execute.

- Author: Max (QA)
- Reference: `requirement.md`, `qa-plan.md`
- Environment: `http://localhost:3000` · Demo: `demo@trademaster.local` / `password123`
- Framework: Manual (no automated test runner configured)

---

## TC-01 · Happy-path login with valid credentials

**Type:** happy-path
**Maps to requirement:** Success Criterion 1 (SC-1), FR-10

**Preconditions:**
- App is running at `http://localhost:3000`
- Seed user `demo@trademaster.local` / `password123` exists in SQLite DB
- User is NOT currently logged in (no `tm_token` cookie present)
- Browser: Chrome latest, DevTools open on Application → Cookies tab

**Steps:**
1. Navigate to `http://localhost:3000/login`.
2. In the "อีเมล" field, type `demo@trademaster.local`.
3. In the "รหัสผ่าน" field, type `password123`.
4. Click the "เข้าสู่ระบบ" button.
5. Observe the button state while the request is in flight.
6. Wait for navigation to complete.
7. Check the current URL.
8. Check DevTools → Application → Cookies for the domain.

**Expected result:**
- Step 5: Button shows "กำลังเข้าสู่ระบบ..." and is disabled; a loading spinner is visible.
- Step 6: A success toast/message "เข้าสู่ระบบสำเร็จ" (or equivalent Thai text) appears briefly.
- Step 7: URL is `http://localhost:3000/dashboard`.
- Step 8: Cookie `tm_token` exists with `HttpOnly = true`.
- The page shows the Dashboard content with AppShell (Sider + Header) and the UserMenu displays the logged-in user's email or name.

---

## TC-02 · Redirect to /login when unauthenticated user accesses /dashboard

**Type:** happy-path (route-protection)
**Maps to requirement:** SC-2, FR-12

**Preconditions:**
- App is running at `http://localhost:3000`
- User is NOT logged in; no `tm_token` cookie exists (clear cookies if needed)

**Steps:**
1. Open a fresh browser session (or clear all cookies for `localhost`).
2. Navigate directly to `http://localhost:3000/dashboard`.
3. Observe the resulting URL and page content.

**Expected result:**
- Browser is immediately redirected to `http://localhost:3000/login`.
- The Login page is shown (Thai heading "เข้าสู่ระบบ", no AppShell/Sider).
- No dashboard content is visible, even briefly (no flash-of-content).

---

## TC-03 · Unauthenticated access to nested (app)/ path redirects to /login

**Type:** edge-case (route-protection)
**Maps to requirement:** SC-2, FR-12

**Preconditions:**
- App is running.
- User is NOT logged in.

**Steps:**
1. With no `tm_token` cookie, navigate to `http://localhost:3000/dashboard/anything`.
2. Observe resulting URL.

**Expected result:**
- Browser is redirected to `http://localhost:3000/login`.
- Login page renders with full Thai UI; no app shell content visible.

---

## TC-04 · Already-logged-in user visiting /login is redirected to /dashboard

**Type:** edge-case (route-protection)
**Maps to requirement:** SC-2, FR-11

**Preconditions:**
- User is already logged in (valid `tm_token` cookie present, obtained via TC-01).

**Steps:**
1. Navigate to `http://localhost:3000/login`.
2. Observe the resulting URL.

**Expected result:**
- Browser is redirected to `http://localhost:3000/dashboard` without rendering the login form.

---

## TC-05 · Client-side validation: empty email field

**Type:** error-case
**Maps to requirement:** SC-4, FR-3

**Preconditions:**
- User is on `http://localhost:3000/login`.
- Both fields are empty.

**Steps:**
1. Leave both "อีเมล" and "รหัสผ่าน" fields empty.
2. Click "เข้าสู่ระบบ".
3. Observe inline validation message below the email field.

**Expected result:**
- An inline error message reading exactly "กรุณากรอกอีเมล" appears beneath the email input.
- The message appears within 100 ms of clicking (no perceptible delay).
- No HTTP request is sent (verify in Network tab: no request to `/api/auth/login`).

---

## TC-06 · Client-side validation: malformed email format

**Type:** error-case
**Maps to requirement:** SC-4, FR-4

**Preconditions:**
- User is on `/login`.

**Steps:**
1. In the "อีเมล" field, type `notanemail` (no @ symbol).
2. In the "รหัสผ่าน" field, type `password123`.
3. Click "เข้าสู่ระบบ".
4. Repeat steps 1–3 with value `user@` (missing domain).
5. Repeat steps 1–3 with value `@x.com` (missing local part).

**Expected result:**
- For each malformed value, the error "รูปแบบอีเมลไม่ถูกต้อง" appears below the email field.
- No HTTP request is sent in any iteration.

---

## TC-07 · Client-side validation: empty password field

**Type:** error-case
**Maps to requirement:** SC-4, FR-5

**Preconditions:**
- User is on `/login`.

**Steps:**
1. In the "อีเมล" field, type `demo@trademaster.local`.
2. Leave the "รหัสผ่าน" field empty.
3. Click "เข้าสู่ระบบ".

**Expected result:**
- Error message "กรุณากรอกรหัสผ่าน" appears beneath the password field.
- No HTTP request is sent.

---

## TC-08 · Client-side validation: password shorter than 8 characters

**Type:** error-case
**Maps to requirement:** SC-4, FR-6

**Preconditions:**
- User is on `/login`.

**Steps:**
1. In the "อีเมล" field, type `demo@trademaster.local`.
2. In the "รหัสผ่าน" field, type `short7` (7 characters).
3. Click "เข้าสู่ระบบ".
4. Clear the password field and type exactly 8 characters (e.g., `exactly8`).
5. Click "เข้าสู่ระบบ" again.

**Expected result:**
- Step 3: Error "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" appears.
- Step 5: No password length error; form proceeds to send the request (or shows credential error if wrong).

---

## TC-09 · Login failure: incorrect password for existing user

**Type:** error-case
**Maps to requirement:** SC-8 (QA test-all-flows), FR-8

**Preconditions:**
- User is on `/login`.
- Seed user `demo@trademaster.local` exists.

**Steps:**
1. In "อีเมล" type `demo@trademaster.local`.
2. In "รหัสผ่าน" type `wrongpassword`.
3. Click "เข้าสู่ระบบ".
4. Observe page state after response.

**Expected result:**
- An error alert/banner appears **at the top of the form** with the message "อีเมลหรือรหัสผ่านไม่ถูกต้อง".
- The URL remains `/login`; no redirect occurs.
- The password field is cleared (or remains, but no sensitive value is persisted in DOM).
- The message does NOT say "รหัสผ่านผิด" or "อีเมลผิด" separately (no user-enumeration).

---

## TC-10 · Login failure: email not registered in system

**Type:** error-case
**Maps to requirement:** SC-8, FR-8 (non-functional: no user enumeration)

**Preconditions:**
- User is on `/login`.
- Email `nobody@nowhere.com` does not exist in the database.

**Steps:**
1. In "อีเมล" type `nobody@nowhere.com`.
2. In "รหัสผ่าน" type `password123`.
3. Click "เข้าสู่ระบบ".

**Expected result:**
- Error message is identical to TC-09: "อีเมลหรือรหัสผ่านไม่ถูกต้อง".
- HTTP response code observed in Network tab is 401.
- Response body JSON field `error.code` is `"INVALID_CREDENTIALS"` (same as wrong password).

---

## TC-11 · Login failure: network / server error shows generic error message

**Type:** error-case
**Maps to requirement:** SC-8, FR-9

**Preconditions:**
- User is on `/login`.
- DevTools → Network tab is open.

**Steps:**
1. In DevTools Network tab, enable "Offline" mode (or block the `/api/auth/login` request via Request Blocking).
2. In "อีเมล" type `demo@trademaster.local`.
3. In "รหัสผ่าน" type `password123`.
4. Click "เข้าสู่ระบบ".
5. Restore network, then simulate a 500 response by temporarily editing the API route to return `500` (or mock via DevTools → Overrides).
6. Click "เข้าสู่ระบบ" again.

**Expected result:**
- Both Step 4 and Step 6: An error message "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" is displayed.
- No redirect occurs.
- The form remains interactive so the user can try again.

---

## TC-12 · Error clears and login succeeds after correcting credentials

**Type:** happy-path
**Maps to requirement:** SC-8, FR-8

**Preconditions:**
- User is on `/login`.

**Steps:**
1. Type `demo@trademaster.local` and password `wrongpassword`; click "เข้าสู่ระบบ".
2. Confirm error "อีเมลหรือรหัสผ่านไม่ถูกต้อง" is visible.
3. Clear the password field and type `password123`.
4. Click "เข้าสู่ระบบ" again.

**Expected result:**
- After Step 4, the error alert disappears before or during the loading state.
- User is redirected to `/dashboard`.

---

## TC-13 · Submit button disabled during loading; rapid clicks do not duplicate requests

**Type:** edge-case
**Maps to requirement:** SC-8, FR-7

**Preconditions:**
- User is on `/login`, DevTools → Network tab open.

**Steps:**
1. Fill in valid credentials (`demo@trademaster.local` / `password123`).
2. Click "เข้าสู่ระบบ" and immediately click the button 4 more times in rapid succession.
3. Observe the Network tab for `/api/auth/login` requests.
4. Observe the button state during the flight.

**Expected result:**
- Exactly **one** request to `/api/auth/login` appears in the Network tab.
- The button is disabled (greyed out / cursor not-allowed) and shows "กำลังเข้าสู่ระบบ..." after the first click.
- User is redirected to `/dashboard` after the single request resolves.

---

## TC-14 · Session persists after page refresh

**Type:** happy-path (session)
**Maps to requirement:** SC-5, FR-15

**Preconditions:**
- User is logged in and currently on `/dashboard`.
- `tm_token` cookie is present.

**Steps:**
1. Press F5 (or Cmd+R on macOS) to refresh the `/dashboard` page.
2. Wait for the page to fully load.
3. Observe the URL and page content.

**Expected result:**
- URL remains `http://localhost:3000/dashboard`.
- User is NOT redirected to `/login`.
- Dashboard content, AppShell, and UserMenu (with user info) are all visible.
- Redux state: `auth.user` is populated (verify via Redux DevTools or React DevTools).

---

## TC-15 · Session persists after closing and reopening a new tab

**Type:** happy-path (session)
**Maps to requirement:** SC-5, FR-15

**Preconditions:**
- User is logged in and `tm_token` cookie is present.

**Steps:**
1. Close the browser tab while on `/dashboard`.
2. Open a new tab and navigate to `http://localhost:3000/dashboard`.
3. Observe the URL and page content.

**Expected result:**
- URL stays at `/dashboard`; page loads with authenticated content.
- `tm_token` cookie is still present (httpOnly cookie was not cleared by tab close).

---

## TC-16 · Logout clears session and redirects to /login

**Type:** happy-path (logout)
**Maps to requirement:** SC-5, SC-8, FR-14

**Preconditions:**
- User is logged in on `/dashboard`.
- DevTools → Application → Cookies is open.

**Steps:**
1. Locate the UserMenu in the Header (top-right area).
2. Click the UserMenu to open the dropdown.
3. Verify the menu item "ออกจากระบบ" is visible and in Thai.
4. Click "ออกจากระบบ".
5. Observe the URL after the action.
6. Check DevTools → Cookies for `tm_token`.

**Expected result:**
- Step 3: Menu item reads "ออกจากระบบ" (Thai).
- Step 5: Browser is redirected to `http://localhost:3000/login`.
- Step 6: `tm_token` cookie is absent (removed or Max-Age=0).
- Redux state: `auth.user === null` and `auth.status === 'idle'` (verify via Redux DevTools).

---

## TC-17 · Back navigation after logout does not grant access to /dashboard

**Type:** edge-case (security)
**Maps to requirement:** SC-2, SC-5, FR-12, FR-14

**Preconditions:**
- User has just completed TC-16 and is now on `/login`.

**Steps:**
1. Press the browser Back button.
2. Observe the resulting URL and page content.

**Expected result:**
- Browser attempts to navigate to `/dashboard` but the middleware intercepts.
- User is immediately redirected back to `/login`.
- No dashboard content is visible.

---

## TC-18 · Deleting the cookie manually triggers redirect to /login on refresh

**Type:** edge-case (security)
**Maps to requirement:** SC-2, SC-5, FR-12

**Preconditions:**
- User is logged in and on `/dashboard`.
- DevTools → Application → Cookies is open.

**Steps:**
1. In DevTools, right-click the `tm_token` cookie and choose "Delete" (or select and press Delete key).
2. Press F5 to refresh the page.
3. Observe resulting URL.

**Expected result:**
- After refresh, middleware detects the absence of `tm_token` and redirects to `/login`.
- Login page is shown; no dashboard content is rendered.

---

## TC-19 · Tampered/garbage cookie value triggers redirect to /login

**Type:** edge-case (security)
**Maps to requirement:** SC-2, FR-12

**Preconditions:**
- User is logged in. `tm_token` cookie is present.
- Note: Because `tm_token` is `HttpOnly`, it cannot be directly edited via JS or DevTools Application panel. Use DevTools → Application panel which allows editing cookie values in some browsers, or use a proxy (Charles/Burp) to intercept and modify the request cookie header.

**Steps:**
1. Modify the `tm_token` cookie value to `garbage_invalid_jwt_value` using DevTools (if editable) or proxy.
2. Navigate to `http://localhost:3000/dashboard`.
3. Observe the URL.

**Expected result:**
- Middleware rejects the invalid JWT.
- Browser is redirected to `http://localhost:3000/login`.
- No dashboard content is accessible.

---

## TC-20 · All login page UI text is in Thai (language audit)

**Type:** cross-cutting
**Maps to requirement:** SC-3, FR-16

**Preconditions:**
- User is NOT logged in.
- Browser viewport is 1440 × 900 (desktop).

**Steps:**
1. Navigate to `http://localhost:3000/login`.
2. Read every visible text element: page title/heading, form labels, placeholders, button text, footer note.
3. Trigger all validation errors (empty submit, bad email, short password) and read error messages.
4. Look for any English text visible to the user.

**Expected result:**
- Heading: "เข้าสู่ระบบ"
- Logo/app name area shows: "TradeMaster" (brand name, acceptable in Latin script)
- Email label: "อีเมล", placeholder: "กรุณากรอกอีเมลของคุณ"
- Password label: "รหัสผ่าน", placeholder: "กรุณากรอกรหัสผ่าน"
- Submit button: "เข้าสู่ระบบ"
- Footer note: "ยังไม่มีบัญชี? ติดต่อผู้ดูแลระบบ"
- Validation errors: "กรุณากรอกอีเมล", "รูปแบบอีเมลไม่ถูกต้อง", "กรุณากรอกรหัสผ่าน", "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"
- No English error labels, field names, or button text appear to the end user.

---

## TC-21 · Login page renders without AppShell (no Sider or Header)

**Type:** cross-cutting
**Maps to requirement:** SC-3, UX notes (centered card, outside (app)/ group)

**Preconditions:**
- User is NOT logged in. Navigate to `/login`.

**Steps:**
1. Inspect the page layout visually.
2. Check if a sidebar (Sider/nav drawer) is present.
3. Check if a top Header/Navbar (with UserMenu, logout) is present.
4. Check that the form card is centered on the page.

**Expected result:**
- No Sider or side navigation panel is visible.
- No application Header with UserMenu is present.
- The login form card is horizontally and vertically centered.
- The TradeMaster logo/name is displayed above the form.

---

## TC-22 · Show/hide password toggle works correctly

**Type:** happy-path
**Maps to requirement:** FR-2, SC-3

**Preconditions:**
- User is on `/login`.

**Steps:**
1. In the password field, type `mypassword`.
2. Confirm the field type is `password` (characters masked with dots/asterisks).
3. Click the show/hide toggle icon inside the password field.
4. Observe the input type.
5. Click the toggle again.
6. Observe the input type again.
7. Check the toggle button/icon for an `aria-label` attribute.

**Expected result:**
- Step 2: Characters are masked.
- Step 4: `input[type="text"]` — characters are visible as plain text.
- Step 6: `input[type="password"]` — characters are masked again.
- Step 7: `aria-label` attribute on the toggle button contains "แสดง" or "ซ่อน" (e.g., "แสดง/ซ่อนรหัสผ่าน").

---

## TC-23 · Keyboard-only navigation and form submission

**Type:** cross-cutting (accessibility)
**Maps to requirement:** SC-10, Non-functional accessibility requirements

**Preconditions:**
- User is on `/login`. No fields are filled.

**Steps:**
1. Click anywhere neutral on the page to reset focus, then press Tab.
2. Verify focus moves to the email field.
3. Type `demo@trademaster.local`.
4. Press Tab; verify focus moves to the password field.
5. Type `password123`.
6. Press Tab; verify focus moves to the show/hide toggle button.
7. Press Tab again; verify focus moves to the "เข้าสู่ระบบ" submit button.
8. While focus is on the password field (go back with Shift+Tab), press Enter.
9. Observe whether the form submits.

**Expected result:**
- Tab order is: email → password → password toggle → submit button.
- Step 8: Pressing Enter in the password field submits the form (login initiates).
- Focus is never lost or trapped in an unexpected element.
- No step requires a mouse click.

---

## TC-24 · Token and password not stored in localStorage or sessionStorage

**Type:** cross-cutting (security)
**Maps to requirement:** Security non-functional requirements

**Preconditions:**
- DevTools open on Application tab.

**Steps:**
1. On `/login`, type credentials and click "เข้าสู่ระบบ".
2. After redirect to `/dashboard`, open DevTools → Application → Local Storage → `http://localhost:3000`.
3. Inspect all keys and values.
4. Open Session Storage and repeat inspection.
5. Search for strings like `token`, `jwt`, `password`, `tm_token`.

**Expected result:**
- No token, JWT string, or password appears in Local Storage or Session Storage.
- `tm_token` exists only in Cookies (with `HttpOnly = true`), not in accessible storage.

---

## TC-25 · API response does not expose password hash

**Type:** cross-cutting (security)
**Maps to requirement:** Security non-functional requirements, API contract

**Preconditions:**
- DevTools → Network tab open. Filters set to show XHR/Fetch.

**Steps:**
1. On `/login`, submit valid credentials (`demo@trademaster.local` / `password123`).
2. In the Network tab, locate the POST request to `/api/auth/login`.
3. Click on the request and inspect the Response body (JSON).
4. Also locate any GET `/api/auth/me` request and inspect its response.

**Expected result:**
- POST `/api/auth/login` response JSON: contains `user` object but does NOT include `password`, `password_hash`, `passwordHash`, or any hash-like field.
- GET `/api/auth/me` response JSON: same — no password fields.
- HTTP status of successful login: `200`.

---

## TC-26 · Responsive layout on mobile viewport (375×812)

**Type:** cross-cutting
**Maps to requirement:** Non-functional compatibility (responsive design)

**Preconditions:**
- DevTools → Device Toolbar active, device set to "iPhone 13" or viewport 375 × 812.

**Steps:**
1. Navigate to `http://localhost:3000/login`.
2. Inspect for horizontal scroll (scroll page horizontally).
3. Confirm the form is fully visible without scrolling horizontally.
4. Check that padding/margins around the form card are proportional.
5. Navigate to `http://localhost:3000/login` on a real iPhone (if available).

**Expected result:**
- No horizontal scroll bar or overflow.
- Form fields and button are full-width or appropriately padded within the viewport.
- All text is legible without zooming.
- The centered card layout adapts to full-width on mobile.

---

## TC-27 · npm run lint and npm run build pass with zero errors

**Type:** cross-cutting
**Maps to requirement:** SC-6, SC-7

**Preconditions:**
- All feature code is merged into the working branch.
- Node modules are installed.

**Steps:**
1. In the project root, run `npm run lint`.
2. Record any errors or warnings.
3. Run `npm run build`.
4. Record any TypeScript or build errors.

**Expected result:**
- `npm run lint` exits with code 0; output contains zero ESLint errors (warnings may be present but zero errors).
- `npm run build` exits with code 0; no TypeScript compile errors; no Next.js build errors.

---

## Coverage matrix

| Success Criterion | Covered by |
|---|---|
| SC-1: Valid login → redirect to /dashboard | TC-01 |
| SC-2: Unauthenticated blocked from (app)/ | TC-02, TC-03, TC-04, TC-17, TC-18, TC-19 |
| SC-3: All UI text in Thai | TC-20, TC-21 |
| SC-4: Form validation per FR 3–6 | TC-05, TC-06, TC-07, TC-08 |
| SC-5: Session persists after refresh; clears on logout | TC-14, TC-15, TC-16 |
| SC-6: npm run lint passes | TC-27 |
| SC-7: npm run build passes | TC-27 |
| SC-8: QA can test all flows | TC-09, TC-10, TC-11, TC-12, TC-13 |
| SC-9: Design tokens applied, no hard-coded values | TC-21 (visual), part of TC-20 |
| SC-10: Full keyboard accessibility | TC-23 |
| Security (httpOnly cookie, no token in storage) | TC-01 (cookie), TC-24, TC-25 |
| Show/hide toggle + aria-label | TC-22 |
| Responsive mobile layout | TC-26 |
