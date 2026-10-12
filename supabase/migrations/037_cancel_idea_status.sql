-- ביטול בקשה/רעיון (סטטוס cancelled + סיבה) — נשאר במערכת, לא מחיקה

alter table public.ideas drop constraint if exists ideas_workflow_status_check;

alter table public.ideas
  add constraint ideas_workflow_status_check
  check (workflow_status in ('in_progress', 'completed', 'pending', 'cancelled'));

alter table public.ideas
  add column if not exists cancel_reason text,
  add column if not exists cancelled_at timestamptz;

comment on column public.ideas.cancel_reason is 'סיבת ביטול הבקשה/רעיון';
comment on column public.ideas.cancelled_at is 'מועד הביטול';

-- עדכון RPC כדי לשמור cancel_reason / cancelled_at
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

  if v_level = 'manager' or v_level = 'master' then
    if coalesce(v_row.visibility, 'team') = 'master_private'
       and v_row.created_by_user_id <> v_uid
       and v_level <> 'master' then
      raise exception 'not allowed to update idea';
    end if;
    if v_level = 'master'
       and coalesce(v_row.visibility, 'team') = 'master_private'
       and v_row.created_by_user_id <> v_uid then
      raise exception 'not allowed to update idea';
    end if;
  elsif v_row.created_by_user_id <> v_uid
        and not public.is_idea_assignee(v_row, v_uid) then
    raise exception 'not allowed to update idea';
  end if;

  update public.ideas i set
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
    assignee_user_ids = case
      when p_patch ? 'assignee_user_ids' then coalesce(
        (select array_agg(x) from jsonb_array_elements_text(p_patch->'assignee_user_ids') t(x)),
        '{}'::text[]
      )
      else i.assignee_user_ids
    end,
    assignee_group_ids = case
      when p_patch ? 'assignee_group_ids' then coalesce(
        (select array_agg(x) from jsonb_array_elements_text(p_patch->'assignee_group_ids') t(x)),
        '{}'::text[]
      )
      else i.assignee_group_ids
    end,
    visibility = coalesce(p_patch->>'visibility', i.visibility),
    cancel_reason = case
      when p_patch ? 'cancel_reason' then nullif(p_patch->>'cancel_reason', '')
      else i.cancel_reason
    end,
    cancelled_at = case
      when p_patch ? 'cancelled_at' then nullif(p_patch->>'cancelled_at', '')::timestamptz
      else i.cancelled_at
    end
  where i.id = p_idea_id
  returning * into v_row;

  return v_row;
end;
$$;
