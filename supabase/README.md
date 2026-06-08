# Supabase — Ogen System (מדריך עדכון מלא)

## סדר הרצת מיגרציות (חובה!)

ב-**SQL Editor** → **New query** — הרץ **לפי הסדר**:

| # | קובץ | תוכן |
|---|------|------|
| 1 | `001_initial_schema.sql` | משתמשים, רעיונות, RLS dev |
| 2 | `002_clear_demo_seed_ideas.sql` | (אופציונלי) מחיקת seed |
| 3 | `003_chat_messages.sql` | צ'אט + Realtime |
| 4 | `004_chat_reads_and_mentions.sql` | קריאה, @mention, תגובות |
| 5 | `005_assignee_audit_preferences.sql` | assignee, audit log, העדפות, עריכת צ'אט |
| 6 | `006_storage_attachments.sql` | bucket לקבצים |
| 7 | `007_auth_and_rls.sql` | **Auth + RLS production** |
| 8 | `008_fix_login_pgcrypto.sql` | תיקון digest/pgcrypto |
| 9 | `009_fix_ideas_rls_select.sql` | תיקון תצוגת רעיונות |
| 10 | `010_master_visibility.sql` | **מאסטר + visibility לרעיונות** |
| 11 | `011_fix_master_anon_read.sql` | תיקון RLS לקריאת רעיונות בלי JWT |
| 12 | `012_list_ideas_rpc.sql` | **RPC `list_ideas_for_session`** — טעינת רעיונות |
| 13 | `013_chat_read_rpc.sql` | **RPC קריאה/סימון נקרא** — התראות צ'אט |
| 14 | `014_send_chat_rpc.sql` | **RPC שליחת הודעות** — תיקון שליחה בצ'אט |
| 15 | `015_ideas_write_rpc.sql` | **RPC יצירה/עדכון/מחיקת רעיונות** |
| 16 | `016_fix_ideas_insert_rpc.sql` | תיקון insert רעיונות (עמודות + משתמש) |
| 17 | `017_reload_ideas_write_rpc.sql` | **הרצה אחת** — שמירת רעיונות + reload API |
| 18 | `018_users_write_rpc.sql` | **RPC ניהול משתמשים** — שמירה ב-/users |
| 19 | `019_fix_users_actor_rpc.sql` | תיקון זיהוי מנהל (JWT ישן) |
| 20 | `020_idea_source.sql` | **מקור רעיון** — עמודה + RPC רעיונות |
| 21 | `021_whatsapp_notifications.sql` | **WhatsApp** — טלפון משתמש + העדפת התראה |

> אם כבר הרצת 001–004 — הרץ רק **005 → 006 → 007**.  
> אם רעיונות/התראות לא מתעדכנים — הרץ גם **011 → 012 → 013**.  
> ל-WhatsApp — ראו גם [`docs/WHATSAPP_SETUP.md`](../docs/WHATSAPP_SETUP.md).

---

## מה חדש במיגרציות 005–007

### 005 — `assignee_user_id`, audit, preferences

| טבלה / עמודה | תפקיד |
|--------------|--------|
| `ideas.assignee_user_id` | משתמש מוקצה לרעיון |
| `audit_log` | היסטוריית שינויים |
| `user_preferences` | העדפות התראות למשתמש |
| `chat_messages.edited_at` | עריכת הודעה |
| `chat_messages.deleted_at` | מחיקה רכה |

### 006 — Storage

- Bucket: **`idea-attachments`** (public, עד 10MB, PDF + תמונות)
- מדיניות dev — יוחלפו ב-007 לפי Auth

### 007 — Auth + RLS (קריטי ל-production)

1. **`app_users.auth_user_id`** — קישור ל-`auth.users`
2. **`app_users_public`** — view ללא `password_hash`
3. **`login_with_password(text)`** — RPC לבדיקת סיסמה בשרver
4. **RLS** — מחליף את `dev_allow_all_*`

---

## הגדרת Supabase Auth (חובה אחרי 007)

### שלב 1 — צור משתמשי Auth

**Dashboard → Authentication → Users → Add user**

| Email | Password | Auto confirm |
|-------|----------|--------------|
| `nir@ideaflow.io` | `nir123` | ✓ |
| `golan@ideaflow.io` | `golan123` | ✓ |

הטריגר `link_app_user_on_auth_signup` יקשר אוטומטית ל-`app_users` לפי email.

### שלב 2 — וודא קישור

```sql
select id, email, auth_user_id from public.app_users where access_level != 'guest';
```

כל שורה צריכה `auth_user_id` לא NULL.

### שלב 3 — Realtime (אם לא פעיל)

**Database → Replication** — וודא ש-`chat_messages` ב-publication.

---

## משתני סביבה

`.env` / Vercel:

```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

**אל תשים** Secret key בלקוח.

---

## בדיקות מהירות אחרי עדכון

```sql
-- RPC login
select public.login_with_password('nir123');

-- assignee
select id, title, assignee_user_id from public.ideas limit 5;

-- audit
select * from public.audit_log order by created_at desc limit 5;

-- storage bucket
select * from storage.buckets where id = 'idea-attachments';
```

---

## אורח (Guest)

- כניסת אורח **לא** עוברת Supabase Auth
- RLS מאפשר insert/read לפי `guest_session_id` ב-anon
- ל-production מלא — שקול להגביל אורח דרך Edge Function

---

## סיסמאות דמו

| סיסמה | משתמש |
|--------|--------|
| `nir123` | nir (manager) |
| `golan123` | golan (member) |

---

## פתרון בעיות

| בעיה | פתרון |
|------|--------|
| `digest does not exist` ב-login | הרץ `008_fix_login_pgcrypto.sql` |
| "שליחת הודעה נכשלה" | הרץ 004 |
| "login_with_password does not exist" | הרץ 007 |
| העלאת קבצים נכשלת | הרץ 006, בדוק bucket |
| אין הרשאות אחרי 007 | צור Auth users + בדוק `auth_user_id` |
| `app_users_public` not found | הרץ 007 |
| רעיונות לא מוצגים | הרץ 009, 011, 012 |
| התראות צ'אט נשארות "לא נקראו" | הרץ `013_chat_read_rpc.sql` |
| שליחת הודעה בצ'אט נכשלת | הרץ `003` (אם חסרה טבלה) או `014_send_chat_rpc.sql` |
| הוספת רעיון לא נשמרת / אין הרשאה | הרץ `017_reload_ideas_write_rpc.sql` |
| שמירת משתמשים נכשלת | הרץ `018` ואז `019_fix_users_actor_rpc.sql` (מנהל בלבד) |
| שדה מקור רעיון חסר | הרץ `020_idea_source.sql` |
| WhatsApp לא נשלח | הרץ `021`, פרוס Edge Function, הגדר Secrets — ראו `docs/WHATSAPP_SETUP.md` |

---

## מיפוי שדות חדשים

| TypeScript | PostgreSQL |
|------------|------------|
| `assigneeUserId` | `assignee_user_id` |
| `IdeaAttachment.url` | URL מ-Storage |
| `UserPreferences.*` | `user_preferences` |
| `AuditEntry.*` | `audit_log` |
| `ChatMessage.editedAt` | `edited_at` |
| `ideaSource` | `idea_source` |
| `AppUser.phone` | `app_users.phone` |
| `notifyWhatsappCompleted` | `notify_whatsapp_completed` |
