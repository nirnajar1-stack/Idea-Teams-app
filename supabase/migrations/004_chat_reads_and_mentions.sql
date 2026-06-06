-- IdeaFlow — תיוגים, תגובות, ומעקב קריאה לצ'אט
-- הרצה: Supabase SQL Editor (אחרי 003_chat_messages.sql)

alter table public.chat_messages
  add column if not exists reply_to_user_id text
    references public.app_users (id) on delete set null,
  add column if not exists mentioned_user_ids jsonb not null default '[]'::jsonb;

comment on column public.chat_messages.reply_to_user_id is
  'נמען תגובה — מקבל התראה גם בלי תיוג';
comment on column public.chat_messages.mentioned_user_ids is
  'מזהי משתמשים שתויגו עם @שם או @username';

create index if not exists chat_messages_reply_to_idx
  on public.chat_messages (reply_to_user_id)
  where reply_to_user_id is not null;

-- ---------------------------------------------------------------------------
-- סימון "עד איפה קראתי" — לכל משתמש, לכל ערוץ (כללי / רעיון)
-- ---------------------------------------------------------------------------
create table if not exists public.chat_read_cursors (
  id uuid primary key default gen_random_uuid(),
  user_id text not null
    references public.app_users (id) on delete cascade,
  scope text not null
    check (scope in ('general', 'idea')),
  idea_id text
    references public.ideas (id) on delete cascade,
  last_read_at timestamptz not null default '1970-01-01T00:00:00Z',
  updated_at timestamptz not null default now(),
  constraint chat_read_scope_idea_consistent check (
    (scope = 'general' and idea_id is null)
    or (scope = 'idea' and idea_id is not null)
  )
);

create unique index if not exists chat_read_general_user_unique
  on public.chat_read_cursors (user_id)
  where scope = 'general';

create unique index if not exists chat_read_idea_user_unique
  on public.chat_read_cursors (user_id, idea_id)
  where scope = 'idea';

create trigger chat_read_cursors_set_updated_at
  before update on public.chat_read_cursors
  for each row execute function public.set_updated_at();

alter table public.chat_read_cursors enable row level security;

create policy "dev_allow_all_chat_read_cursors"
  on public.chat_read_cursors for all
  using (true) with check (true);
