-- IdeaFlow 014 — שליחת הודעות צ'אט דרך RPC (עוקף RLS בלי JWT)
-- הרץ אם שליחת הודעה נכשלת עם "טבלת הצ'אט לא קיימת" או שגיאת הרשאות

create or replace function public.send_chat_message_for_session(
  p_user_id text,
  p_scope text,
  p_body text,
  p_idea_id text default null,
  p_guest_session_id text default null,
  p_author_name text default '',
  p_author_initials text default '',
  p_reply_to_user_id text default null,
  p_mentioned_user_ids jsonb default '[]'::jsonb
)
returns public.chat_messages
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid text;
  v_sender text;
  v_trimmed text;
  v_row public.chat_messages;
begin
  v_uid := coalesce(public.current_app_user_id(), nullif(trim(p_user_id), ''));
  v_sender := nullif(trim(p_user_id), '');
  v_trimmed := trim(p_body);

  if v_sender is null then
    raise exception 'user_id required';
  end if;

  if v_trimmed = '' or char_length(v_trimmed) > 4000 then
    raise exception 'invalid body length';
  end if;

  if p_scope not in ('general', 'idea') then
    raise exception 'invalid scope: %', p_scope;
  end if;

  if p_scope = 'idea' and (p_idea_id is null or trim(p_idea_id) = '') then
    raise exception 'idea_id required for idea scope';
  end if;

  if p_scope = 'general' and p_idea_id is not null and trim(p_idea_id) <> '' then
    raise exception 'idea_id must be null for general scope';
  end if;

  if public.current_app_user_id() is not null
     and public.current_app_user_id() <> v_sender then
    raise exception 'user mismatch';
  end if;

  if not exists (
    select 1 from public.app_users where id = v_sender and active = true
  ) then
    raise exception 'sender not found';
  end if;

  if p_scope = 'idea' and not exists (
    select 1 from public.ideas where id = p_idea_id
  ) then
    raise exception 'idea not found';
  end if;

  if v_uid is null
     and (p_guest_session_id is null or trim(p_guest_session_id) = '') then
    raise exception 'guest session required without authenticated user';
  end if;

  insert into public.chat_messages (
    scope,
    idea_id,
    sender_user_id,
    guest_session_id,
    author_name,
    author_initials,
    body,
    reply_to_user_id,
    mentioned_user_ids
  )
  values (
    p_scope,
    case when p_scope = 'idea' then p_idea_id else null end,
    v_sender,
    nullif(trim(p_guest_session_id), ''),
    coalesce(nullif(trim(p_author_name), ''), 'משתמש'),
    coalesce(nullif(trim(p_author_initials), ''), ''),
    v_trimmed,
    nullif(trim(p_reply_to_user_id), ''),
    coalesce(p_mentioned_user_ids, '[]'::jsonb)
  )
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.send_chat_message_for_session(
  text, text, text, text, text, text, text, text, jsonb
) to anon, authenticated;
