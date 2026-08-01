-- Permission matrix: master-configurable page views & actions by groups
create table if not exists public.app_permission_rules (
  key text primary key,
  mode text not null default 'default'
    check (mode in ('default', 'groups', 'disabled')),
  group_ids text[] not null default '{}',
  updated_at timestamptz not null default now(),
  updated_by_user_id text null
);

comment on table public.app_permission_rules is
  'Master-managed overrides for page visibility and actions; mode=default keeps role-based behavior';

alter table public.app_permission_rules enable row level security;

drop policy if exists "permission_rules_select_all" on public.app_permission_rules;
create policy "permission_rules_select_all"
  on public.app_permission_rules
  for select
  using (true);

drop policy if exists "permission_rules_write_all" on public.app_permission_rules;
create policy "permission_rules_write_all"
  on public.app_permission_rules
  for all
  using (true)
  with check (true);
