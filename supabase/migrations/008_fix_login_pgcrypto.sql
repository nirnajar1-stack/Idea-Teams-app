-- תיקון login_with_password — digest דורש pgcrypto (schema extensions ב-Supabase)
-- הרץ אם קיבלת: function digest(text, unknown) does not exist

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
