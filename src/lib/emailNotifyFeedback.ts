import type { EmailNotifyResult } from '../api/emailApi'

/** הודעה למשתמש אחרי ניסיון שליחת מייל השלמה */
export function emailNotifyUserMessage(result: EmailNotifyResult): string | null {
  if (result.ok && result.sent && result.sent.length > 0) {
    const emails = result.sent.map((s) => s.email).join(', ')
    return `נשלח מייל השלמה ל: ${emails}`
  }

  if (result.skipped) {
    switch (result.reason) {
      case 'offline':
        return 'מייל לא נשלח — האפליקציה לא מחוברת ל-Supabase'
      case 'email_not_configured':
        return 'מייל לא נשלח — יש להגדיר RESEND_API_KEY ו-EMAIL_FROM ב-Supabase (ראה docs/EMAIL_SETUP.md)'
      case 'not_completed':
        return 'מייל לא נשלח — הסטטוס בענן עדיין לא עודכן. נסה לרענן ולסמן שוב'
      case 'no_recipients':
        return 'מייל לא נשלח — אין משתמשים זכאים לפי נראות הבקשה/רעיון'
      default:
        return null
    }
  }

  if (result.error) {
    if (result.error.includes('email_send_failed') || result.error.includes('502')) {
      return 'שליחת המייל נכשלה — בדוק דומיין מאומת ב-Resend'
    }
    if (result.error.includes('forbidden')) {
      return 'אין הרשאה לשלוח מייל השלמה'
    }
    if (result.error.includes('idea_not_found')) {
      return 'מייל לא נשלח — הרעיון לא נמצא בענן'
    }
    return `מייל לא נשלח: ${result.error}`
  }

  if (result.ok && (!result.sent || result.sent.length === 0)) {
    return 'מייל לא נשלח — בדוק שיש אימייל לפותח/מוקצה והעדפה פעילה בפרופיל'
  }

  return null
}
