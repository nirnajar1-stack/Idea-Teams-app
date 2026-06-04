-- IdeaFlow — סכמת Supabase לפי מבנה האפליקציה (React / types)
-- הרצה: Supabase Dashboard → SQL Editor → New query → הדבק והרץ

-- ---------------------------------------------------------------------------
-- הרחבות
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- עדכון אוטומטי של updated_at
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- משתמשים (מקביל ל- StoredUser / AppUser + UsersContext)
-- רמות: manager | member | guest
-- ---------------------------------------------------------------------------
create table if not exists public.app_users (
  id text primary key,
  name text not null,
  job_title text not null,
  initials text not null,
  email text not null,
  username text not null,
  password_hash text not null default '',
  access_level text not null
    check (access_level in ('manager', 'member', 'guest')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint app_users_username_unique unique (username),
  constraint app_users_email_unique unique (email)
);

create trigger app_users_set_updated_at
  before update on public.app_users
  for each row execute function public.set_updated_at();

comment on table public.app_users is 'משתמשי IdeaFlow — התחברות בסיסמה, ניהול במסך /users';

-- ---------------------------------------------------------------------------
-- רעיונות (מקביל ל- Idea + IdeasContext)
-- idea_kind: standard | container (מארז תת-רעיונות)
-- parent_id: תת-רעיון → רעיון-אב
-- ---------------------------------------------------------------------------
create table if not exists public.ideas (
  id text primary key,
  external_id text not null,
  title text not null,
  description text not null,
  category text not null
    check (category in ('development', 'monitoring')),
  department text not null,
  priority text not null
    check (priority in ('low', 'medium', 'high')),
  workflow_status text not null
    check (workflow_status in ('in_progress', 'completed', 'pending')),
  created_at date not null,
  target_start_date date not null,
  send_to_maybe_inbox boolean not null default false,
  created_by_user_id text not null
    references public.app_users (id) on delete restrict,
  guest_session_id text,
  author_name text not null,
  author_role text not null,
  author_initials text not null,
  tags jsonb not null default '[]'::jsonb,
  goals jsonb not null default '[]'::jsonb,
  attachments jsonb not null default '[]'::jsonb,
  progress integer not null default 0
    check (progress >= 0 and progress <= 100),
  progress_step text not null default '',
  concept_image_url text,
  idea_kind text not null default 'standard'
    check (idea_kind in ('standard', 'container')),
  parent_id text references public.ideas (id) on delete cascade,
  updated_at timestamptz not null default now(),
  constraint ideas_external_id_unique unique (external_id),
  constraint ideas_container_no_inbox
    check (not (idea_kind = 'container' and send_to_maybe_inbox = true)),
  constraint ideas_sub_not_container
    check (parent_id is null or idea_kind = 'standard')
);

create index if not exists ideas_parent_id_idx on public.ideas (parent_id);
create index if not exists ideas_created_by_user_id_idx on public.ideas (created_by_user_id);
create index if not exists ideas_send_to_maybe_inbox_idx on public.ideas (send_to_maybe_inbox);
create index if not exists ideas_idea_kind_idx on public.ideas (idea_kind);
create index if not exists ideas_workflow_status_idx on public.ideas (workflow_status);
create index if not exists ideas_guest_session_id_idx on public.ideas (guest_session_id)
  where guest_session_id is not null;

create trigger ideas_set_updated_at
  before update on public.ideas
  for each row execute function public.set_updated_at();

comment on table public.ideas is 'רעיונות IdeaFlow — רגיל, Inbox, מארז עם תת-רעיונות';

-- ---------------------------------------------------------------------------
-- נתוני התחלה — משתמשי דמו (סיסמאות: nir123 / golan123)
-- אותו אלגוריתם כמו src/lib/password.ts (SHA-256 + salt)
-- ---------------------------------------------------------------------------
insert into public.app_users (
  id, name, job_title, initials, email, username, password_hash, access_level, active
) values
  (
    'nir',
    'ניר',
    'מנהל מוצר',
    'ניר',
    'nir@ideaflow.io',
    'nir',
    '8d719d044d2a5fe9793047493828e6d8425a0aa3b34243b48a1bb824eb65d887',
    'manager',
    true
  ),
  (
    'golan',
    'גולן',
    'ראש צוות בקרה',
    'גול',
    'golan@ideaflow.io',
    'golan',
    'e4ee560a25e96bbf3f6ce38f94a007d5388df9bed7e705ca77e1f4fae1992d34',
    'member',
    true
  ),
  (
    'guest',
    'אורח',
    'גישה זמנית',
    'או',
    'guest@ideaflow.io',
    'guest',
    '',
    'guest',
    true
  )
on conflict (id) do update set
  name = excluded.name,
  job_title = excluded.job_title,
  initials = excluded.initials,
  email = excluded.email,
  username = excluded.username,
  password_hash = excluded.password_hash,
  access_level = excluded.access_level,
  active = excluded.active,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- Row Level Security (אופציונלי — לשלב אחרי חיבור האפליקציה)
-- כרגע: גישה דרך anon key — להדליק רק עם מדיניות מתאימה או Edge Functions
-- ---------------------------------------------------------------------------
alter table public.app_users enable row level security;
alter table public.ideas enable row level security;

-- מדיניות פיתוח: מאפשרת הכל ל-anon (החלף לפני production!)
create policy "dev_allow_all_app_users"
  on public.app_users for all
  using (true) with check (true);

create policy "dev_allow_all_ideas"
  on public.ideas for all
  using (true) with check (true);
