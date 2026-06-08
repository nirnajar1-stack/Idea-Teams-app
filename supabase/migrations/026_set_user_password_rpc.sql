-- Ogen 026 — עדכון סיסמה בשרת (אותו hash כמו login_with_password)
-- פותר מקרים שבהם password_hash לא נשמר דרך p_patch

create extension if not exists pgcrypto with schema extensions;

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

  update public.app_users u
  set password_hash = v_hash
  where u.id = p_user_id
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.set_app_user_password_for_session(text, text, text) to anon, authenticated;

notify pgrst, 'reload schema';
