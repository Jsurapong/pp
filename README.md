# pp

# Software Requirement Specification (SRS)
**Project Name:** TradeMaster (Web Platform for Portfolio & Risk Management)
**Document Version:** 1.0

---

## 1. ภาพรวม (Project Overview)

**TradeMaster** คือเว็บแอปพลิเคชันสำหรับบริหารจัดการพอร์ตโฟลิโอการลงทุนและการเทรด ออกแบบมาเพื่อทดแทนการใช้ Excel โดยเน้นไปที่การลดภาระการบันทึกข้อมูล (Frictionless Journaling) และเพิ่มประสิทธิภาพในการจัดการความเสี่ยง (Money Management) ระบบจะช่วยคำนวณตัวเลขที่สำคัญ เช่น ขนาด Lot, RRR และเปอร์เซ็นต์ความเสี่ยงให้อัตโนมัติ พร้อมแสดงผลสถิติการเติบโตของพอร์ตโฟลิโอผ่าน Dashboard ที่เข้าใจง่าย

### 1.1 วัตถุประสงค์ (Objectives)
* สร้างศูนย์กลางในการจัดการหลายพอร์ตโฟลิโอ (Multi-Portfolio) ภายในบัญชีเดียว
* ลดข้อผิดพลาดในการคำนวณ Position Size และจุดตัดขาดทุน (Stop Loss) ก่อนเข้าเทรด
* ติดตามผลลัพธ์ (Performance) และวิเคราะห์สถิติเพื่อพัฒนาวินัยและกลยุทธ์การเทรด

### 1.2 กลุ่มเป้าหมาย (Target Audience)
* เทรดเดอร์รายย่อย (Retail Traders) ที่เทรดหุ้น, Forex หรือ Cryptocurrency
* ผู้ที่ต้องการเครื่องมือในการทำ Trade Journaling ที่เชื่อมโยงกับการคำนวณ Money Management แบบเรียลไทม์

### 1.3 เทคโนโลยีที่ใช้ (Tech Stack Recommendation)
* **Frontend:** Next.js (React), Tailwind CSS
* **Backend:** Next.js API Routes (หรือ Node.js/Express)
* **Database:** PostgreSQL (ผ่าน Prisma ORM หรือ Drizzle)
* **Authentication:** NextAuth.js (Email/Password & Google OAuth)
* **Deployment:** Vercel หรือ Docker Containers

---

## 2. แผนการพัฒนา (Development Roadmap)

การพัฒนาจะถูกแบ่งออกเป็น 3 ระยะ (Phases) เพื่อให้สามารถทดสอบและใช้งานฟีเจอร์หลัก (MVP) ได้เร็วที่สุด

### Phase 1: Core Foundation & Journaling (ระบบพื้นฐานและการบันทึก)
**เป้าหมาย:** ผู้ใช้สามารถสมัครสมาชิก สร้างพอร์ต และบันทึกข้อมูลการเทรดได้ครบถ้วนเหมือนใช้งาน Excel
* **1.1 ระบบ Authentication:**
  * หน้า Login / Register พร้อมระบบยืนยันตัวตน
* **1.2 ระบบ Multi-Portfolio:**
  * สร้าง, แก้ไข, ลบ พอร์ตโฟลิโอ (กำหนดชื่อ, ยอดเงินตั้งต้น, ประเภทสินทรัพย์, สกุลเงิน)
* **1.3 Trade Journal CRUD (Create, Read, Update, Delete):**
  * สร้างฟอร์มบันทึกการเทรด โดยอ้างอิงฟิลด์ข้อมูลดังนี้:
    * *ข้อมูลทั่วไป:* Symbol, Timeframe, Direction (Long/Short), Strategy Tag
    * *จุดเข้า-ออก:* Entry Price, Stop Loss, Take Profit, Entry/Exit Date & Time
    * *ผลลัพธ์และจิตวิทยา:* PnL, Result (Win/Loss), Confidence Level, Emotion, Notes, TradingView Image URL

### Phase 2: Money Management Engine (ระบบเครื่องคิดเลขอัจฉริยะ)
**เป้าหมาย:** สร้างระบบอัตโนมัติเพื่อลดการคำนวณด้วยมือ และจัดการความเสี่ยงก่อนเข้าออเดอร์
* **2.1 Position Size & Lot Calculator:**
  * เมื่อผู้ใช้กรอก `ทุน (Capital)`, `ความเสี่ยง (%)`, `Entry` และ `Stop Loss` ระบบจะต้องคำนวณ `Position Size` และ `จำนวน Lot` ให้ทันที
* **2.2 RRR (Risk to Reward Ratio) Calculator:**
  * คำนวณความคุ้มค่าของออเดอร์แบบเรียลไทม์เมื่อมีการตั้ง Take Profit
* **2.3 Auto-Balance Update:**
  * เมื่อทำการปิดออเดอร์ (Close Trade) และกรอก PnL ระบบจะนำไปคำนวณบวก/ลบ ยอดเงินสะสม (Current Balance) ของพอร์ตนั้นๆ อัตโนมัติ

### Phase 3: Analytics Dashboard (ระบบวิเคราะห์สถิติภาพรวม)
**เป้าหมาย:** นำข้อมูลจาก Phase 1 และ 2 มาแสดงผลเป็นกราฟและสถิติเชิงลึก
* **3.1 Global Dashboard (หน้า Home):**
  * แสดง Total Net Worth (ยอดเงินรวมทุกพอร์ต)
  * กราฟ Asset Allocation สัดส่วนการลงทุน
* **3.2 Portfolio Dashboard (สถิติรายพอร์ต):**
  * **Equity Curve:** กราฟเส้นแสดงการเติบโตของพอร์ต
  * **Win Rate & RRR Average:** อัตราการชนะและสัดส่วนกำไร/ขาดทุนเฉลี่ย
  * **Cumulative Stats:** ยอด PnL สะสม, จำนวน TP สะสม, จำนวน SL สะสม
  * **Performance Metrics:** Account Growth %, Return %, Average Hold Duration

### Phase 4: Future Enhancements (ฟีเจอร์ต่อยอดในอนาคต)
* ระบบนำเข้าข้อมูล (Import) จากไฟล์ Excel (.csv) หรือแพลตฟอร์มอื่น (เช่น MetaTrader, Binance)
* ระบบเชื่อมต่อราคา Real-time ผ่าน API
* ระบบแจ้งเตือน (Notifications) ผ่าน LINE หรือ Telegram เมื่อถึงจุด Take Profit / Stop Loss
