# Finger Math Direct Role V6

เวอร์ชันนี้นำหน้าล็อกอินและสมัครสมาชิกออกทั้งหมด

เมื่อเปิดเว็บ ผู้ใช้เลือกเข้าได้ทันที 3 โหมด:

- โหมดครู
- โหมดผู้ปกครอง
- โหมดนักเรียน

โหมดท่าทางถูกปิดใช้งาน และแสดงข้อความ “กำลังพัฒนา”

## อัป GitHub

นำไฟล์ทั้งหมดไปแทน repository แล้วรัน:

```bash
git add .
git commit -m "Remove login and add direct role selection"
git pull --rebase origin main
git push origin main
```

ไม่จำเป็นต้องรัน schema.sql ใหม่สำหรับการเปลี่ยนหน้าจอนี้

## V8 Two-Hand Mental Math
- Left hand represents tens and right hand represents units.
- Each hand digit uses thumb = 5 and each other finger = 1, supporting digits 0-9.
- New camera game mode: mental_two_hand (00-99).
- The Learning Center includes lessons for finger values, place value, two-digit addition, carrying, and camera hand swapping.
