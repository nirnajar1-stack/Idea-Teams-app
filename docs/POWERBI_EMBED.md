# שילוב Ogen ב-Power BI

מדריך להטמעת האפליקציה בתוך דוח Power BI באמצעות ויזואל **Web URL**.

## כתובות מומלצות

החליפו `https://YOUR-APP.vercel.app` בכתובת הפריסה שלכם:

| מסך | URL |
|-----|-----|
| כניסה | `https://YOUR-APP.vercel.app/embed/login` |
| לוח בקרה | `https://YOUR-APP.vercel.app/embed` |
| רשימת רעיונות | `https://YOUR-APP.vercel.app/embed/ideas` |
| טיימליין (מאסטר) | `https://YOUR-APP.vercel.app/embed/timeline` |
| פרטי רעיון | `https://YOUR-APP.vercel.app/embed/ideas/{id}` |

נתיבי `/embed/*` מציגים ממשק מצומצם (בלי תפריט תחתון, בלי צ'אט, בלי סרטון פתיחה).

## הגדרה ב-Power BI

1. בדוח → **Insert** → **Web URL** (או ויזואל דומה שמציג אתר).
2. הדביקו את ה-URL מהטבלה למעלה.
3. גודל מומלץ: רוחב מלא של האזור, גובה לפחות **600px**.
4. פרסמו את הדוח ב-Power BI Service — ההטמעה עובדת ב-`app.powerbi.com`.

## התחברות בתוך iframe

האפליקציה שומרת סשן ב-`localStorage`. בדפדפנים מודרניים, storage בתוך iframe של דומיין אחר עלול להיחסם.

**מה לעשות:**

1. בפעם הראשונה המשתמש יראה מסך כניסה ב-`/embed/login`.
2. אם הדפדפן מבקש — אשרו **גישה לעוגיות / storage** עבור האתר.
3. לאחר התחברות מוצלחת הסשן נשמר לסשנים הבאים (אם הדפדפן מאפשר).

**טיפ:** לבדיקות, פתחו את `/embed/ideas` בטאב נפרד, התחברו שם, ואז רעננו את הדוח ב-Power BI.

## אבטחה

- רק נתיבי `/embed` מותרים להיטען ב-iframe של Power BI (`Content-Security-Policy: frame-ancestors`).
- שאר האתר (`/`, `/ideas`, …) חסום מ-hotsite חיצוני (`X-Frame-Options: SAMEORIGIN`).

## פריסה

לאחר שינוי `vercel.json` יש לפרוס מחדש ל-Vercel כדי שהכותרות ייכנסו לתוקף:

```bash
git push
```

או `vercel deploy --prod` מהפרויקט.

## פתרון בעיות

| תסמין | פתרון |
|--------|--------|
| מסך ריק / "refused to connect" | ודאו שאתם משתמשים ב-URL תחת `/embed`, לא בנתיב הרגיל |
| מתבקשים להתחבר בכל פעם | אשרו third-party cookies / Storage Access; נסו Chrome או Edge |
| טיימליין לא מופיע | נדרש משתמש ברמת **מאסטר** |
| שגיאת Supabase | ודאו ש-`VITE_SUPABASE_URL` ו-`VITE_SUPABASE_ANON_KEY` מוגדרים ב-Vercel |
