-- Ogen 021 — WhatsApp: טלפון למשתמש + העדפת התראה + RPC משתמשים
-- אחרי הרצה: פרוס Edge Function notify-idea-completed והגדר Secrets ב-Supabase

-- טלפון WhatsApp (פורמט E.164 מומלץ, למשל 972501234567)
alter table public.app_users
  add column if not exists phone text;

comment on column public.app_users.phone is 'מספר WhatsApp בפורמט בינלאומי (972...)';

-- העדפת קבלת WhatsApp כשמשימה מוקצית הושלמה
alter table public.user_preferences
  add column if not exists notify_whatsapp_completed boolean not null default true;

-- view ציבורי מעודכן (DROP נדרש כי נוספת עמודה phone)
drop view if exists public.app_users_public;

create view public.app_users_public as
select
  id, name, job_title, initials, email, username, phone,
  access_level, active, auth_user_id, created_at, updated_at
from public.app_users;

grant select on public.app_users_public to anon, authenticated;

-- insert user — כולל phone
create or replace function public.insert_app_user_for_session(
  p_actor_user_id text,
  p_user jsonb
)
returns public.app_users
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor text;
  v_row public.app_users;
begin
  perform public.assert_manager_actor(p_actor_user_id);

  if coalesce(p_user->>'access_level', 'member') not in ('manager', 'member', 'master') then
    raise exception 'invalid access_level';
  end if;

  insert into public.app_users (
    id, name, job_title, initials, email, username, password_hash, access_level, active, phone
  )
  values (
    p_user->>'id',
    p_user->>'name',
    p_user->>'job_title',
    coalesce(p_user->>'initials', ''),
    p_user->>'email',
    lower(p_user->>'username'),
    coalesce(p_user->>'password_hash', ''),
    p_user->>'access_level',
    coalesce((p_user->>'active')::boolean, true),
    nullif(trim(p_user->>'phone'), '')
  )
  returning * into v_row;

  insert into public.user_preferences (user_id)
  values (v_row.id)
  on conflict (user_id) do nothing;

  return v_row;
end;
$$;

-- update user — כולל phone
create or replace function public.update_app_user_for_session(
  p_actor_user_id text,
  p_user_id text,
  p_patch jsonb
)
returns public.app_users
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.app_users;
begin
  perform public.assert_manager_actor(p_actor_user_id);

  select * into v_row from public.app_users where id = p_user_id;
  if not found then
    raise exception 'user not found';
  end if;

  if p_patch ? 'access_level'
     and p_patch->>'access_level' not in ('manager', 'member', 'master') then
    raise exception 'invalid access_level';
  end if;

  update public.app_users u
  set
    name = coalesce(p_patch->>'name', u.name),
    job_title = coalesce(p_patch->>'job_title', u.job_title),
    initials = coalesce(p_patch->>'initials', u.initials),
    email = coalesce(p_patch->>'email', u.email),
    username = coalesce(lower(p_patch->>'username'), u.username),
    password_hash = case
      when p_patch ? 'password_hash' and coalesce(p_patch->>'password_hash', '') <> ''
        then p_patch->>'password_hash'
      else u.password_hash
    end,
    access_level = coalesce(p_patch->>'access_level', u.access_level),
    active = coalesce((p_patch->>'active')::boolean, u.active),
    phone = case
      when p_patch ? 'phone' then nullif(trim(p_patch->>'phone'), '')
      else u.phone
    end
  where u.id = p_user_id
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.insert_app_user_for_session(text, jsonb) to anon, authenticated;
grant execute on function public.update_app_user_for_session(text, text, jsonb) to anon, authenticated;

notify pgrst, 'reload schema';
