-- Ogen 031 — העדפת WhatsApp בהשלמה (אם 021 לא הורצה)
alter table public.user_preferences
  add column if not exists notify_whatsapp_completed boolean not null default true;

comment on column public.user_preferences.notify_whatsapp_completed is
  'שליחת WhatsApp למוקצה כשבקשה/רעיון שהוקצה אליו הושלם';

notify pgrst, 'reload schema';
