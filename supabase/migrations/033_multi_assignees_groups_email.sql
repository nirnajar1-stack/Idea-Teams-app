-- Multi-assignees + groups + email exclusions + email send log
-- Removes dependency on WhatsApp for completion notifications

-- ── Groups ──────────────────────────────────────────────────────────
create table if not exists public.app_groups (
  id text primary key,
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  created_by_user_id text references public.app_users(id) on delete set null
);

create table if not exists public.app_group_members (
  group_id text not null references public.app_groups(id) on delete cascade,
  user_id text not null references public.app_users(id) on delete cascade,
  primary key (group_id, user_id)
);

create index if not exists app_group_members_user_idx on public.app_group_members(user_id);

alter table public.app_groups enable row level security;
alter table public.app_group_members enable row level security;

drop policy if exists "app_groups_select" on public.app_groups;
create policy "app_groups_select" on public.app_groups for select to authenticated, anon using (true);
drop policy if exists "app_groups_write" on public.app_groups;
create policy "app_groups_write" on public.app_groups for all to authenticated, anon using (true) with check (true);

drop policy if exists "app_group_members_select" on public.app_group_members;
create policy "app_group_members_select" on public.app_group_members for select to authenticated, anon using (true);
drop policy if exists "app_group_members_write" on public.app_group_members;
create policy "app_group_members_write" on public.app_group_members for all to authenticated, anon using (true) with check (true);

-- ── Multi assignees on ideas ────────────────────────────────────────
alter table public.ideas
  add column if not exists assignee_user_ids text[] not null default '{}',
  add column if not exists assignee_group_ids text[] not null default '{}';

update public.ideas
set assignee_user_ids = array[assignee_user_id]
where assignee_user_id is not null
  and (assignee_user_ids is null or cardinality(assignee_user_ids) = 0);

-- ── Email exclusions (user or group) ────────────────────────────────
create table if not exists public.email_completion_exclusions (
  id text primary key,
  subject_type text not null check (subject_type in ('user', 'group')),
  subject_id text not null,
  created_at timestamptz not null default now(),
  created_by_user_id text references public.app_users(id) on delete set null,
  unique (subject_type, subject_id)
);

alter table public.email_completion_exclusions enable row level security;
drop policy if exists "email_exclusions_select" on public.email_completion_exclusions;
create policy "email_exclusions_select" on public.email_completion_exclusions for select to authenticated, anon using (true);
drop policy if exists "email_exclusions_write" on public.email_completion_exclusions;
create policy "email_exclusions_write" on public.email_completion_exclusions for all to authenticated, anon using (true) with check (true);

-- ── Email send log ──────────────────────────────────────────────────
create table if not exists public.email_send_log (
  id text primary key,
  idea_id text references public.ideas(id) on delete set null,
  actor_user_id text,
  actor_name text,
  recipient_user_id text,
  recipient_email text not null,
  recipient_name text,
  role text,
  status text not null check (status in ('sent', 'skipped', 'failed')),
  reason text,
  provider_id text,
  idea_title text,
  created_at timestamptz not null default now()
);

create index if not exists email_send_log_created_idx on public.email_send_log(created_at desc);
create index if not exists email_send_log_idea_idx on public.email_send_log(idea_id);

alter table public.email_send_log enable row level security;
drop policy if exists "email_send_log_select" on public.email_send_log;
create policy "email_send_log_select" on public.email_send_log for select to authenticated, anon using (true);
drop policy if exists "email_send_log_insert" on public.email_send_log;
create policy "email_send_log_insert" on public.email_send_log for insert to authenticated, anon with check (true);

-- ── Helper: is user an assignee (direct or via group) ───────────────
create or replace function public.is_idea_assignee(p_idea public.ideas, p_user_id text)
returns boolean
language sql
stable
as $$
  select
    p_user_id is not null
    and (
      p_idea.assignee_user_id = p_user_id
      or p_user_id = any(coalesce(p_idea.assignee_user_ids, '{}'))
      or exists (
        select 1
        from public.app_group_members m
        where m.user_id = p_user_id
          and m.group_id = any(coalesce(p_idea.assignee_group_ids, '{}'))
      )
    );
$$;

-- ── Update RPC to support multi-assignee columns + assignee check ──
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
    visibility = coalesce(p_patch->>'visibility', i.visibility)
  where i.id = p_idea_id
  returning * into v_row;

  return v_row;
end;
$$;
