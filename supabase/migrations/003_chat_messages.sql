-- IdeaFlow — צ'אט אחיד: הודעות כלליות + הודעות בתוך רעיון
-- הרצה: Supabase Dashboard → SQL Editor → New query → הדבק והרץ

-- ---------------------------------------------------------------------------
-- טבלת הודעות (אובייקט אחד לשני סוגי צ'אט)
-- scope = 'general'  → צ'אט גלובלי באפליקציה (idea_id ריק)
-- scope = 'idea'     → צ'אט המקושר לרעיון (idea_id חובה)
-- ---------------------------------------------------------------------------
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),

  scope text not null
    check (scope in ('general', 'idea')),

  idea_id text
    references public.ideas (id) on delete cascade,

  sender_user_id text not null
    references public.app_users (id) on delete restrict,

  guest_session_id text,

  author_name text not null,
  author_initials text not null default '',

  body text not null
    check (char_length(trim(body)) between 1 and 4000),

  created_at timestamptz not null default now(),

  constraint chat_scope_idea_id_consistent check (
    (scope = 'general' and idea_id is null)
    or (scope = 'idea' and idea_id is not null)
  )
);

comment on table public.chat_messages is
  'הודעות צ''אט — general לאפליקציה, idea לרעיון ספציפי';
comment on column public.chat_messages.scope is
  'general = צ''אט כללי | idea = צ''אט בתוך רעיון';
comment on column public.chat_messages.idea_id is
  'מזהה רעיון — NULL בצ''אט כללי בלבד';

-- אינדקסים לשאילתות מהירות
create index if not exists chat_messages_general_idx
  on public.chat_messages (created_at desc)
  where scope = 'general';

create index if not exists chat_messages_idea_idx
  on public.chat_messages (idea_id, created_at asc)
  where scope = 'idea';

create index if not exists chat_messages_sender_idx
  on public.chat_messages (sender_user_id);

-- ---------------------------------------------------------------------------
-- Row Level Security (כמו ideas — פתוח לפיתוח; להחמיר לפני production)
-- ---------------------------------------------------------------------------
alter table public.chat_messages enable row level security;

create policy "dev_allow_all_chat_messages"
  on public.chat_messages for all
  using (true) with check (true);

-- ---------------------------------------------------------------------------
-- Realtime — הודעות חדשות מגיעות מיד לווידג'ט
-- (אם השורה כבר קיימת ב-publication, אפשר להתעלם משגיאה)
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.chat_messages;
