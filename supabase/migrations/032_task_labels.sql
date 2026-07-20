-- Ogen 032 — קטalog לייבלים לניהול משימות (יצירה למאסטר בלבד)

create table if not exists public.task_labels (
  id text primary key,
  name text not null,
  color text not null default '#4f5e7f',
  created_by_user_id text references public.app_users (id) on delete set null,
  created_at timestamptz not null default now(),
  active boolean not null default true
);

create unique index if not exists task_labels_name_active_idx
  on public.task_labels (lower(trim(name)))
  where active = true;

comment on table public.task_labels is 'לייבלים מנוהלים — יצירה למאסטר, שיוך לכל המשתמשים';

alter table public.task_labels enable row level security;

drop policy if exists task_labels_select on public.task_labels;
create policy task_labels_select on public.task_labels
  for select using (true);

drop policy if exists task_labels_all on public.task_labels;
create policy task_labels_all on public.task_labels
  for all using (true) with check (true);

grant select, insert, update, delete on public.task_labels to anon, authenticated;
