-- Ogen 024 — תיקון עדכון סיסמה: לא לדרוס כש-password_hash חסר או ריק ב-patch

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
    name = case when p_patch ? 'name' then p_patch->>'name' else u.name end,
    job_title = case when p_patch ? 'job_title' then p_patch->>'job_title' else u.job_title end,
    initials = case when p_patch ? 'initials' then p_patch->>'initials' else u.initials end,
    email = case when p_patch ? 'email' then p_patch->>'email' else u.email end,
    username = case when p_patch ? 'username' then lower(p_patch->>'username') else u.username end,
    password_hash = case
      when p_patch ? 'password_hash'
        and nullif(trim(p_patch->>'password_hash'), '') is not null
        then p_patch->>'password_hash'
      else u.password_hash
    end,
    access_level = case when p_patch ? 'access_level' then p_patch->>'access_level' else u.access_level end,
    active = case when p_patch ? 'active' then (p_patch->>'active')::boolean else u.active end,
    phone = case
      when p_patch ? 'phone' then nullif(trim(p_patch->>'phone'), '')
      else u.phone
    end
  where u.id = p_user_id
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.update_app_user_for_session(text, text, jsonb) to anon, authenticated;

notify pgrst, 'reload schema';
