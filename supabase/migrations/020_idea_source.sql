-- Ogen 020 — מקור רעיון (idea_source)
-- הרץ ב-Supabase SQL Editor

alter table public.ideas
  add column if not exists idea_source text not null default 'mitamim';

alter table public.ideas drop constraint if exists ideas_idea_source_check;
alter table public.ideas add constraint ideas_idea_source_check
  check (idea_source in (
    'mitamim',
    'families_division',
    'headquarters',
    'services',
    'government_offices'
  ));

update public.ideas set idea_source = 'mitamim' where idea_source is null;

-- insert RPC — כולל idea_source
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
  v_creator := nullif(trim(p_idea->>'created_by_user_id'), '');
  v_guest := nullif(trim(p_idea->>'guest_session_id'), '');

  if v_creator is null then
    raise exception 'created_by_user_id required';
  end if;

  if v_uid is null and v_guest is null then
    raise exception 'authentication required';
  end if;

  if public.current_app_user_id() is not null
     and public.current_app_user_id() <> v_creator then
    raise exception 'creator mismatch';
  end if;

  if v_uid is not null and v_creator <> v_uid then
    raise exception 'creator mismatch';
  end if;

  if not exists (
    select 1 from public.app_users where id = v_creator and active = true
  ) then
    raise exception 'creator not found';
  end if;

  select access_level into v_level
  from public.app_users
  where id = v_creator;

  if coalesce(p_idea->>'visibility', 'team') = 'master_private'
     and v_level <> 'master' then
    raise exception 'only master can create private ideas';
  end if;

  insert into public.ideas (
    id,
    external_id,
    title,
    description,
    category,
    department,
    idea_source,
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
    coalesce(nullif(p_idea->>'idea_source', ''), 'mitamim'),
    p_idea->>'priority',
    coalesce(p_idea->>'workflow_status', 'pending'),
    (p_idea->>'created_at')::date,
    (p_idea->>'target_start_date')::date,
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

-- update RPC — כולל idea_source
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
    or (v_level = 'master' and v_row.created_by_user_id = v_uid)
    or v_row.created_by_user_id = v_uid
    or v_row.assignee_user_id = v_uid
  ) then
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
    send_to_maybe_inbox = coalesce((p_patch->>'send_to_maybe_inbox')::boolean, i.send_to_maybe_inbox),
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

grant execute on function public.insert_idea_for_session(text, jsonb) to anon, authenticated;
grant execute on function public.update_idea_for_session(text, text, jsonb) to anon, authenticated;
