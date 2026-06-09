-- Ogen 027 — סיסמה ייחודית לכל משתמש (התחברות לפי סיסמה בלבד)
-- מונע שמירת סיסמה שכבר בשימוש, ומחזיר שמות משתמשים בהתחברות כפולה

create or replace function public.assert_unique_password_hash(
  p_hash text,
  p_except_user_id text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conflicts text;
begin
  if p_hash is null or length(trim(p_hash)) = 0 then
    return;
  end if;

  select string_agg(name, ', ' order by name) into v_conflicts
  from public.app_users
  where password_hash = p_hash
    and active = true
    and coalesce(access_level, '') <> 'guest'
    and (p_except_user_id is null or id <> p_except_user_id);

  if v_conflicts is not null then
    raise exception 'password_already_used_by: %', v_conflicts;
  end if;
end;
$$;

create or replace function public.set_app_user_password_for_session(
  p_actor_user_id text,
  p_user_id text,
  p_password text
)
returns public.app_users
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_hash text;
  v_row public.app_users;
begin
  perform public.assert_manager_actor(p_actor_user_id);

  if p_password is null or length(trim(p_password)) < 4 then
    raise exception 'password must be at least 4 characters';
  end if;

  if not exists (select 1 from public.app_users where id = p_user_id) then
    raise exception 'user not found';
  end if;

  v_hash := encode(digest(trim(p_password) || ':ideaflow-local-v1', 'sha256'::text), 'hex');
  perform public.assert_unique_password_hash(v_hash, p_user_id);

  update public.app_users u
  set password_hash = v_hash
  where u.id = p_user_id
  returning * into v_row;

  return v_row;
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
  v_row public.app_users;
  v_hash text;
begin
  perform public.assert_manager_actor(p_actor_user_id);

  if coalesce(p_user->>'access_level', 'member') not in ('manager', 'member', 'master') then
    raise exception 'invalid access_level';
  end if;

  v_hash := nullif(trim(coalesce(p_user->>'password_hash', '')), '');
  perform public.assert_unique_password_hash(v_hash, null);

  insert into public.app_users (
    id,
    name,
    job_title,
    initials,
    email,
    username,
    password_hash,
    access_level,
    active,
    phone
  )
  values (
    p_user->>'id',
    p_user->>'name',
    p_user->>'job_title',
    coalesce(p_user->>'initials', ''),
    p_user->>'email',
    lower(p_user->>'username'),
    coalesce(v_hash, ''),
    p_user->>'access_level',
    coalesce((p_user->>'active')::boolean, true),
    nullif(trim(coalesce(p_user->>'phone', '')), '')
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
  v_row public.app_users;
  v_new_hash text;
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

  v_new_hash := case
    when p_patch ? 'password_hash'
      and nullif(trim(p_patch->>'password_hash'), '') is not null
      then trim(p_patch->>'password_hash')
    else null
  end;

  if v_new_hash is not null then
    perform public.assert_unique_password_hash(v_new_hash, p_user_id);
  end if;

  update public.app_users u
  set
    name = coalesce(p_patch->>'name', u.name),
    job_title = coalesce(p_patch->>'job_title', u.job_title),
    initials = coalesce(p_patch->>'initials', u.initials),
    email = coalesce(p_patch->>'email', u.email),
    username = coalesce(lower(p_patch->>'username'), u.username),
    phone = case
      when p_patch ? 'phone' then nullif(trim(p_patch->>'phone'), '')
      else u.phone
    end,
    password_hash = case
      when v_new_hash is not null then v_new_hash
      else u.password_hash
    end,
    access_level = coalesce(p_patch->>'access_level', u.access_level),
    active = coalesce((p_patch->>'active')::boolean, u.active)
  where u.id = p_user_id
  returning * into v_row;

  return v_row;
end;
$$;

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
  v_conflict_names text;
begin
  if p_password is null or length(trim(p_password)) = 0 then
    return jsonb_build_object('ok', false, 'error', 'empty_password');
  end if;

  v_hash := encode(digest(trim(p_password) || ':ideaflow-local-v1', 'sha256'::text), 'hex');

  select count(*) into v_matches
  from public.app_users
  where password_hash = v_hash and active = true and coalesce(access_level, '') <> 'guest';

  if v_matches > 1 then
    select string_agg(name, ', ' order by name) into v_conflict_names
    from public.app_users
    where password_hash = v_hash and active = true and coalesce(access_level, '') <> 'guest';

    return jsonb_build_object(
      'ok', false,
      'error', 'ambiguous',
      'conflictNames', v_conflict_names
    );
  end if;

  select id, email, access_level into v_user
  from public.app_users
  where password_hash = v_hash and active = true and coalesce(access_level, '') <> 'guest'
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

grant execute on function public.assert_unique_password_hash(text, text) to anon, authenticated;
grant execute on function public.set_app_user_password_for_session(text, text, text) to anon, authenticated;
grant execute on function public.insert_app_user_for_session(text, jsonb) to anon, authenticated;
grant execute on function public.update_app_user_for_session(text, text, jsonb) to anon, authenticated;
grant execute on function public.login_with_password(text) to anon, authenticated;

notify pgrst, 'reload schema';
