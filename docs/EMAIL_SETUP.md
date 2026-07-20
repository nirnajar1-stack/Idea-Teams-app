# מייל בהשלמת משימה — Ogen System

כש**בקשה/רעיון מסומן כהושלם**, נשלח מייל אוטומטי ל:

1. **כל המשתמשים המוקצים** למשימה
2. **כל חברי הקבוצות** המוקצות למשימה
3. **יוצר המשימה** (אם עדיין לא ברשימה)

---

## דרישות

1. מיגרציות `022_email_completion.sql` + `033_multi_assignees_groups_email.sql`
2. חשבון [Resend](https://resend.com) עם דומיין מאומת
3. Edge Function `notify-idea-completed` פרוסה עם `--no-verify-jwt`
4. Secrets: `RESEND_API_KEY`, `EMAIL_FROM`, `APP_PUBLIC_URL`

---

## החרגות

במסך **יומן מיילים** ניתן להחריג משתמשים או קבוצות משליחת מייל בהשלמה.

---

## יומן

כל ניסיון שליחה נרשם ב-`email_send_log` ומוצג במסך **יומן מיילים**.

---

## פתרון בעיות

| תסמין | פתרון |
|-------|--------|
| Invalid JWT | פרוס עם `--no-verify-jwt` |
| email_not_configured | הגדר Secrets |
| email_send_failed | בדוק דומיין מאומת ב-Resend |
| אין נמענים | שייך משתמשים/קבוצות למשימה |
