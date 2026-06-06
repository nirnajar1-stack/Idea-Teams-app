-- IdeaFlow 010 — רמת מאסטר + visibility לרעיונות + RLS מעודכן

-- ---------------------------------------------------------------------------
-- רמת מאסטר ב-app_users
-- ---------------------------------------------------------------------------
alter table public.app_users drop constraint if exists app_users_access_level_check;
alter table public.app_users add constraint app_users_access_level_check
  check (access_level in ('manager', 'member', 'guest', 'master'));

-- ---------------------------------------------------------------------------
-- visibility על ideas
-- team           — פתוח לכל המשתמשים (members + managers + master)
-- managers_only  — מנהלים + מאסטר (לא members)
-- master_private — רק יוצר מאסטר (אפילו מנהלים לא רואים)
-- ---------------------------------------------------------------------------
alter table public.ideas
  add column if not exists visibility text not null default 'team'
    check (visibility in ('team', 'managers_only', 'master_private'));

create index if not exists ideas_visibility_idx on public.ideas (visibility);

-- ---------------------------------------------------------------------------
-- פונקציית נראות — מקור אמת ל-RLS
-- ---------------------------------------------------------------------------
create or replace function public.idea_visible_to_current_user(p_idea public.ideas)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid text;
  v_level text;
begin
  v_uid := public.current_app_user_id();
  v_level := public.current_access_level();

  -- יוצר / מוקצה תמיד רואים (גם master_private)
  if p_idea.created_by_user_id = v_uid then
    return true;
  end if;
  if p_idea.assignee_user_id = v_uid then
    return true;
  end if;

  if p_idea.visibility = 'master_private' then
    return false;
  end if;

  -- ללא JWT (התחברות בסיסמה בלבד) — גיבוי
  if v_uid is null then
    return p_idea.guest_session_id is not null
      or p_idea.created_by_user_id in (
        select id from public.app_users where active = true
      );
  end if;

  -- מנהל / מאסטר — רואים הכל חוץ מ-master_private של אחרים
  if v_level in ('manager', 'master') then
    return true;
  end if;

  -- משתמש (member) — רק רעיונות team
  if v_level = 'member' then
    if p_idea.visibility = 'managers_only' then
      return false;
    end if;
    if p_idea.visibility = 'team' then
      return true;
    end if;
  end if;

  return false;
end;
$$;

-- ---------------------------------------------------------------------------
-- עדכון policies ל-ideas
-- ---------------------------------------------------------------------------
drop policy if exists "ideas_select" on public.ideas;
drop policy if exists "ideas_select_authenticated_team" on public.ideas;
drop policy if exists "ideas_select_guest_anon" on public.ideas;
drop policy if exists "ideas_select_anon_creator" on public.ideas;

create policy "ideas_select_visible"
  on public.ideas for select
  to authenticated, anon
  using (public.idea_visible_to_current_user(ideas.*));

drop policy if exists "ideas_insert" on public.ideas;
create policy "ideas_insert"
  on public.ideas for insert
  to authenticated, anon
  with check (
    public.current_app_user_id() is not null
    or guest_session_id is not null
  );

drop policy if exists "ideas_update" on public.ideas;
create policy "ideas_update"
  on public.ideas for update
  to authenticated, anon
  using (
    public.is_manager()
    or public.current_access_level() = 'master' and created_by_user_id = public.current_app_user_id()
    or created_by_user_id = public.current_app_user_id()
    or assignee_user_id = public.current_app_user_id()
  )
  with check (true);

drop policy if exists "ideas_delete" on public.ideas;
create policy "ideas_delete"
  on public.ideas for delete
  to authenticated, anon
  using (
    (public.is_manager() and visibility != 'master_private')
    or created_by_user_id = public.current_app_user_id()
  );

-- is_manager helper — מנהל בלבד (לא מאסטר)
-- (נשאר כפי שהוא; מאסטר נבדק בנפרד)

create or replace function public.is_master()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select access_level = 'master' from public.app_users where auth_user_id = auth.uid()),
    false
  );
$$;
