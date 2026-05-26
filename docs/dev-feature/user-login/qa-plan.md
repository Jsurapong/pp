# QA Plan: User Login

ผู้รับผิดชอบ: QA
อ้างอิง: `requirement.md`, `requirement-discuss.md`, `fe-plan.md`, `be-plan.md`

## Scope ของ QA
ทดสอบ login flow ตั้งแต่ UI, validation, API integration, route protection, session persistence, accessibility, ไปจนถึง security smoke tests

## Test environment
- Browser: Chrome (latest), Safari (latest), Firefox (latest), Edge (latest)
- Device: Desktop (1440x900) + Mobile (iPhone 13 viewport)
- App URL: `http://localhost:3000`
- Demo credentials: `demo@trademaster.local` / `password123` (จาก seed)
- ตรวจสอบ build: `npm run lint` + `npm run build` ต้องผ่านก่อนเริ่มทดสอบ

## หมายเหตุเรื่อง test framework
โปรเจกต์ไม่มี automated test framework ติดตั้งไว้ — QA plan นี้เน้น **manual test cases** ที่ทำตามได้ทันที. ถ้าทีมตัดสินใจเพิ่ม Playwright/Vitest ภายหลัง ให้ใช้ test cases ในเอกสารนี้เป็น spec สำหรับเขียน automated tests

## Test categories

### 1. UI / Language
| TC | Step | Expected |
|---|---|---|
| L01 | เปิด `/login` | เห็นหัวข้อ "เข้าสู่ระบบ", logo + "TradeMaster", form กลางจอ ไม่มี Sider/Header |
| L02 | ดู label อีเมล / รหัสผ่าน | ภาษาไทยทั้งหมด "อีเมล" / "รหัสผ่าน" |
| L03 | ดู placeholder | "กรุณากรอกอีเมลของคุณ" / "กรุณากรอกรหัสผ่าน" |
| L04 | ดูปุ่ม submit | ข้อความ "เข้าสู่ระบบ" |
| L05 | ดูข้อความใต้ฟอร์ม | "ยังไม่มีบัญชี? ติดต่อผู้ดูแลระบบ" |
| L06 | ตรวจหน้าทั้งหมดด้วยตา | ไม่มีข้อความภาษาอังกฤษหลุดมาที่ผู้ใช้เห็น (ยกเว้น email value) |

### 2. Client-side validation
| TC | Step | Expected |
|---|---|---|
| V01 | เว้น email ว่าง + กด submit | error ใต้ field "กรุณากรอกอีเมล" |
| V02 | กรอก `notanemail` + กด submit | error "รูปแบบอีเมลไม่ถูกต้อง" |
| V03 | กรอก `user@` หรือ `@x.com` | error "รูปแบบอีเมลไม่ถูกต้อง" |
| V04 | กรอก email valid, เว้น password | error "กรุณากรอกรหัสผ่าน" |
| V05 | กรอก password 7 ตัว | error "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" |
| V06 | กรอก password = 8 ตัวพอดี | ไม่มี error, form submit ได้ |
| V07 | กดสลับ show/hide password | input type สลับระหว่าง password/text |
| V08 | ทุก validation response ต้องเกิด < 100ms (เชิงรู้สึก) | ไม่มี lag |

### 3. Login success flow
| TC | Step | Expected |
|---|---|---|
| S01 | กรอก demo creds + submit | ปุ่ม loading → redirect `/dashboard` |
| S02 | ระหว่าง loading | ปุ่มแสดง "กำลังเข้าสู่ระบบ..." + disabled, กดซ้ำไม่ได้ |
| S03 | หลัง redirect | เห็น dashboard + UserMenu แสดงอีเมล/ชื่อ |
| S04 | ดู DevTools → Application → Cookies | มี `tm_token` httpOnly = true |
| S05 | หลัง login เห็น `message.success` "เข้าสู่ระบบสำเร็จ" หรือ feedback อื่น | toast ปรากฏชั่วครู่ |

### 4. Login failure flow
| TC | Step | Expected |
|---|---|---|
| F01 | กรอก email ถูก + password ผิด | Alert "อีเมลหรือรหัสผ่านไม่ถูกต้อง" บนฟอร์ม, ไม่ redirect |
| F02 | กรอก email ที่ไม่มีในระบบ | Alert เดียวกัน (ไม่บอกแยกว่าผิดที่ไหน) |
| F03 | ปิด network แล้ว submit | Alert "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" |
| F04 | mock server ให้ตอบ 500 (เช่นแก้ route ชั่วคราว) | Alert "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" |
| F05 | หลังเห็น error → แก้รหัสผ่านให้ถูก แล้ว submit ใหม่ | error หาย, login สำเร็จ |
| F06 | กด submit รัว ๆ 5 ครั้ง | request ส่งครั้งเดียว (เพราะปุ่ม disabled ระหว่าง loading) |

### 5. Route protection (middleware)
| TC | Step | Expected |
|---|---|---|
| R01 | ไม่ login เปิด `/dashboard` ตรง ๆ | redirect `/login` |
| R02 | ไม่ login เปิด `/dashboard/anything` | redirect `/login` |
| R03 | login แล้วเปิด `/login` | redirect `/dashboard` |
| R04 | ลบ cookie ใน DevTools แล้ว refresh `/dashboard` | redirect `/login` |
| R05 | แก้ค่า cookie เป็น garbage แล้ว refresh `/dashboard` | redirect `/login` (token invalid) |
| R06 | login แล้ว path `/` (landing) | เปิดได้ปกติ (ไม่ถูกบล็อก) |

### 6. Logout flow
| TC | Step | Expected |
|---|---|---|
| O01 | login → คลิก UserMenu → เห็น "ออกจากระบบ" | menu item แสดงเป็นภาษาไทย |
| O02 | คลิก "ออกจากระบบ" | redirect `/login` |
| O03 | หลัง logout cookie หาย | DevTools cookies → ไม่มี `tm_token` |
| O04 | หลัง logout กด back ของ browser | ไม่ควรเข้า `/dashboard` ได้ (middleware redirect กลับมา `/login`) |
| O05 | Redux state หลัง logout | `auth.user === null`, `status === 'idle'` |

### 7. Session persistence
| TC | Step | Expected |
|---|---|---|
| P01 | login → refresh หน้า dashboard | ยังอยู่ที่ dashboard, ไม่ถูก redirect |
| P02 | login → ปิด tab → เปิดใหม่ที่ `/dashboard` | ยังเข้าได้ (cookie ยังอยู่) |
| P03 | login → เปิด tab ใหม่ที่ `/login` | redirect ไป `/dashboard` (cookie ยังอยู่) |
| P04 | (manual) ตั้ง JWT expire เป็น 10 วินาที แล้วรอหมดอายุ + refresh | redirect ไป `/login` |
| P05 | login แล้วรอ 1 ชั่วโมง (หรือ mock expire) | request `/api/auth/me` ตอบ 401 |

### 8. Accessibility
| TC | Step | Expected |
|---|---|---|
| A01 | กด Tab จาก URL bar | focus ไปที่ email → password → toggle show → submit ตามลำดับ |
| A02 | กรอก form แล้วกด Enter ที่ password field | submit ทำงาน |
| A03 | screen reader (VoiceOver / NVDA) อ่านฟอร์ม | อ่าน label "อีเมล" และ "รหัสผ่าน" ออก |
| A04 | trigger error → screen reader | ประกาศ error ผ่าน `aria-live` |
| A05 | ตรวจ contrast ของข้อความหลัก vs background ด้วย DevTools | ผ่าน WCAG AA (>= 4.5:1) |
| A06 | ตรวจ contrast ของข้อความ error | ผ่าน WCAG AA |
| A07 | ปุ่ม toggle password มี aria-label | "แสดง/ซ่อนรหัสผ่าน" |

### 9. Responsive
| TC | Step | Expected |
|---|---|---|
| D01 | viewport 375x812 (mobile) | ฟอร์มแสดงเต็มกว้าง padding พอเหมาะ, ไม่มี horizontal scroll |
| D02 | viewport 768 (tablet) | ฟอร์มยังอยู่กลางจอ |
| D03 | viewport 1440 (desktop) | card ฟอร์มไม่กว้างเกินไป (ดูเป็น card กลางจอ) |

### 10. Cross-browser
| TC | Browser | Expected |
|---|---|---|
| B01 | Chrome latest | ทุก flow ผ่าน |
| B02 | Safari latest | ทุก flow ผ่าน |
| B03 | Firefox latest | ทุก flow ผ่าน |
| B04 | Edge latest | ทุก flow ผ่าน |

### 11. Security smoke
| TC | Step | Expected |
|---|---|---|
| SC01 | DevTools → Application → Local Storage / Session Storage | ไม่มี token หรือ password เก็บไว้ |
| SC02 | Network tab ตอน login | request body มี password (ปกติ) แต่ response ไม่ส่ง password / hash กลับมา |
| SC03 | inspect cookie `tm_token` | `HttpOnly` = true, `SameSite` = Lax |
| SC04 | login fail 10 ครั้งติดต่อกัน | ตอบ 401 ทุกครั้ง (ไม่มี rate limit ใน scope นี้ — แค่ confirm behavior) |
| SC05 | ลอง XSS payload ใน email field เช่น `<script>alert(1)</script>` | ไม่ execute, ถูกเก็บเป็น string ปกติ + validation จับ format ผิด |
| SC06 | ค้น log ของ server ตอน login | ไม่เห็น password / token plain |
| SC07 | error response ตอน user ไม่มี vs password ผิด | ข้อความ + code เหมือนกันทุกประการ |

### 12. API contract (manual / curl)
ใช้ curl หรือ Postman ทดสอบโดยตรง

| TC | Request | Expected |
|---|---|---|
| API01 | POST `/api/auth/login` `{ email: "demo@...", password: "password123" }` | 200 + `{ user: {...} }` + Set-Cookie |
| API02 | POST `/api/auth/login` `{ email: "bad", password: "x" }` | 400 + `{ error: { code: "VALIDATION_ERROR", fields: {...} } }` |
| API03 | POST `/api/auth/login` `{ email: "demo@...", password: "wrong123" }` | 401 + `{ error: { code: "INVALID_CREDENTIALS" } }` |
| API04 | GET `/api/auth/me` (มี cookie valid) | 200 + `{ user }` |
| API05 | GET `/api/auth/me` (ไม่มี cookie) | 401 + `{ error: { code: "UNAUTHORIZED" } }` |
| API06 | POST `/api/auth/logout` | 200 + Set-Cookie ที่ Max-Age=0 |
| API07 | POST `/api/auth/login` ด้วย body ไม่ใช่ JSON | 400 |
| API08 | response ทุก endpoint | ไม่มี field `password` / `password_hash` หลุดออกมา |

## Regression checklist (กระทบของเดิม)
- [ ] หน้า `/` (landing) ยังเปิดได้ทั้งก่อน/หลัง login
- [ ] AppShell layout ของหน้า `(app)/dashboard` ยังแสดง Sider + Header ครบ
- [ ] Design tokens ยังถูก apply (ไม่มีสีหลุดจาก theme)
- [ ] `npm run lint` ผ่าน 0 error
- [ ] `npm run build` ผ่าน 0 error

## Exit criteria (Definition of Done)
- [ ] ทุก test case ใน section 1–11 ผ่าน หรือมี justified known issue ที่ PM/CTO sign off
- [ ] ทุก API test (section 12) ผ่าน
- [ ] Regression checklist ผ่าน
- [ ] Success criteria ทุกข้อใน `requirement.md` ได้รับการ verify

## Test data ที่ต้องเตรียม
- Seed user: `demo@trademaster.local` / `password123`
- (Optional) เพิ่ม user ที่ 2 ผ่าน seed script เพื่อทดสอบหลาย account

## Bug report template
- **Test case ID**: เช่น F02
- **Browser / Device**:
- **Step**: ขั้นตอน reproduce
- **Expected**:
- **Actual**:
- **Screenshot / Console / Network**:
- **Severity**: blocker / high / medium / low
