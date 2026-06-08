-- Ogen 022 — מייל בהשלמת משימה (פותח + מוקצה)
-- אחרי הרצה: פרוס Edge Function notify-idea-completed והגדר Secrets (Resend)

alter table public.user_preferences
  add column if not exists notify_email_completed boolean not null default true;

comment on column public.user_preferences.notify_email_completed is
  'שליחת מייל כשמשימה/רעיון מסומן כהושלם (לפותח ו/או למוקצה)';

notify pgrst, 'reload schema';
