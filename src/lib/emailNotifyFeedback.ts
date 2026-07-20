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
        return 'מייל לא נשלח — אין משתמשים מוקצים (או יוצר) לשליחה'
      default:
        return null
    }
  }

  if (result.error) {
    if (result.error === 'edge_function_auth_failed') {
      return 'מייל לא נשלח — יש לפרוס מחדש את הפונקציה עם --no-verify-jwt (ראה docs/EMAIL_SETUP.md)'
    }
    if (result.error.includes('email_send_failed') || result.error.includes('502')) {
      return 'שליחת המייל נכשלה — בדוק דומיין מאומת ב-Resend'
    }
    if (result.error.includes('forbidden')) {
      return 'אין הרשאה לשלוח מייל השלמה'
    }
    if (result.error.includes('idea_not_found')) {
      return 'מייל לא נשלח — הרעיון לא נמצא בענן'
    }
    if (result.error.includes('users_load_failed')) {
      return 'מייל לא נשלח — שגיאה בטעינת משתמשים'
    }
    return `מייל לא נשלח: ${result.error}`
  }

  if (result.ok && (!result.sent || result.sent.length === 0)) {
    return 'מייל לא נשלח — בדוק הקצאות, אימיילים והעדפות/החרגות'
  }

  return null
}

/** הודעות מייל אחרי סימון הושלם */
export function completionNotifyToasts(
  result: EmailNotifyResult,
): { level: 'message' | 'warning'; text: string }[] {
  const out: { level: 'message' | 'warning'; text: string }[] = []
  const emailMsg = emailNotifyUserMessage(result)
  if (emailMsg) {
    out.push({
      level: result.ok && result.sent && result.sent.length > 0 ? 'message' : 'warning',
      text: emailMsg,
    })
  }
  return out
}
