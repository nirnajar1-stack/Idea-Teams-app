-- מאסטר: עדכון ומחיקה של כל המשימות הגלויות (לא master_private של אחר)
-- מנהלים: עדכון (העברה, סימון הושלם) לכל משימה גלויה; ללא מחיקת משימות של אחרים

-- helpers (נדרשים ל-RLS; ייתכן שמיגרציות קודמות לא הורצו במלואן)
create or replace function public.current_app_user_id()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select id from public.app_users where auth_user_id = auth.uid() limit 1;
$$;

create or replace function public.current_access_level()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select access_level from public.app_users where auth_user_id = auth.uid() limit 1;
$$;

create or replace function public.is_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select access_level = 'manager' from public.app_users where auth_user_id = auth.uid()),
    false
  );
$$;

create or replace function public.is_master()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select access_level = 'master' from public.app_users where auth_user_id = auth.uid()),
    false
  );
$$;

drop policy if exists "ideas_update" on public.ideas;
create policy "ideas_update"
  on public.ideas for update
  to authenticated, anon
  using (
    public.is_manager()
    or (
      public.is_master()
      and not (
        coalesce(visibility, 'team') = 'master_private'
        and created_by_user_id <> public.current_app_user_id()
      )
    )
    or created_by_user_id = public.current_app_user_id()
    or assignee_user_id = public.current_app_user_id()
  )
  with check (true);

drop policy if exists "ideas_delete" on public.ideas;
create policy "ideas_delete"
  on public.ideas for delete
  to authenticated, anon
  using (
    (
      public.is_master()
      and not (
        coalesce(visibility, 'team') = 'master_private'
        and created_by_user_id <> public.current_app_user_id()
      )
    )
    or (
      created_by_user_id = public.current_app_user_id()
      and public.current_access_level() not in ('manager', 'master')
    )
  );

create or replace function public.delete_idea_for_session(
  p_user_id text,
  p_idea_id text
)
returns void
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

  if v_level = 'master' then
    if coalesce(v_row.visibility, 'team') = 'master_private'
       and v_row.created_by_user_id <> v_uid then
      raise exception 'not allowed to delete idea';
    end if;
  elsif v_level = 'manager' then
    raise exception 'not allowed to delete idea';
  elsif v_row.created_by_user_id <> v_uid then
    raise exception 'not allowed to delete idea';
  end if;

  delete from public.ideas where id = p_idea_id;
end;
$$;

-- חסימת מנהל מעדכון master_private של מאסטר אחר
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

  if coalesce(v_row.visibility, 'team') = 'master_private'
     and v_row.created_by_user_id <> v_uid
     and v_level in ('manager', 'master') then
    raise exception 'not allowed to update idea';
  end if;

  if not (
    v_level = 'manager'
    or v_level = 'master'
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
