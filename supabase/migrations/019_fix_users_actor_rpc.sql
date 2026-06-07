-- IdeaFlow 019 — תיקון זיהוי מנהל ב-RPC משתמשים (JWT ישן לא חוסם)
-- הרץ אם 018 לא עזר לשמירת משתמשים

alter table public.app_users drop constraint if exists app_users_access_level_check;
alter table public.app_users add constraint app_users_access_level_check
  check (access_level in ('manager', 'member', 'guest', 'master'));

create or replace function public.assert_manager_actor(p_actor_user_id text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor text;
  v_jwt text;
begin
  -- אפליקציה מתחברת ב-login_with_password — מזהה הסשן מהלקוח קודם ל-JWT
  v_actor := nullif(trim(p_actor_user_id), '');
  v_jwt := public.current_app_user_id();

  if v_actor is null then
    v_actor := v_jwt;
  end if;

  if v_actor is null then
    raise exception 'actor user required';
  end if;

  if not exists (
    select 1 from public.app_users
    where id = v_actor
      and access_level in ('manager', 'master')
      and active = true
  ) then
    raise exception 'only active manager can manage users (actor=%)', v_actor;
  end if;

  return v_actor;
end;
$$;

grant execute on function public.assert_manager_actor(text) to anon, authenticated;

notify pgrst, 'reload schema';
