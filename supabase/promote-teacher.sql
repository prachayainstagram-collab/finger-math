-- Run only after supabase/schema.sql.
-- Replace the email before running.
update public.profiles
set role='teacher', updated_at=now()
where email='teacher@example.com';

select id,display_name,email,role
from public.profiles
order by created_at;
