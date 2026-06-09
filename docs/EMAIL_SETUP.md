# מייל בהשלמת משימה — Ogen System

כש**בקשה/רעיון מסומן כהושלם**, נשלח מייל אוטומטי ל**כל המשתמשים הפעילים** (מנהל, מאסטר, חבר צוות — לא אורח), לפי **נראות** הבקשה/רעיון:

| נראות | מי מקבל מייל |
|--------|----------------|
| `team` (פתוח לכולם) | כל המשתמשים הפעילים |
| `managers_only` | מנהלים ומאסטר בלבד |
| `master_private` | יוצר המאסטר בלבד |

---

## דרישות

1. מיגרציה **`022_email_completion.sql`** הורצה ב-Supabase SQL Editor
2. חשבון **[Resend](https://resend.com)** (או שירות דומה — הקוד משתמש ב-Resend API)
3. דומיין מאומת לשליחה
4. Edge Function **`notify-idea-completed`** פרוסה מחדש
5. Secrets ב-Supabase Dashboard

---

## שלב 1 — מיגרציה 022

```sql
-- supabase/migrations/022_email_completion.sql
```

מוסיף עמודת `notify_email_completed` (ברירת מחדל: פעיל).

---

## שלב 2 — Resend

1. צור חשבון ב-[resend.com](https://resend.com)
2. **Domains** → הוסף דומיין → אמת DNS
3. **API Keys** → צור מפתח

---

## שלב 3 — פריסת Edge Function

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy notify-idea-completed
```

---

## שלב 4 — Secrets

**Project Settings → Edge Functions → Secrets**

| Secret | חובה | דוגמה |
|--------|------|--------|
| `RESEND_API_KEY` | ✓ | `re_...` |
| `EMAIL_FROM` | ✓ | `Ogen <noreply@yourdomain.gov.il>` |
| `APP_PUBLIC_URL` | מומלץ | `https://your-app.vercel.app` |

`APP_PUBLIC_URL` משמש לקישור ישיר לרעיון במייל.

---

## שלב 5 — באפליקציה

1. וודא ש**למשתמשים יש אימייל** תקין (מסך ניהול משתמשים)
2. כל משתמש יכול לכבות ב**פרופיל** → *מייל כשבקשה/רעיון הושלם*
3. סמן **הושלם** — המיילים נשלחים אוטומטית לכל מי שזכאי לפי הטבלה למעלה

---

## לוגיקה

המייל **לא** נשלח אם:

- Resend לא מוגדר (`email_not_configured`)
- אין אימייל למשתמש
- `notify_email_completed = false`
- המשתמש לא פעיל

פותח ומוקצה מקבלים ניסוח מותאם במייל; שאר המשתמשים מקבלים הודעה כללית. לכל משתמש נשלח **מייל אחד** בלבד.

---

## פתרון בעיות

| תסמין | פתרון |
|-------|--------|
| `email_not_configured` | הגדר `RESEND_API_KEY` ו-`EMAIL_FROM` |
| `no_email` | הוסף אימייל למשתמש |
| `prefs_off` | הפעל בפרופיל |
| `email_send_failed` | בדוק דומיין מאומת ב-Resend, פורמט `EMAIL_FROM` |
| עמודה חסרה | הרץ מיגרציה 022 |
