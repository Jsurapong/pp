# Bulletproof React Notes

สรุปจากการศึกษาเอกสารผ่าน Context7 (`/alan2207/bulletproof-react`) และข้อเสนอเชิงปฏิบัติสำหรับโปรเจกต์นี้

## Core Principles

- ใช้โครงสร้างแบบ **feature-first**: โค้ดส่วนใหญ่ควรอยู่ใน `features/*`
- แต่ละ feature ควรมีโค้ดครบในตัวเอง เช่น `services`, `components`, `hooks`, `types`
- มาตรฐานโปรเจกต์นี้ใช้คำว่า `services/` สำหรับ data layer (endpoint declarations + hooks) แทน `api/`
- กำหนด **import boundaries** ให้ชัด เพื่อลดการ coupling ระหว่าง feature
- แยก shared layer สำหรับสิ่งที่ใช้ร่วมกัน เช่น `components`, `hooks`, `lib`, `types`, `utils`
- ใช้ **absolute imports** (`@/*`) เพื่อให้อ่านง่ายและลดปัญหา relative path ยาว

## Suggested Folder Direction

```txt
src/
  app/
  features/
    <feature-name>/
      services/
      components/
      hooks/
      types/
      index.ts
  testing/
  shared/
      components/
      hooks/
      lib/
      types/
      utils/
```

## Import Boundary Rules (Important)

แนวคิดหลัก:

- `features/*` ไม่ควร import ข้าม feature กันโดยตรง
- ต้อง import ผ่าน public API ของ feature (`index.ts`) หรือผ่าน shared layer
- `app` และ `features` สามารถใช้ shared modules ร่วมกันได้

ตัวอย่าง rule (แนวคิด):

```js
// import/no-restricted-paths
{
  target: "./src/features/auth",
  from: "./src/features",
  except: ["./auth"]
}
```

## Testing Strategy (Bulletproof React Style)

- ให้ความสำคัญกับ **integration tests** และ **e2e tests** เป็นหลัก
- Unit tests ยังใช้ได้ดีสำหรับ pure functions และ utility logic
- ทดสอบจากมุมมองผู้ใช้ (Testing Library philosophy)
- หลีกเลี่ยงการ test implementation details ที่เปราะต่อการ refactor

### Recommended Test Layers

1. **Unit**
   - helper/pure functions เช่น date range, formatting, calculations
2. **Integration**
   - hooks + services layer + UI state transitions (loading/success/error)
3. **E2E**
   - critical business flows ที่ผู้ใช้ใช้งานจริง

## State Management Guidance

- แยกความต่างระหว่าง
  - **Server state**: แนะนำใช้ React Query (หรือ RTK Query ตามมาตรฐานทีม)
  - **Application/global state**: ใช้เฉพาะที่จำเป็นจริง
- เก็บ state ให้ใกล้ component ที่ใช้ เพื่อลด re-render
- Context เหมาะกับ low-frequency state (เช่น theme/user)
- High-frequency state ควรใช้แนว selector/store ที่ granular กว่า

## Apply to Current Project

จากโครงสร้างปัจจุบันของโปรเจกต์นี้:

- มี `features/*` และ shared modules อยู่แล้ว (ทิศทางดี)
- ควรเสริมกติกา import boundary ผ่าน ESLint เพื่อคุมสเกลระยะยาว
- ควรกำหนด public API ของแต่ละ feature ให้ชัด (`index.ts`)
- ควรเพิ่ม integration tests สำหรับ dashboard data flow และ progress states

## Action Plan (Practical)

1. เพิ่ม ESLint rule สำหรับห้าม cross-feature imports โดยตรง
2. จัดมาตรฐานการ export ผ่าน `index.ts` ของแต่ละ feature
3. วาง test matrix ตาม 3 ชั้น: unit / integration / e2e
4. กำหนด guideline import path (`@/features/...`, `@/shared/...`) ให้ทีมใช้ร่วมกัน

## References

- [Project Structure](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md)
- [Testing](https://github.com/alan2207/bulletproof-react/blob/master/docs/testing.md)
- [State Management](https://github.com/alan2207/bulletproof-react/blob/master/docs/state-management.md)
- [Security](https://github.com/alan2207/bulletproof-react/blob/master/docs/security.md)
- [Performance](https://github.com/alan2207/bulletproof-react/blob/master/docs/performance.md)

## Related Document

- Feature contract: `docs/architecture/feature-architecture-contract.md`
- Refactor prompt contract: `docs/architecture/refactor-feature-contract.md`
