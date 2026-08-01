-- Linked external boards (Notion, Power BI, etc.) accessible from Ogen
create table if not exists public.app_linked_boards (
  id text primary key,
  title text not null,
  url text not null,
  provider text not null default 'generic'
    check (provider in ('notion', 'powerbi', 'excel', 'generic')),
  view_mode text not null default 'link'
    check (view_mode in ('iframe', 'link')),
  description text null,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  created_by_user_id text null
);

create index if not exists app_linked_boards_active_sort_idx
  on public.app_linked_boards (active, sort_order, title);

comment on table public.app_linked_boards is
  'Master-managed links to external boards/sites for in-app access';

alter table public.app_linked_boards enable row level security;

drop policy if exists linked_boards_select on public.app_linked_boards;
create policy linked_boards_select on public.app_linked_boards
  for select using (true);

drop policy if exists linked_boards_all on public.app_linked_boards;
create policy linked_boards_all on public.app_linked_boards
  for all using (true) with check (true);

grant select, insert, update, delete on public.app_linked_boards to anon, authenticated;
