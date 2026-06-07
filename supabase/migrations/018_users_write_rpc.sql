-- IdeaFlow 018 — יצירה/עדכון/מחיקת משתמשים דרך RPC (עוקף RLS בלי JWT)
-- הרץ אם שמירת משתמשים במסך /users נכשלת

create or replace function public.assert_manager_actor(p_actor_user_id text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor text;
begin
  v_actor := coalesce(public.current_app_user_id(), nullif(trim(p_actor_user_id), ''));

  if v_actor is null then
    raise exception 'actor user required';
  end if;

  if not exists (
    select 1 from public.app_users
    where id = v_actor
      and access_level = 'manager'
      and active = true
  ) then
    raise exception 'only active manager can manage users';
  end if;

  return v_actor;
end;
$$;

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
    id,
    name,
    job_title,
    initials,
    email,
    username,
    password_hash,
    access_level,
    active
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
    coalesce((p_user->>'active')::boolean, true)
  )
  returning * into v_row;

  return v_row;
end;
$$;

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
  v_actor text;
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
    active = coalesce((p_patch->>'active')::boolean, u.active)
  where u.id = p_user_id
  returning * into v_row;

  return v_row;
end;
$$;

create or replace function public.delete_app_user_for_session(
  p_actor_user_id text,
  p_user_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_managers integer;
begin
  perform public.assert_manager_actor(p_actor_user_id);

  if not exists (select 1 from public.app_users where id = p_user_id) then
    raise exception 'user not found';
  end if;

  select count(*) into v_managers
  from public.app_users
  where access_level = 'manager' and active = true;

  if v_managers <= 1 and exists (
    select 1 from public.app_users
    where id = p_user_id and access_level = 'manager' and active = true
  ) then
    raise exception 'cannot delete last active manager';
  end if;

  delete from public.app_users where id = p_user_id;
end;
$$;

grant execute on function public.assert_manager_actor(text) to anon, authenticated;
grant execute on function public.insert_app_user_for_session(text, jsonb) to anon, authenticated;
grant execute on function public.update_app_user_for_session(text, text, jsonb) to anon, authenticated;
grant execute on function public.delete_app_user_for_session(text, text) to anon, authenticated;

notify pgrst, 'reload schema';
