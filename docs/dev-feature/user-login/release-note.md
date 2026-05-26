# Release Note: ระบบเข้าสู่ระบบ (User Login) v1.0

**วันที่:** 26 พฤษภาคม 2566 (May 26, 2026)  
**สาขา:** `feat/dev-feature-skill-and-claude-md`

---

## สิ่งที่เพิ่มมาใหม่

ระบบเข้าสู่ระบบสมบูรณ์สำหรับแพลตฟอร์ม TradeMaster ผู้ใช้งานสามารถ:

- **เข้าสู่ระบบ** ด้วยอีเมลและรหัสผ่าน บนหน้า `/login` ที่มี UI ภาษาไทยทั้งหมด
- **ป้องกันการเข้าถึงไม่ได้รับอนุญาต** — หากไม่ได้เข้าสู่ระบบ จะไม่สามารถเข้าหน้า `/dashboard` และจะถูกเปลี่ยนเส้นทางกลับไปที่ `/login` อัตโนมัติ
- **ออกจากระบบ** ผ่านปุ่มในเมนู UserMenu ที่มุมบนขวาของแอป
- **คงสถานะเข้าสู่ระบบไว้** หลังจาก refresh หน้า — ผ่าน httpOnly cookie ที่มี max-age 1 ชั่วโมง

---

## วิธีใช้งาน

### สำหรับผู้ใช้

1. ไปที่ `http://localhost:3000/login`
2. กรอก**อีเมล** และ**รหัสผ่าน** (ใช้ demo user: `demo@trademaster.local` / `password123`)
3. กดปุ่ม**"เข้าสู่ระบบ"** และจะถูกเปลี่ยนเส้นทางไปที่ Dashboard โดยอัตโนมัติ
4. เมื่อต้องการออกจาก ให้คลิกชื่อผู้ใช้ (มุมบนขวา) → **"ออกจากระบบ"**

### สำหรับนักพัฒนา

```bash
# ตั้งค่าฐานข้อมูลและสร้าง demo user
npm run db:migrate
npm run db:seed

# รัน dev server
npm run dev

# ทดสอบ API (ดูรายละเอียดใน BE summary)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@trademaster.local","password":"password123"}'
```

---

## การเปลี่ยนแปลงเบื้องหลัง

### ด้านหน้าผู้ใช้ (Frontend)

- **LoginForm.tsx** — ฟอร์มที่ใช้ Ant Design Form พร้อม validation แบบ real-time
- **authSlice.ts** — Redux slice เก็บสถานะ user, token, loading, error
- **proxy.ts** — ป้องกันเส้นทาง (replacement สำหรับ Next.js 16 ที่ไม่มี `middleware.ts`)
- **UserMenu.tsx** — dropdown avatar ที่มีปุ่ม logout

### ด้านเซิร์ฟเวอร์ (Backend)

- **API routes** (`/api/auth/login`, `/api/auth/logout`, `/api/auth/me`) — ใช้ Next.js route handlers (Node runtime)
- **SQLite database** — ไฟล์ `data/trademaster.db` เก็บรายชื่อผู้ใช้
- **Password hashing** — bcryptjs (cost 10) สำหรับความปลอดภัย
- **JWT tokens** — signed ด้วย `JWT_SECRET`, expire หลัง 1 ชั่วโมง, เก็บใน httpOnly cookies

### ความปลอดภัย

- รหัสผ่านไม่ถูกบันทึกและไม่ถูกส่งคืนจาก API
- CSRF protection ผ่าน `SameSite=Lax`
- Timing attack mitigation — หากผู้ใช้ไม่พบ ระบบจะหน่วงเวลา 200ms เหมือน bcrypt verification
- Token ถูกเก็บใน httpOnly cookie (ไม่สามารถเข้าถึงจาก JavaScript)

---

## สถานะการทดสอบ

| ผลลัพธ์ | ทั้งหมด | ผ่าน | ล้มเหลว | ขัดขวาง |
|--------|--------|------|--------|---------|
| **จำนวน** | 27 | 22 | 2 | 3 |

**สรุป:** Conditional Pass — หลักการทำงาน (login, logout, route protection, session persistence) ทั้งหมดผ่านแล้ว

### ล้มเหลว (2 รายการ)

1. **aria-label on password toggle (TC-22)** — ป้ายชื่อสำหรับไอคอน "แสดง/ซ่อนรหัสผ่าน" อยู่บนไอคอนแทนที่จะอยู่บนปุ่มอินเทอร์แอคทีฟ (ผลกระทบ: ความสามารถในการเข้าถึง)
2. **npm run lint exits with error (TC-27)** — `StoreProvider.tsx` มีข้อผิดพลาด pre-existing (ไม่เกี่ยวข้องกับ login feature) ที่ต้องแก้ไขแยกต่างหาก

### ขัดขวาง (3 รายการ)

- Back-button navigation หลัง logout (ต้องทดสอบด้วยเบราว์เซอร์จริง)
- Keyboard-only navigation (ต้องทดสอบด้วยเบราว์เซอร์จริง)
- Responsive layout บน mobile (ต้องตรวจสอบด้วยจอ mobile จริง)

---

## ข้อจำกัดและปัญหาที่รู้

### ฟีเจอร์ที่ยังไม่มี

- **สมัครสมาชิก (Sign up)** — ต้องสร้าง user จากด้าน backend ก่อน
- **ลืมรหัสผ่าน (Forgot password)** — ออกนอกขอบเขตของ release นี้
- **อนุมัติแบบสองขั้นตอน (2FA)** — ออกนอกขอบเขตของ release นี้
- **Rate limiting** — ไม่มีการป้องกันจากการพยายามเข้าสู่ระบบผิดๆ หลายครั้ง

### หลัง 1 ชั่วโมง

- Session หมดอายุหลังจาก 1 ชั่วโมง ผู้ใช้จะต้องเข้าสู่ระบบใหม่ (ไม่มี refresh token)

### ทำให้ lint ผ่าน

- แก้ไข `StoreProvider.tsx` ด้วยการใช้รูปแบบ React ที่แนะนำเพื่อไม่ให้เข้าถึง ref ระหว่าง render (pre-existing issue)

---

## เอกสารที่เกี่ยวข้อง

- [Requirement](./requirement.md) — รายละเอียดความต้องการทั้งหมด
- [Frontend Implementation](./fe-implementation-summary.md) — ไฟล์และการเปลี่ยนแปลง UI
- [Backend Implementation](./be-implementation-summary.md) — ไฟล์และการเปลี่ยนแปลง API
- [Test Report](./test-report.md) — รายละเอียดผลการทดสอบอย่างเต็มที่

---

**สำหรับคำถามหรือข้อเสนอแนะ** — โปรดติดต่อทีม development
