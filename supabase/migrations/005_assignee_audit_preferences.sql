-- IdeaFlow 005 — assignee, audit log, user preferences, chat edit/delete

-- ---------------------------------------------------------------------------
-- assignee on ideas
-- ---------------------------------------------------------------------------
alter table public.ideas
  add column if not exists assignee_user_id text
    references public.app_users (id) on delete set null;

create index if not exists ideas_assignee_user_id_idx
  on public.ideas (assignee_user_id)
  where assignee_user_id is not null;

-- ---------------------------------------------------------------------------
-- audit log
-- ---------------------------------------------------------------------------
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('idea', 'user', 'chat')),
  entity_id text not null,
  action text not null,
  actor_user_id text references public.app_users (id) on delete set null,
  actor_name text not null default '',
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_log_entity_idx
  on public.audit_log (entity_type, entity_id, created_at desc);
create index if not exists audit_log_created_at_idx
  on public.audit_log (created_at desc);

alter table public.audit_log enable row level security;

create policy "dev_allow_all_audit_log"
  on public.audit_log for all
  using (true) with check (true);

-- ---------------------------------------------------------------------------
-- user notification preferences
-- ---------------------------------------------------------------------------
create table if not exists public.user_preferences (
  user_id text primary key references public.app_users (id) on delete cascade,
  notify_idea_chat boolean not null default true,
  notify_general_mentions boolean not null default true,
  notify_replies boolean not null default true,
  notify_target_date boolean not null default true,
  email_notifications boolean not null default false,
  updated_at timestamptz not null default now()
);

create trigger user_preferences_set_updated_at
  before update on public.user_preferences
  for each row execute function public.set_updated_at();

alter table public.user_preferences enable row level security;

create policy "dev_allow_all_user_preferences"
  on public.user_preferences for all
  using (true) with check (true);

-- seed defaults for existing users
insert into public.user_preferences (user_id)
select id from public.app_users
on conflict (user_id) do nothing;

-- ---------------------------------------------------------------------------
-- chat message edit / soft delete
-- ---------------------------------------------------------------------------
alter table public.chat_messages
  add column if not exists edited_at timestamptz,
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by_user_id text references public.app_users (id) on delete set null;

create index if not exists chat_messages_not_deleted_idx
  on public.chat_messages (scope, idea_id, created_at)
  where deleted_at is null;

-- full-text search on ideas + chat
create index if not exists ideas_search_idx
  on public.ideas using gin (
    to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, ''))
  );

create index if not exists chat_messages_body_search_idx
  on public.chat_messages using gin (to_tsvector('simple', coalesce(body, '')))
  where deleted_at is null;
