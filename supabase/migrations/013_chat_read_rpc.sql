-- IdeaFlow 013 — סימון "נקרא" בצ'אט דרך RPC (עוקף RLS בלי JWT)
-- הרץ אם התראות/צ'אט נשארים "לא נקראו" אחרי פתיחה

create or replace function public.mark_chat_read_for_session(
  p_user_id text,
  p_scope text,
  p_idea_id text default null
)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid text;
  v_now timestamptz := now();
  v_id uuid;
begin
  v_uid := coalesce(public.current_app_user_id(), nullif(trim(p_user_id), ''));
  if v_uid is null then
    raise exception 'user required';
  end if;

  if p_scope = 'general' then
    select id into v_id
    from public.chat_read_cursors
    where user_id = v_uid and scope = 'general';

    if v_id is not null then
      update public.chat_read_cursors
      set last_read_at = v_now
      where id = v_id;
    else
      insert into public.chat_read_cursors (user_id, scope, idea_id, last_read_at)
      values (v_uid, 'general', null, v_now);
    end if;
  elsif p_scope = 'idea' then
    if p_idea_id is null or trim(p_idea_id) = '' then
      raise exception 'idea_id required for idea scope';
    end if;

    select id into v_id
    from public.chat_read_cursors
    where user_id = v_uid and scope = 'idea' and idea_id = p_idea_id;

    if v_id is not null then
      update public.chat_read_cursors
      set last_read_at = v_now
      where id = v_id;
    else
      insert into public.chat_read_cursors (user_id, scope, idea_id, last_read_at)
      values (v_uid, 'idea', p_idea_id, v_now);
    end if;
  else
    raise exception 'invalid scope: %', p_scope;
  end if;

  return v_now;
end;
$$;

create or replace function public.list_chat_read_cursors_for_session(
  p_user_id text default null
)
returns table (
  scope text,
  idea_id text,
  last_read_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid text;
begin
  v_uid := coalesce(public.current_app_user_id(), nullif(trim(p_user_id), ''));

  if v_uid is null then
    return;
  end if;

  return query
  select c.scope, c.idea_id, c.last_read_at
  from public.chat_read_cursors c
  where c.user_id = v_uid;
end;
$$;

grant execute on function public.mark_chat_read_for_session(text, text, text) to anon, authenticated;
grant execute on function public.list_chat_read_cursors_for_session(text) to anon, authenticated;
