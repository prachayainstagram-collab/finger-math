-- FINGER MATH COMPLETE DATABASE SCHEMA V2
-- WARNING: This reset script deletes the listed Finger Math tables and their data.
-- Run once in Supabase SQL Editor when setting up or repairing the project.

begin;

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.current_user_role() cascade;
drop function if exists public.create_student(text,text,text,text,text) cascade;
drop function if exists public.verify_student_pin(uuid,text) cascade;
drop function if exists public.list_active_students() cascade;

drop table if exists public.assessment_rules cascade;
drop table if exists public.assessment_sessions cascade;
drop table if exists public.questions cascade;
drop table if exists public.students cascade;
drop table if exists public.profiles cascade;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  email text,
  role text not null default 'parent' check (role in ('teacher','parent')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  student_code text,
  full_name text not null,
  classroom text,
  grade_level text,
  pin_hash text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index students_owner_code_unique
  on public.students(owner_id,student_code) where student_code is not null;
create index students_owner_idx on public.students(owner_id);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  topic smallint not null check (topic between 1 and 20),
  difficulty smallint not null default 1 check (difficulty between 1 and 5),
  question_th text not null,
  question_en text,
  instruction_th text,
  instruction_en text,
  answer_value numeric not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index questions_owner_idx on public.questions(owner_id);

create table public.assessment_sessions (
  session_id text primary key,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  learner_id uuid references public.students(id) on delete set null,
  player_name text not null,
  classroom text,
  test_type text,
  difficulty text,
  topic_filter text,
  total_questions integer not null default 0,
  correct_count integer not null default 0,
  wrong_count integer not null default 0,
  accuracy numeric,
  score numeric not null default 0,
  total_time_sec numeric not null default 0,
  avg_response_time_sec numeric not null default 0,
  expression_signal_summary jsonb not null default '{}'::jsonb,
  responses jsonb not null default '[]'::jsonb,
  played_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index sessions_owner_idx on public.assessment_sessions(owner_id);
create index sessions_learner_idx on public.assessment_sessions(learner_id);

create table public.assessment_rules (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  grade_level text not null default '*',
  mode text not null default '*',
  topic smallint,
  min_accuracy numeric not null default 80 check (min_accuracy between 0 and 100),
  max_avg_response_time_sec numeric not null default 5 check (max_avg_response_time_sec > 0),
  created_at timestamptz not null default now()
);
create unique index rules_unique
  on public.assessment_rules(owner_id,grade_level,mode,coalesce(topic,-1));

alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.questions enable row level security;
alter table public.assessment_sessions enable row level security;
alter table public.assessment_rules enable row level security;

create policy "profiles read own" on public.profiles
for select to authenticated using (id=auth.uid());

create policy "profiles update own" on public.profiles
for update to authenticated using (id=auth.uid()) with check (id=auth.uid());

create or replace function public.current_user_role()
returns text language sql stable security definer set search_path=public
as $$ select coalesce((select role from public.profiles where id=auth.uid()),''); $$;

revoke all on function public.current_user_role() from public;
grant execute on function public.current_user_role() to authenticated;

create policy "adults read own learners" on public.students
for select to authenticated
using (owner_id=auth.uid() and public.current_user_role() in ('teacher','parent'));

create policy "adults insert own learners" on public.students
for insert to authenticated
with check (owner_id=auth.uid() and public.current_user_role() in ('teacher','parent'));

create policy "adults update own learners" on public.students
for update to authenticated
using (owner_id=auth.uid() and public.current_user_role() in ('teacher','parent'))
with check (owner_id=auth.uid() and public.current_user_role() in ('teacher','parent'));

create policy "adults delete own learners" on public.students
for delete to authenticated
using (owner_id=auth.uid() and public.current_user_role() in ('teacher','parent'));

create policy "owners read own questions" on public.questions
for select to authenticated using (owner_id=auth.uid());

create policy "teachers insert own questions" on public.questions
for insert to authenticated
with check (owner_id=auth.uid() and public.current_user_role()='teacher');

create policy "teachers update own questions" on public.questions
for update to authenticated
using (owner_id=auth.uid() and public.current_user_role()='teacher')
with check (owner_id=auth.uid() and public.current_user_role()='teacher');

create policy "teachers delete own questions" on public.questions
for delete to authenticated
using (owner_id=auth.uid() and public.current_user_role()='teacher');

create policy "owners sessions all" on public.assessment_sessions
for all to authenticated using (owner_id=auth.uid()) with check (owner_id=auth.uid());

create policy "owners rules all" on public.assessment_rules
for all to authenticated using (owner_id=auth.uid()) with check (owner_id=auth.uid());

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public
as $$
begin
  insert into public.profiles(id,display_name,email,role)
  values(
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'display_name',''),
             nullif(new.raw_user_meta_data->>'full_name',''),
             split_part(coalesce(new.email,''),'@',1)),
    new.email,
    'parent'
  )
  on conflict(id) do update set
    display_name=excluded.display_name,
    email=excluded.email;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert or update on auth.users
for each row execute procedure public.handle_new_user();

insert into public.profiles(id,display_name,email,role)
select
  u.id,
  coalesce(nullif(u.raw_user_meta_data->>'display_name',''),
           nullif(u.raw_user_meta_data->>'full_name',''),
           split_part(coalesce(u.email,''),'@',1)),
  u.email,
  'parent'
from auth.users u
on conflict(id) do nothing;

create or replace function public.create_student(
  p_full_name text,
  p_classroom text default null,
  p_grade_level text default null,
  p_student_code text default null,
  p_pin text default null
)
returns table(
  id uuid,owner_id uuid,student_code text,full_name text,
  classroom text,grade_level text,is_active boolean,created_at timestamptz
)
language plpgsql security definer set search_path=public,extensions
as $$
declare v public.students; v_pin text;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if public.current_user_role() not in ('teacher','parent') then raise exception 'Permission denied'; end if;
  if nullif(trim(p_full_name),'') is null then raise exception 'Student name is required'; end if;
  v_pin:=coalesce(nullif(trim(p_pin),''),lpad((floor(random()*10000))::int::text,4,'0'));
  if v_pin !~ '^[0-9]{4}$' then raise exception 'PIN must contain exactly 4 digits'; end if;

  insert into public.students(owner_id,full_name,classroom,grade_level,student_code,pin_hash)
  values(
    auth.uid(),trim(p_full_name),nullif(trim(p_classroom),''),
    nullif(trim(p_grade_level),''),nullif(trim(p_student_code),''),
    extensions.crypt(v_pin,extensions.gen_salt('bf',10))
  ) returning * into v;

  return query select v.id,v.owner_id,v.student_code,v.full_name,
                      v.classroom,v.grade_level,v.is_active,v.created_at;
end;
$$;

create or replace function public.verify_student_pin(p_student_id uuid,p_pin text)
returns table(student_id uuid,owner_id uuid,full_name text,classroom text,grade_level text)
language sql security definer set search_path=public,extensions
as $$
  select s.id,s.owner_id,s.full_name,s.classroom,s.grade_level
  from public.students s
  where s.id=p_student_id and s.is_active=true
    and s.pin_hash=extensions.crypt(p_pin,s.pin_hash)
  limit 1;
$$;

revoke all on function public.create_student(text,text,text,text,text) from public;
grant execute on function public.create_student(text,text,text,text,text) to authenticated;
revoke all on function public.verify_student_pin(uuid,text) from public;
grant execute on function public.verify_student_pin(uuid,text) to anon,authenticated;

grant select,update on public.profiles to authenticated;
grant select,insert,update,delete on public.students to authenticated;
grant select,insert,update,delete on public.questions to authenticated;
grant select,insert,update,delete on public.assessment_sessions to authenticated;
grant select,insert,update,delete on public.assessment_rules to authenticated;

notify pgrst,'reload schema';
commit;
