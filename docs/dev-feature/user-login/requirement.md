# Requirement: ระบบเข้าสู่ระบบ (User Login)

## Summary
สร้างระบบ Login สำหรับแอป TradeMaster เพื่อให้ผู้ใช้งานสามารถยืนยันตัวตนก่อนเข้าถึงหน้าจอที่อยู่ภายใต้ route group `(app)/` ได้ โดย UI ทั้งหมดต้องเป็นภาษาไทย

## User story
ในฐานะ**นักลงทุน/ผู้ใช้งานแพลตฟอร์ม TradeMaster** ฉันต้องการ**เข้าสู่ระบบด้วยอีเมลและรหัสผ่าน** เพื่อที่ฉันจะสามารถ**เข้าถึงหน้า Dashboard และข้อมูล Portfolio ส่วนตัวของฉันได้อย่างปลอดภัย**

## Scope

### In scope
- หน้า Login ที่ `/login` พร้อมฟอร์มกรอกอีเมลและรหัสผ่าน
- การตรวจสอบความถูกต้องของข้อมูลที่กรอก (form validation) ทั้งฝั่ง client
- ปุ่ม "เข้าสู่ระบบ" และฟังก์ชันส่งข้อมูลไปยัง API authentication
- การจัดการ session/token ของผู้ใช้ผ่าน Redux Toolkit และ persistent storage (เช่น cookie หรือ localStorage)
- Middleware หรือ guard สำหรับ route group `(app)/` เพื่อ redirect ผู้ใช้ที่ยังไม่ได้ login ไปยังหน้า `/login`
- การ redirect ผู้ใช้ที่ login สำเร็จไปยังหน้า `/dashboard`
- การแสดงข้อความ error เมื่อ login ไม่สำเร็จ (เช่น อีเมล/รหัสผ่านผิด, server error)
- ปุ่ม "ออกจากระบบ" (Logout) ใน Header ของ AppShell เพื่อล้าง session
- การแสดงสถานะ loading ขณะกำลังตรวจสอบข้อมูลกับ server
- UI ทุกส่วนของฟีเจอร์นี้ต้องเป็นภาษาไทย (label, placeholder, ข้อความ error, ปุ่ม, ข้อความแจ้งเตือน)

### Out of scope
- ระบบสมัครสมาชิก (Sign up / Registration)
- ระบบ "ลืมรหัสผ่าน" (Forgot password / Password reset)
- ระบบ Social login (Google, Facebook, Apple, ฯลฯ)
- ระบบ Two-factor authentication (2FA / OTP)
- ระบบ "Remember me" แบบขยาย session ยาว ๆ (จะใช้ default session policy แทน)
- การจัดการสิทธิ์แบบ Role-based access control (RBAC) ภายในแอป
- หน้าโปรไฟล์/แก้ไขข้อมูลผู้ใช้
- การแปลภาษาส่วนอื่นของแอปที่ไม่เกี่ยวกับ login (ฟีเจอร์นี้โฟกัสที่ login flow ก่อน)
- การสร้าง backend API จริง (ฟีเจอร์นี้จะใช้ mock API หรือ stub endpoint ก่อน เว้นแต่จะมีระบุเพิ่มเติม)

## Functional requirements

1. ผู้ใช้สามารถเข้าถึงหน้า Login ได้ที่ path `/login` โดยไม่ต้องผ่านการ authenticate
2. หน้า Login ต้องแสดง field ดังนี้: ช่องกรอก "อีเมล", ช่องกรอก "รหัสผ่าน" (พร้อมปุ่มสลับแสดง/ซ่อนรหัสผ่าน), และปุ่ม "เข้าสู่ระบบ"
3. เมื่อผู้ใช้กดปุ่ม "เข้าสู่ระบบ" โดยไม่กรอกอีเมล ระบบต้องแสดงข้อความ "กรุณากรอกอีเมล" ใต้ช่องอีเมล
4. เมื่อผู้ใช้กรอกอีเมลในรูปแบบที่ไม่ถูกต้อง (เช่น ไม่มี `@` หรือ domain) ระบบต้องแสดงข้อความ "รูปแบบอีเมลไม่ถูกต้อง"
5. เมื่อผู้ใช้กดปุ่ม "เข้าสู่ระบบ" โดยไม่กรอกรหัสผ่าน ระบบต้องแสดงข้อความ "กรุณากรอกรหัสผ่าน" ใต้ช่องรหัสผ่าน
6. เมื่อผู้ใช้กรอกรหัสผ่านน้อยกว่า 8 ตัวอักษร ระบบต้องแสดงข้อความ "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"
7. ขณะที่ระบบกำลังส่งข้อมูลไปยัง server ปุ่ม "เข้าสู่ระบบ" ต้องอยู่ในสถานะ loading และไม่สามารถกดซ้ำได้
8. เมื่อ server ตอบกลับว่า credentials ไม่ถูกต้อง ระบบต้องแสดงข้อความ "อีเมลหรือรหัสผ่านไม่ถูกต้อง" บริเวณด้านบนของฟอร์ม
9. เมื่อ server ตอบกลับด้วย error อื่น ๆ (เช่น 500, network error) ระบบต้องแสดงข้อความ "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง"
10. เมื่อ login สำเร็จ ระบบต้องเก็บ token/session ลงใน storage และ Redux store แล้ว redirect ผู้ใช้ไปที่ `/dashboard`
11. หากผู้ใช้ที่ login แล้วพยายามเข้าหน้า `/login` ระบบต้อง redirect ไปที่ `/dashboard` โดยอัตโนมัติ
12. หากผู้ใช้ที่ยังไม่ได้ login พยายามเข้า path ใด ๆ ภายใต้ `(app)/` ระบบต้อง redirect ไปที่ `/login`
13. Header ของ AppShell ต้องมีปุ่ม "ออกจากระบบ" (อาจอยู่ใน dropdown menu ของชื่อผู้ใช้)
14. เมื่อผู้ใช้กด "ออกจากระบบ" ระบบต้องล้าง token/session ทั้งหมด แล้ว redirect ไปที่ `/login`
15. session ของผู้ใช้ต้องคงอยู่แม้จะ refresh หน้า (ผ่าน persistent storage)
16. ข้อความและ label ทุกตัวบนหน้า Login และในส่วนที่เกี่ยวข้องต้องเป็นภาษาไทย

## Non-functional requirements

### Performance
- หน้า Login ต้องโหลดเสร็จภายใน 2 วินาทีบน connection ปกติ
- การตอบสนองของฟอร์ม (validation, ปุ่มกด) ต้องเกิดขึ้นภายใน 100ms

### Security
- รหัสผ่านต้องไม่ถูก log หรือเก็บใน plain text ที่ฝั่ง client
- การส่งข้อมูล login ต้องผ่าน HTTPS เท่านั้น
- Token ที่เก็บใน storage ควรใช้ `httpOnly cookie` หากเป็นไปได้ เพื่อป้องกัน XSS (หรือใช้ secure storage strategy อื่นตามที่ทีม CTO กำหนด)
- ระบบต้องป้องกัน CSRF สำหรับ endpoint login
- ไม่เปิดเผยรายละเอียดว่า "อีเมลผิด" หรือ "รหัสผ่านผิด" แยกกัน ให้รวมเป็นข้อความเดียวว่า "อีเมลหรือรหัสผ่านไม่ถูกต้อง"

### Accessibility
- ฟอร์มทุก field ต้องมี `<label>` ที่ผูกกับ input อย่างถูกต้อง
- ต้องสามารถใช้งานผ่าน keyboard ได้ทั้งหมด (Tab order, Enter เพื่อ submit)
- ข้อความ error ต้องสามารถอ่านได้โดย screen reader (ใช้ `aria-live` หรือ `aria-describedby`)
- contrast ของตัวอักษรและพื้นหลังต้องผ่านเกณฑ์ WCAG AA

### Compatibility
- รองรับ browser หลัก: Chrome, Safari, Firefox, Edge เวอร์ชันล่าสุด 2 versions
- Responsive design รองรับทั้ง desktop และ mobile

## UX notes
- ใช้ Ant Design `Form`, `Input`, `Input.Password`, `Button` ตาม design system ของโปรเจกต์
- Layout ของหน้า Login ควรเป็นแบบ centered card บนพื้นหลังสะอาด ๆ ไม่มี Sider/Header ของ AppShell (เพราะหน้านี้อยู่นอก `(app)/`)
- แสดง logo และชื่อ "TradeMaster" ด้านบนฟอร์ม
- ใต้ฟอร์มอาจมีข้อความ "ยังไม่มีบัญชี? ติดต่อผู้ดูแลระบบ" (เนื่องจาก signup ไม่อยู่ใน scope)
- ปุ่ม "เข้าสู่ระบบ" ใช้สี primary ตาม design token
- ข้อความ error แสดงด้วยสี error ตาม design token
- ใช้ Ant Design `message` หรือ `notification` สำหรับ feedback ที่ไม่ใช่ inline error (เช่น "เข้าสู่ระบบสำเร็จ")

### ตัวอย่างข้อความภาษาไทยที่ต้องใช้
| จุดในหน้าจอ | ข้อความ |
|------|--------|
| หัวข้อหน้า | "เข้าสู่ระบบ" |
| Label อีเมล | "อีเมล" |
| Placeholder อีเมล | "กรุณากรอกอีเมลของคุณ" |
| Label รหัสผ่าน | "รหัสผ่าน" |
| Placeholder รหัสผ่าน | "กรุณากรอกรหัสผ่าน" |
| ปุ่มหลัก | "เข้าสู่ระบบ" |
| ขณะ loading | "กำลังเข้าสู่ระบบ..." |
| Error ทั่วไป | "อีเมลหรือรหัสผ่านไม่ถูกต้อง" |
| Error ระบบ | "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" |
| ปุ่ม logout | "ออกจากระบบ" |
| Tooltip toggle รหัสผ่าน | "แสดง/ซ่อนรหัสผ่าน" |

## Assumptions
1. มี backend API endpoint (จริงหรือ mock) สำหรับ login ที่รับ `{ email, password }` และตอบกลับด้วย token + user info
2. ใช้ JWT หรือ session token เป็นกลไก authentication
3. Token จะถูกเก็บใน cookie (preferred, httpOnly) หรือ localStorage หาก cookie ไม่สามารถใช้ได้
4. Redux Toolkit จะถูกใช้ในการเก็บ user state (เช่น `authSlice` ที่มี `user`, `token`, `isAuthenticated`, `loading`, `error`)
5. ใช้ Next.js middleware (`middleware.ts`) สำหรับ route protection ที่ระดับ edge
6. หน้า Login จะอยู่ที่ `src/app/login/page.tsx` (อยู่นอก route group `(app)/` เพื่อไม่ให้ใช้ AppShell)
7. ผู้ใช้ที่มีอยู่ในระบบจะถูกสร้างจากฝั่ง backend แล้ว (ไม่ต้องมีการสมัครสมาชิกในแอป)
8. รองรับเฉพาะภาษาไทยในรอบนี้ ไม่ต้องทำ i18n switcher
9. UI ใช้ design tokens จาก `src/design-system/tokens.ts` และ Ant Design theme จาก `src/design-system/antd-theme.ts`
10. session timeout default คือ 24 ชั่วโมง (ปรับได้ตาม backend)

## Open questions
1. **Backend API**: มี endpoint จริงให้ใช้แล้วหรือยัง? ถ้ายังไม่มี ต้องการให้ใช้ mock data แบบไหน (mock ใน frontend หรือ mock server)?
2. **Token strategy**: ใช้ JWT (stateless) หรือ session-based? เก็บใน httpOnly cookie หรือ localStorage?
3. **Session duration**: ระยะเวลา session ที่ต้องการให้ login ค้างไว้คือเท่าใด? ต้องมี refresh token หรือไม่?
4. **Rate limiting**: ต้องการ rate limit การพยายาม login ผิดหรือไม่? (เช่น lock account หลังพยายาม 5 ครั้ง)
5. **เกณฑ์รหัสผ่าน**: ใช้เกณฑ์ขั้นต่ำ 8 ตัวอักษรพอ หรือต้องการเงื่อนไขเพิ่ม (ตัวพิมพ์เล็ก/ใหญ่/ตัวเลข/อักขระพิเศษ) สำหรับฝั่ง validation?
6. **User identifier**: ใช้อีเมลอย่างเดียว หรือต้องรองรับ username ด้วย?
7. **Logo/Branding**: มีไฟล์ logo TradeMaster ให้ใช้แล้วหรือไม่?
8. **การจัดการ multi-tab**: หากผู้ใช้ logout ใน tab หนึ่ง ต้องการให้ tab อื่น logout ตามทันทีหรือไม่?

## Success criteria
1. ผู้ใช้สามารถเข้าหน้า `/login`, กรอกอีเมล/รหัสผ่านที่ถูกต้อง และถูก redirect ไป `/dashboard` ได้สำเร็จ
2. ผู้ใช้ที่ยังไม่ได้ login ไม่สามารถเข้าหน้าใด ๆ ใต้ `(app)/` ได้ — ต้องถูก redirect ไป `/login` ทุกครั้ง
3. ข้อความ UI ทั้งหมดบนหน้า Login และจุดที่เกี่ยวข้อง (logout, error toast) เป็นภาษาไทย 100%
4. Form validation ทำงานครบทุกเคสตาม Functional requirements ข้อ 3–6
5. session คงอยู่หลัง refresh หน้า และหายไปเมื่อกด logout
6. ผ่าน `npm run lint` โดยไม่มี error
7. ผ่าน `npm run build` โดยไม่มี error
8. QA สามารถทดสอบ flow ทั้งหมด (login สำเร็จ, login ล้มเหลว, logout, route protection, refresh persistence) ได้ตาม test plan
9. UI ตรงตาม design tokens ใน `src/design-system/tokens.ts` และไม่มี hard-coded color/spacing
10. รองรับการใช้งานผ่าน keyboard อย่างสมบูรณ์ (Tab + Enter submit ได้)
