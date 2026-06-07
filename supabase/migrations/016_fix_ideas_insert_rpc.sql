-- IdeaFlow 016 — תיקון insert רעיונות (עמודות חסרות + זיהוי משתמש)
-- הרץ אם 015 לא עזר או מקבלים creator mismatch / column does not exist

alter table public.ideas
  add column if not exists assignee_user_id text
    references public.app_users (id) on delete set null;

alter table public.ideas
  add column if not exists visibility text not null default 'team';

alter table public.ideas drop constraint if exists ideas_visibility_check;
alter table public.ideas add constraint ideas_visibility_check
  check (visibility in ('team', 'managers_only', 'master_private'));

create or replace function public.insert_idea_for_session(
  p_user_id text,
  p_idea jsonb
)
returns public.ideas
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid text;
  v_level text;
  v_creator text;
  v_guest text;
  v_row public.ideas;
begin
  v_uid := coalesce(public.current_app_user_id(), nullif(trim(p_user_id), ''));
  v_guest := nullif(trim(p_idea->>'guest_session_id'), '');

  if public.current_app_user_id() is not null then
    v_creator := public.current_app_user_id();
  else
    v_creator := coalesce(
      nullif(trim(p_idea->>'created_by_user_id'), ''),
      v_uid
    );
  end if;

  if v_creator is null and v_guest is null then
    raise exception 'authentication required';
  end if;

  if v_creator is not null and not exists (
    select 1 from public.app_users where id = v_creator and active = true
  ) then
    raise exception 'creator not found in app_users (id=%)', v_creator;
  end if;

  select access_level into v_level
  from public.app_users
  where id = v_creator;

  if coalesce(p_idea->>'visibility', 'team') = 'master_private'
     and coalesce(v_level, '') <> 'master' then
    raise exception 'only master can create private ideas';
  end if;

  insert into public.ideas (
    id,
    external_id,
    title,
    description,
    category,
    department,
    priority,
    workflow_status,
    created_at,
    target_start_date,
    send_to_maybe_inbox,
    created_by_user_id,
    guest_session_id,
    author_name,
    author_role,
    author_initials,
    tags,
    goals,
    attachments,
    progress,
    progress_step,
    concept_image_url,
    idea_kind,
    parent_id,
    assignee_user_id,
    visibility
  )
  values (
    p_idea->>'id',
    p_idea->>'external_id',
    p_idea->>'title',
    p_idea->>'description',
    p_idea->>'category',
    p_idea->>'department',
    p_idea->>'priority',
    coalesce(p_idea->>'workflow_status', 'pending'),
    coalesce((p_idea->>'created_at')::date, current_date),
    coalesce((p_idea->>'target_start_date')::date, current_date),
    coalesce((p_idea->>'send_to_maybe_inbox')::boolean, false),
    v_creator,
    v_guest,
    coalesce(p_idea->>'author_name', 'משתמש'),
    coalesce(p_idea->>'author_role', ''),
    coalesce(p_idea->>'author_initials', ''),
    coalesce(p_idea->'tags', '[]'::jsonb),
    coalesce(p_idea->'goals', '[]'::jsonb),
    coalesce(p_idea->'attachments', '[]'::jsonb),
    coalesce((p_idea->>'progress')::integer, 0),
    coalesce(p_idea->>'progress_step', ''),
    nullif(p_idea->>'concept_image_url', ''),
    coalesce(p_idea->>'idea_kind', 'standard'),
    nullif(p_idea->>'parent_id', ''),
    nullif(p_idea->>'assignee_user_id', ''),
    coalesce(p_idea->>'visibility', 'team')
  )
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.insert_idea_for_session(text, jsonb) to anon, authenticated;
