-- IdeaFlow 012 — טעינת רעיונות דרך RPC (עוקף בעיות RLS + JWT)
-- הרץ אם עדיין לא רואים רעיונות אחרי 011

create or replace function public.list_ideas_for_session(p_user_id text default null)
returns setof public.ideas
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid text;
  v_level text;
begin
  -- JWT מקושר, או מזהה מהאפליקציה אחרי login_with_password
  v_uid := coalesce(public.current_app_user_id(), nullif(trim(p_user_id), ''));

  if v_uid is not null then
    select access_level into v_level
    from public.app_users
    where id = v_uid and active = true;
  end if;

  return query
  select i.*
  from public.ideas i
  where
    (v_uid is not null and i.created_by_user_id = v_uid)
    or (v_uid is not null and i.assignee_user_id = v_uid)
    or (
      coalesce(i.visibility, 'team') <> 'master_private'
      and (
        v_level in ('manager', 'master')
        or (v_level = 'member' and coalesce(i.visibility, 'team') = 'team')
        or v_level is null
      )
    );
end;
$$;

grant execute on function public.list_ideas_for_session(text) to anon, authenticated;

-- וידוא שעמודת visibility קיימת (אם 010 לא הורץ)
alter table public.ideas
  add column if not exists visibility text not null default 'team';

alter table public.ideas drop constraint if exists ideas_visibility_check;
alter table public.ideas add constraint ideas_visibility_check
  check (visibility in ('team', 'managers_only', 'master_private'));
