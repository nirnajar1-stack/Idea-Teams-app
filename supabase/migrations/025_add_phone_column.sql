-- Ogen 025 — עמודת phone (הרץ אם קיבלת: column u.phone does not exist)
-- נדרש אם הרצת 024 בלי 021

alter table public.app_users
  add column if not exists phone text;

comment on column public.app_users.phone is 'טלפון ליצירת קשר (פורמט בינלאומי 972...)';

alter table public.user_preferences
  add column if not exists notify_email_completed boolean not null default true;

-- CREATE OR REPLACE לא מאפשר הוספת עמודה באמצע — חייבים DROP ואז CREATE
drop view if exists public.app_users_public;

create view public.app_users_public as
select
  id, name, job_title, initials, email, username, phone,
  access_level, active, auth_user_id, created_at, updated_at
from public.app_users;

grant select on public.app_users_public to anon, authenticated;

notify pgrst, 'reload schema';
