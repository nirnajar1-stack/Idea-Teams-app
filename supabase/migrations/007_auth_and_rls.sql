-- IdeaFlow 007 — Supabase Auth link + production RLS
-- חובה: ליצור משתמשי Auth ב-Dashboard (Authentication → Users) עם אותם emails:
--   nir@ideaflow.io / nir123
--   golan@ideaflow.io / golan123
-- אחרי יצירה — auth_user_id יתמלא אוטומטית לפי email.

-- ---------------------------------------------------------------------------
-- קישור app_users ↔ auth.users
-- ---------------------------------------------------------------------------
alter table public.app_users
  add column if not exists auth_user_id uuid unique references auth.users (id) on delete set null;

create index if not exists app_users_auth_user_id_idx
  on public.app_users (auth_user_id)
  where auth_user_id is not null;

-- view ללא password_hash — לשימוש באפליקציה
create or replace view public.app_users_public as
select
  id, name, job_title, initials, email, username,
  access_level, active, auth_user_id, created_at, updated_at
from public.app_users;

grant select on public.app_users_public to anon, authenticated;

-- סנכרון auth_user_id כשנוצר משתמש Auth
create or replace function public.link_app_user_on_auth_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.app_users
  set auth_user_id = new.id, updated_at = now()
  where lower(email) = lower(new.email)
    and auth_user_id is null;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.link_app_user_on_auth_signup();

-- קישור חד-פעמי למשתמשים קיימים
update public.app_users au
set auth_user_id = u.id
from auth.users u
where lower(au.email) = lower(u.email)
  and au.auth_user_id is null;

-- ---------------------------------------------------------------------------
-- helper functions for RLS
-- ---------------------------------------------------------------------------
create or replace function public.current_app_user_id()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select id from public.app_users where auth_user_id = auth.uid() limit 1;
$$;

create or replace function public.current_access_level()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select access_level from public.app_users where auth_user_id = auth.uid() limit 1;
$$;

create or replace function public.is_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select access_level = 'manager' from public.app_users where auth_user_id = auth.uid()),
    false
  );
$$;

-- ---------------------------------------------------------------------------
-- Drop dev policies (001–004)
-- ---------------------------------------------------------------------------
drop policy if exists "dev_allow_all_app_users" on public.app_users;
drop policy if exists "dev_allow_all_ideas" on public.ideas;
drop policy if exists "dev_allow_all_chat_messages" on public.chat_messages;
drop policy if exists "dev_allow_all_chat_read_cursors" on public.chat_read_cursors;
drop policy if exists "dev_allow_all_audit_log" on public.audit_log;
drop policy if exists "dev_allow_all_user_preferences" on public.user_preferences;

-- ---------------------------------------------------------------------------
-- app_users — קריאה לכל מחובר; כתיבה למנהל בלבד
-- anon: רק דרך view app_users_public (ללא password_hash)
-- ---------------------------------------------------------------------------
create policy "app_users_select_authenticated"
  on public.app_users for select
  to authenticated
  using (true);

create policy "app_users_insert_manager"
  on public.app_users for insert
  to authenticated
  with check (public.is_manager());

create policy "app_users_update_manager"
  on public.app_users for update
  to authenticated
  using (public.is_manager())
  with check (public.is_manager());

create policy "app_users_delete_manager"
  on public.app_users for delete
  to authenticated
  using (public.is_manager());

-- RPC התחברות — בודק hash בצד השרver (לא חושף password_hash ללקוח)
-- digest/encode מ-pgcrypto (ב-Supabase: schema extensions)
create extension if not exists pgcrypto with schema extensions;

create or replace function public.login_with_password(p_password text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_hash text;
  v_matches int;
  v_user record;
begin
  if p_password is null or length(trim(p_password)) = 0 then
    return jsonb_build_object('ok', false, 'error', 'empty_password');
  end if;
  v_hash := encode(digest(trim(p_password) || ':ideaflow-local-v1', 'sha256'::text), 'hex');
  select count(*) into v_matches
  from public.app_users
  where password_hash = v_hash and active = true and access_level != 'guest';
  if v_matches > 1 then
    return jsonb_build_object('ok', false, 'error', 'ambiguous');
  end if;
  select id, email, access_level into v_user
  from public.app_users
  where password_hash = v_hash and active = true and access_level != 'guest'
  limit 1;
  if v_user.id is null then
    return jsonb_build_object('ok', false, 'error', 'invalid');
  end if;
  return jsonb_build_object(
    'ok', true,
    'userId', v_user.id,
    'email', v_user.email,
    'accessLevel', v_user.access_level
  );
end;
$$;

grant execute on function public.login_with_password(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- ideas
-- ---------------------------------------------------------------------------
create policy "ideas_select"
  on public.ideas for select
  to authenticated, anon
  using (
    public.is_manager()
    or created_by_user_id = public.current_app_user_id()
    or assignee_user_id = public.current_app_user_id()
    or (
      public.current_access_level() = 'member'
      and exists (
        select 1 from public.app_users cu
        where cu.id = ideas.created_by_user_id
          and cu.access_level in ('manager', 'member')
      )
    )
    or (
      public.current_access_level() is null
      and guest_session_id is not null
    )
  );

create policy "ideas_insert"
  on public.ideas for insert
  to authenticated, anon
  with check (
    public.current_app_user_id() is not null
    or guest_session_id is not null
  );

create policy "ideas_update"
  on public.ideas for update
  to authenticated, anon
  using (
    public.is_manager()
    or created_by_user_id = public.current_app_user_id()
    or assignee_user_id = public.current_app_user_id()
  )
  with check (true);

create policy "ideas_delete"
  on public.ideas for delete
  to authenticated, anon
  using (
    public.is_manager()
    or created_by_user_id = public.current_app_user_id()
  );

-- ---------------------------------------------------------------------------
-- chat_messages
-- ---------------------------------------------------------------------------
create policy "chat_select"
  on public.chat_messages for select
  to authenticated, anon
  using (deleted_at is null or sender_user_id = public.current_app_user_id());

create policy "chat_insert"
  on public.chat_messages for insert
  to authenticated, anon
  with check (sender_user_id = public.current_app_user_id() or guest_session_id is not null);

create policy "chat_update_own"
  on public.chat_messages for update
  to authenticated, anon
  using (sender_user_id = public.current_app_user_id())
  with check (sender_user_id = public.current_app_user_id());

-- ---------------------------------------------------------------------------
-- chat_read_cursors, audit_log, user_preferences
-- ---------------------------------------------------------------------------
create policy "cursors_own"
  on public.chat_read_cursors for all
  to authenticated, anon
  using (user_id = public.current_app_user_id())
  with check (user_id = public.current_app_user_id());

create policy "audit_select"
  on public.audit_log for select
  to authenticated
  using (public.is_manager() or actor_user_id = public.current_app_user_id());

create policy "audit_insert"
  on public.audit_log for insert
  to authenticated, anon
  with check (true);

create policy "prefs_own"
  on public.user_preferences for all
  to authenticated
  using (user_id = public.current_app_user_id())
  with check (user_id = public.current_app_user_id());

create policy "prefs_anon_read"
  on public.user_preferences for select
  to anon
  using (true);

create policy "prefs_anon_upsert"
  on public.user_preferences for insert
  to anon
  with check (true);

create policy "prefs_anon_update"
  on public.user_preferences for update
  to anon
  using (true);
