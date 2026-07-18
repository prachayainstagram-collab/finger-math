# Finger Math Single Auth V5

## ระบบเข้าสู่ระบบใหม่

ใช้ระบบเดียวเท่านั้น:

- ครู: อีเมล + รหัสผ่าน Supabase อย่างน้อย 6 ตัวอักษร
- ผู้ปกครอง: อีเมล + รหัสผ่าน Supabase อย่างน้อย 6 ตัวอักษร
- นักเรียน: รหัสผู้เรียน UUID + PIN ตัวเลข 4 หลัก

ระบบ AccountManager และรหัสผู้ใหญ่ 4 ตัวใน LocalStorage ถูกปิดแล้ว

## ผู้ปกครอง

หลังผู้ปกครองล็อกอินด้วย Supabase แล้ว จะต้องกรอก:

1. รหัสผู้เรียน UUID
2. PIN ของนักเรียน 4 หลัก

จึงจะเปิดพื้นที่ฝึกที่บ้านของลูกได้ และระบบตรวจว่าเด็กคนนั้นอยู่ในบัญชีผู้ปกครองเดียวกัน

## ฐานข้อมูล

รัน `supabase/schema.sql` ใน Supabase SQL Editor

คำเตือน: schema.sql เป็นไฟล์ reset และจะลบข้อมูลตาราง Finger Math เดิมก่อนสร้างใหม่

PIN นักเรียนใน V5 ต้องเป็นตัวเลข 4 หลักเท่านั้น

## ตั้งบัญชีครู

```sql
update public.profiles
set role='teacher',updated_at=now()
where email='อีเมลครู';
```

## อัป GitHub

```bash
git add .
git commit -m "Use single Supabase auth and four digit student PIN"
git pull --rebase origin main
git push origin main
```
