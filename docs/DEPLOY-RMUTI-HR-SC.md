# rmuti_hr_sc — คำแนะนำติดตั้งระบบจริง

## สถานะ
- Supabase Project `rmuti_hr_sc` (`kaqnnyexlojscvrlpoex`) สร้าง schema แล้ว
- Google Drive โฟลเดอร์หลัก `rmuti_hr_sc` และโฟลเดอร์ย่อย 5 รายการสร้างแล้ว
- GitHub repository `rmuti_hr_sc` สร้างแล้วในบัญชี `wetpisitso-cmyk` (ห้ามเขียนทับ `rmuti.hr.kkc`)
- ไฟล์ `web/config.js` ตั้ง Supabase mode และ Publishable key แล้ว
- โค้ดเดิมอัปโหลด PDF ผ่าน Storage ถูกแทนด้วย Edge Function `hr-drive-document` (ต้อง deploy และตั้ง secrets ก่อนใช้งาน)

## 1. GitHub
Repository `rmuti_hr_sc` แยกจากระบบรับสมัครงานเรียบร้อยแล้ว โดยอัปโหลดซอร์สไว้ที่ root ของ repository (รวม `.github/workflows/pages.yml`)
ใน Repository → Settings → Pages เลือก `Source: GitHub Actions` จากนั้น Actions จะ deploy โฟลเดอร์ `web` ไปเป็นเว็บไซต์
URL คาดหมายตามรูปแบบ GitHub Pages: `https://wetpisitso-cmyk.github.io/rmuti_hr_sc/` (ตรวจอีกครั้งหลัง deployment สำเร็จ)
**เว็บไซต์มีข้อมูลบุคลากร:** หลีกเลี่ยงเก็บข้อมูลจริงใน GitHub; ใช้ข้อมูลผ่าน Supabase Auth/RLS เท่านั้น

## 2. Supabase
ระบบ Supabase โครงการใหม่มีตารางแล้ว ไม่ต้องรัน SQL `01-schema.sql` หรือ `03-catalog.sql` ซ้ำ
ไฟล์เหล่านี้เก็บเป็นเอกสารอ้างอิงสำหรับเริ่มโครงการว่างในอนาคต
ต้องสร้างบัญชีผู้ใช้ Supabase Auth และเพิ่มบทบาทใน `hr_members` และประวัติใน `hr_profiles` โดยผู้ดูแล (ดู `supabase/04-provision.example.sql`)
ปิด self-signup ถ้าต้องการอนุญาตเฉพาะรายชื่อบุคลากรที่เจ้าหน้าที่จัดการ

## 3. Google Drive สำหรับเอกสาร (สิ่งที่ยังต้องตั้งค่า)
Drive root: https://drive.google.com/drive/folders/1UyQzUuRD3Ixp7Jd33HJ7xbg_MxON44Re
เอกสารคำขอ: https://drive.google.com/drive/folders/1qmF8x_2g51WkztpjrVjpCOW0TnDYTPXL

สร้าง Google Cloud Service Account โดยเปิด Drive API และ**ควรใช้ Shared Drive ของมหาวิทยาลัยสำหรับการอัปโหลดด้วย Service Account** เนื่องจากบัญชีบริการอาจไม่มีโควตาสำหรับสร้างไฟล์ใน My Drive ของบุคคล; หากโฟลเดอร์ที่สร้างอยู่ใน My Drive ให้ย้ายหรือสร้างโฟลเดอร์ปลายทางบน Shared Drive ที่ Service Account มีสิทธิ์เขียนก่อน และปรับ `HR_DRIVE_FOLDER_ID` ให้ตรงกับโฟลเดอร์ปลายทาง
ใน Supabase → Edge Functions → Secrets ตั้ง:
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: อีเมล service account
- `GOOGLE_PRIVATE_KEY`: private key ที่ออกให้ (เก็บเฉพาะ Server Secret; ไม่ใส่ใน GitHub)
- `HR_DRIVE_FOLDER_ID`: `1qmF8x_2g51WkztpjrVjpCOW0TnDYTPXL`
คีย์ `SUPABASE_URL` และ `SUPABASE_SERVICE_ROLE_KEY` ใช้ค่าในฝั่งเซิร์ฟเวอร์ของโครงการ ห้ามใส่ใน `web/`
Deploy `supabase/functions/hr-drive-document/index.ts` เป็น Edge Function ชื่อ `hr-drive-document` แบบ Verify JWT = true
ฟังก์ชันจะตรวจสิทธิ์ HR ก่อนอัปโหลด PDF และตรวจ owner/HR ก่อนดาวน์โหลด โดยไฟล์ไม่เปิด public

## 4. สถานะสำรองข้อมูล
โฟลเดอร์สำรองฐานข้อมูลสร้างแล้ว แต่การสำรองอัตโนมัติยัง **ไม่เปิด** ต้องมี scheduled job แยก
สำรอง DB และทดสอบ restore เป็นระยะ; ไม่ใช่เพียงคัดลอกไฟล์แนบ

## 5. ทดสอบ
- บัญชี staff ดูประวัติของตน แต่ไม่เห็นคนอื่น
- บัญชี HR เห็นคิวคำขอของบุคลากร
- staff ยื่นคำขอ; HR ตรวจสอบ; HR อัปโหลด PDF ไป Drive; staff ดาวน์โหลดได้
- ทดสอบไฟล์ PDF เกิน 5 MB, PDF ไม่ถูกต้อง, URL จากผู้ไม่เกี่ยวข้อง, และการเปลี่ยนสถานะซ้ำ
- ตรวจ Security Advisors ใน Supabase ก่อนเปิดใช้กับข้อมูลบุคลากรจริง

หมายเหตุ: ไฟล์ฟอนต์แบบฝังและ TTF ในต้นฉบับไม่ได้รวมไว้ใน ZIP แจกจ่ายนี้ ระบบใช้ Noto Sans Thai ผ่าน Google Fonts เมื่อออนไลน์
