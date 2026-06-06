-- תיקון: מאסטר/מנהל לא רואים רעיונות כש-login ללא Supabase Auth JWT
-- הרץ אחרי 010 אם עדיין לא רואים רעיונות

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

  if p_idea.created_by_user_id = v_uid then
    return true;
  end if;
  if p_idea.assignee_user_id = v_uid then
    return true;
  end if;

  if p_idea.visibility = 'master_private' then
    return false;
  end if;

  if v_uid is null then
    return p_idea.guest_session_id is not null
      or p_idea.created_by_user_id in (
        select id from public.app_users where active = true
      );
  end if;

  if v_level in ('manager', 'master') then
    return true;
  end if;

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
