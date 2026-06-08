# WhatsApp — התראה אוטומטית בהשלמת משימה (Ogen System)

כש**רעיון מסומן כהושלם**, המערכת שולחת הודעת WhatsApp ל**משתמש המוקצה** (assignee) — כולל כותרת, תיאור והודעת השלמה.

---

## דרישות

1. מיגרציה **`021_whatsapp_notifications.sql`** הורצה ב-Supabase SQL Editor
2. חשבון **Meta Business** עם **WhatsApp Business API**
3. Edge Function **`notify-idea-completed`** פרוסה ב-Supabase
4. Secrets מוגדרים ב-Supabase Dashboard

---

## שלב 1 — מיגרציה 021

ב-SQL Editor הרץ את הקובץ:

`supabase/migrations/021_whatsapp_notifications.sql`

מוסיף:
- עמודת `phone` ב-`app_users`
- עמודת `notify_whatsapp_completed` ב-`user_preferences` (ברירת מחדל: פעיל)
- עדכון RPC לניהול משתמשים

---

## שלב 2 — Meta / WhatsApp Business

1. [Meta for Developers](https://developers.facebook.com/) → צור אפליקציה → הוסף מוצר **WhatsApp**
2. **WhatsApp → API Setup** — שמור:
   - **Phone number ID** (מזהה מספר השולח)
   - **Temporary access token** (לבדיקות) או **System User token** קבוע ל-production
3. צור **Message Template** בשם `idea_completed` (או שם אחר — ראו Secrets):

| שדה | ערך |
|-----|-----|
| שם | `idea_completed` |
| שפה | Hebrew (`he`) |
| קטגוריה | Utility |
| גוף ההודעה (3 משתנים) | `שלום {{1}}, הרעיון "{{2}}" הושלם. תיאור: {{3}}` |

דוגמה לטקסט מאושר:

```
שלום {{1}},

הרעיון שלך הושלם בהצלחה ✅

*{{2}}*

{{3}}

— Ogen System
```

המתן לאישור Meta (לרוב עד 24 שעות).

> **בדיקות מהירות:** הגדר `WHATSAPP_USE_TEXT=true` ב-Secrets — שולח הודעת טקסט חופשי (עובד רק בתוך חלון 24 שעות אחרי שהנמען שלח הודעה).

---

## שלב 3 — פריסת Edge Function

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy notify-idea-completed
```

---

## שלב 4 — Secrets ב-Supabase

**Project Settings → Edge Functions → Secrets**

| Secret | חובה | תיאור |
|--------|------|--------|
| `WHATSAPP_ACCESS_TOKEN` | ✓ | Token מ-Meta |
| `WHATSAPP_PHONE_NUMBER_ID` | ✓ | מזהה מספר השולח |
| `WHATSAPP_TEMPLATE_NAME` | | ברירת מחדל: `idea_completed` |
| `WHATSAPP_USE_TEXT` | | `true` = טקסט חופשי במקום template |

`SUPABASE_URL` ו-`SUPABASE_SERVICE_ROLE_KEY` מוזרקים אוטומטית ל-Edge Functions.

---

## שלב 5 — הגדרה באפליקציה

1. **ניהול משתמשים** (`/users`) — הזינו **טלפון WhatsApp** לכל משתמש (פורמט ישראלי, למשל `050-1234567`)
2. **פרופיל** — כל משתמש יכול לכבות: *WhatsApp כשמשימה מוקצית הושלמה*
3. ב**רעיון** — הגדירו **משתמש מוקצה** (assignee)
4. סמנו את הרעיון **הושלם** — ההודעה נשלחת אוטומטית

---

## לוגיקה (Edge Function)

ההודעה **לא** נשלחת אם:
- WhatsApp לא מוגדר (Secrets חסרים) — מחזיר `skipped: whatsapp_not_configured`
- אין assignee / אין טלפון / משתמש לא פעיל
- `notify_whatsapp_completed = false` בהעדפות
- הרעיון לא במצב `completed`

---

## פתרון בעיות

| תסמין | פתרון |
|-------|--------|
| `whatsapp_not_configured` | הגדר Secrets |
| `no_phone` | הוסף טלפון למשתמש המוקצה |
| `prefs_off` | הפעל בהעדפות פרופיל |
| `whatsapp_send_failed` | בדוק template מאושר, token, פורמט מספר |
| Template rejected | וודא 3 פרמטרים ב-body, שפה `he` |
