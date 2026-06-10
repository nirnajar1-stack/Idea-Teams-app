-- Ogen 028 — תור ביצוע מאסטר + בדיקות שוטפות בטיימליין

alter table public.ideas
  add column if not exists sent_to_execution boolean not null default false,
  add column if not exists sent_to_execution_at timestamptz,
  add column if not exists check_cadence text
    check (check_cadence is null or check_cadence in ('daily', 'every_3_days', 'weekly')),
  add column if not exists last_checked_at date;

comment on column public.ideas.sent_to_execution is 'מאסטר — נשלח לתור ביצוע';
comment on column public.ideas.sent_to_execution_at is 'מועד שליחה לתור ביצוע';
comment on column public.ideas.check_cadence is 'תדירות בדיקה שוטפת (ללא תלות ביום בטיימליין)';
comment on column public.ideas.last_checked_at is 'תאריך בדיקה אחרונה לבדיקות שוטפות';

-- insert RPC
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
  v_row public.ideas;
begin
  v_uid := coalesce(public.current_app_user_id(), nullif(trim(p_user_id), ''));
  if v_uid is null then
    raise exception 'user required';
  end if;

  insert into public.ideas (
    id, external_id, title, description, category, department, idea_source,
    priority, workflow_status, created_at, target_start_date, planned_date,
    send_to_maybe_inbox, sent_to_execution, sent_to_execution_at,
    check_cadence, last_checked_at,
    created_by_user_id, guest_session_id,
    author_name, author_role, author_initials, tags, goals, attachments,
    progress, progress_step, concept_image_url, idea_kind, parent_id,
    assignee_user_id, visibility
  )
  values (
    p_idea->>'id',
    p_idea->>'external_id',
    p_idea->>'title',
    p_idea->>'description',
    p_idea->>'category',
    coalesce(p_idea->>'department', ''),
    coalesce(nullif(p_idea->>'idea_source', ''), 'mitamim'),
    coalesce(p_idea->>'priority', 'medium'),
    coalesce(p_idea->>'workflow_status', 'pending'),
    coalesce((p_idea->>'created_at')::date, current_date),
    coalesce((p_idea->>'target_start_date')::date, current_date),
    case when p_idea ? 'planned_date' then nullif(p_idea->>'planned_date', '')::date else null end,
    coalesce((p_idea->>'send_to_maybe_inbox')::boolean, false),
    coalesce((p_idea->>'sent_to_execution')::boolean, false),
    case when p_idea ? 'sent_to_execution_at' then nullif(p_idea->>'sent_to_execution_at', '')::timestamptz else null end,
    nullif(p_idea->>'check_cadence', ''),
    case when p_idea ? 'last_checked_at' then nullif(p_idea->>'last_checked_at', '')::date else null end,
    coalesce(nullif(p_idea->>'created_by_user_id', ''), v_uid),
    nullif(p_idea->>'guest_session_id', ''),
    coalesce(p_idea->>'author_name', ''),
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

-- update RPC
create or replace function public.update_idea_for_session(
  p_user_id text,
  p_idea_id text,
  p_patch jsonb
)
returns public.ideas
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid text;
  v_level text;
  v_row public.ideas;
begin
  v_uid := coalesce(public.current_app_user_id(), nullif(trim(p_user_id), ''));
  if v_uid is null then
    raise exception 'user required';
  end if;

  select access_level into v_level
  from public.app_users
  where id = v_uid and active = true;

  if v_level is null then
    raise exception 'user not found';
  end if;

  select * into v_row from public.ideas where id = p_idea_id;
  if not found then
    raise exception 'idea not found';
  end if;

  if not (
    v_level = 'manager'
    or v_level = 'master'
    or v_row.created_by_user_id = v_uid
    or v_row.assignee_user_id = v_uid
  ) then
    raise exception 'not allowed to update idea';
  end if;

  if v_level = 'master'
     and coalesce(v_row.visibility, 'team') = 'master_private'
     and v_row.created_by_user_id <> v_uid then
    raise exception 'not allowed to update idea';
  end if;

  update public.ideas i
  set
    external_id = coalesce(p_patch->>'external_id', i.external_id),
    title = coalesce(p_patch->>'title', i.title),
    description = coalesce(p_patch->>'description', i.description),
    category = coalesce(p_patch->>'category', i.category),
    department = coalesce(p_patch->>'department', i.department),
    idea_source = coalesce(nullif(p_patch->>'idea_source', ''), i.idea_source),
    priority = coalesce(p_patch->>'priority', i.priority),
    workflow_status = coalesce(p_patch->>'workflow_status', i.workflow_status),
    created_at = coalesce((p_patch->>'created_at')::date, i.created_at),
    target_start_date = coalesce((p_patch->>'target_start_date')::date, i.target_start_date),
    planned_date = case
      when p_patch ? 'planned_date' then nullif(p_patch->>'planned_date', '')::date
      else i.planned_date
    end,
    send_to_maybe_inbox = coalesce((p_patch->>'send_to_maybe_inbox')::boolean, i.send_to_maybe_inbox),
    sent_to_execution = coalesce((p_patch->>'sent_to_execution')::boolean, i.sent_to_execution),
    sent_to_execution_at = case
      when p_patch ? 'sent_to_execution_at' then nullif(p_patch->>'sent_to_execution_at', '')::timestamptz
      else i.sent_to_execution_at
    end,
    check_cadence = case
      when p_patch ? 'check_cadence' then nullif(p_patch->>'check_cadence', '')
      else i.check_cadence
    end,
    last_checked_at = case
      when p_patch ? 'last_checked_at' then nullif(p_patch->>'last_checked_at', '')::date
      else i.last_checked_at
    end,
    author_name = coalesce(p_patch->>'author_name', i.author_name),
    author_role = coalesce(p_patch->>'author_role', i.author_role),
    author_initials = coalesce(p_patch->>'author_initials', i.author_initials),
    tags = coalesce(p_patch->'tags', i.tags),
    goals = coalesce(p_patch->'goals', i.goals),
    attachments = coalesce(p_patch->'attachments', i.attachments),
    progress = coalesce((p_patch->>'progress')::integer, i.progress),
    progress_step = coalesce(p_patch->>'progress_step', i.progress_step),
    concept_image_url = case
      when p_patch ? 'concept_image_url' then nullif(p_patch->>'concept_image_url', '')
      else i.concept_image_url
    end,
    idea_kind = coalesce(p_patch->>'idea_kind', i.idea_kind),
    parent_id = case
      when p_patch ? 'parent_id' then nullif(p_patch->>'parent_id', '')
      else i.parent_id
    end,
    assignee_user_id = case
      when p_patch ? 'assignee_user_id' then nullif(p_patch->>'assignee_user_id', '')
      else i.assignee_user_id
    end,
    visibility = coalesce(p_patch->>'visibility', i.visibility)
  where i.id = p_idea_id
  returning * into v_row;

  return v_row;
end;
$$;

notify pgrst, 'reload schema';
