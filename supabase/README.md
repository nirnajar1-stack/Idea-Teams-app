# Supabase — IdeaFlow

סכמת מסד נתונים שתואמת לשדות באפליקציה (`src/types/idea.ts`, `src/types/user.ts`).

## הרצה ב-Supabase

1. צור פרויקט ב-[supabase.com](https://supabase.com).
2. **SQL Editor** → **New query**.
3. העתק את כל התוכן מ-`migrations/001_initial_schema.sql`.
4. לחץ **Run**.

אחרי ההרצה יופיעו:

| טבלה | תוכן |
|------|------|
| `app_users` | ניר (מנהל), גולן (משתמש), אורח |
| `ideas` | ריקה — תמלא מהאפליקציה או ממיגרציה |

## מיפוי שדות (אפליקציה ↔ מסד)

### `app_users`

| TypeScript (camelCase) | עמודה ב-PostgreSQL |
|----------------------|---------------------|
| `id` | `id` |
| `name` | `name` |
| `jobTitle` | `job_title` |
| `initials` | `initials` |
| `email` | `email` |
| `username` | `username` |
| `passwordHash` | `password_hash` |
| `accessLevel` | `access_level` |
| `active` | `active` |

`guestSessionId` — רק בזיכרון/סשן, לא נשמר בטבלת משתמשים.

### `ideas`

| TypeScript | עמודה |
|------------|--------|
| `id` | `id` |
| `externalId` | `external_id` |
| `title` | `title` |
| `description` | `description` |
| `category` | `category` |
| `department` | `department` |
| `priority` | `priority` |
| `workflowStatus` | `workflow_status` |
| `createdAt` | `created_at` (date) |
| `targetStartDate` | `target_start_date` |
| `sendToMaybeInbox` | `send_to_maybe_inbox` |
| `createdByUserId` | `created_by_user_id` |
| `guestSessionId` | `guest_session_id` |
| `authorName` | `author_name` |
| `authorRole` | `author_role` |
| `authorInitials` | `author_initials` |
| `tags` | `tags` (jsonb) |
| `goals` | `goals` (jsonb) |
| `attachments` | `attachments` (jsonb) |
| `progress` | `progress` |
| `progressStep` | `progress_step` |
| `conceptImageUrl` | `concept_image_url` |
| `ideaKind` | `idea_kind` |
| `parentId` | `parent_id` |
| — | `updated_at` (מטא-נתונים) |

## משתמשי דמו

| סיסמה | משתמש | רמה |
|--------|--------|-----|
| `nir123` | nir | manager |
| `golan123` | golan | member |

אורח — כניסה ללא סיסמה מהאפליקציה (לא דרך טבלה).

## RLS (אבטחה)

בקובץ ה-SQL מופעל RLS עם מדיניות **פיתוח** שמאפשרת הכל.  
לפני שימוש אמיתי — החלף במדיניות מבוססת הרשאות או השתמש ב-Edge Functions.

## חיבור לאפליקציה (כבר מוגדר בקוד)

1. קובץ `.env` בשורש הפרויקט:
   - `VITE_SUPABASE_URL=https://PROJECT_ID.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = מפתח **Publishable** (`sb_publishable_...`)
2. **אל תשים** מפתח Secret (`sb_secret_...`) באפליקציה — רק בשרת.
3. `npm run dev` — טעינה ושמירה מהענן.

אם Supabase ריק ויש נתונים ב-localStorage, בכניסה הראשונה מתבצעת העברה אוטומטית לטבלת `ideas`.

## צ'אט (ווידג'ט)

טבלה אחת `chat_messages` משרתת **שני סוגי צ'אט**:

| `scope` | `idea_id` | משמעות |
|---------|-----------|--------|
| `general` | `NULL` | צ'אט כללי באפליקציה (כפתור צף) |
| `idea` | מזהה רעיון | צ'אט בתוך דף רעיון |

**הרצה:** SQL Editor → העתק את `migrations/003_chat_messages.sql` → **Run**.

**בדיקה מהירה:**

```sql
-- הודעה כללית
insert into public.chat_messages (scope, sender_user_id, author_name, author_initials, body)
values ('general', 'nir', 'ניר', 'ניר', 'שלום לכולם');

-- הודעה בתוך רעיון (החלף IDEA_ID)
insert into public.chat_messages (scope, idea_id, sender_user_id, author_name, author_initials, body)
values ('idea', 'IDEA_ID', 'golan', 'גולן', 'גול', 'עדכון על הרעיון');
```

**Realtime:** המיגרציה מוסיפה את הטבלה ל-`supabase_realtime` — הודעות חדשות יגיעו לווידג'ט בלי רענון.

### התראות ותיוגים (`004_chat_reads_and_mentions.sql`)

| טבלה / עמודה | תפקיד |
|----------------|--------|
| `reply_to_user_id` | מי קיבל תגובה (התראה בפעמון) |
| `mentioned_user_ids` | מי תויג ב-`@שם` |
| `chat_read_cursors` | עד איפה כל משתמש קרא (כללי / רעיון) |

**הרצה:** אחרי `003` — העתק והרץ `migrations/004_chat_reads_and_mentions.sql`.
