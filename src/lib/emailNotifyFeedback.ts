import type { EmailNotifyResult, WhatsAppNotifyResult } from '../api/emailApi'

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
      return 'מייל לא נשלח — שגיאה בטעינת משתמשים (הרץ מיגרציה 022?)'
    }
    return `מייל לא נשלח: ${result.error}`
  }

  if (result.ok && (!result.sent || result.sent.length === 0)) {
    return 'מייל לא נשלח — בדוק שיש אימייל לפותח/מוקצה והעדפה פעילה בפרופיל'
  }

  return null
}

/** הודעה למשתמש אחרי ניסיון שליחת WhatsApp בהשלמה */
export function whatsappNotifyUserMessage(result: WhatsAppNotifyResult | undefined): string | null {
  if (!result) return null

  if (result.ok && result.sent) {
    const display = result.sent.phone.startsWith('972')
      ? `0${result.sent.phone.slice(3)}`
      : result.sent.phone
    return `נשלח עדכון WhatsApp למוקצה: ${display}`
  }

  if (result.skipped) {
    switch (result.reason) {
      case 'whatsapp_not_configured':
        return 'WhatsApp לא נשלח — יש להגדיר WHATSAPP_ACCESS_TOKEN ו-WHATSAPP_PHONE_NUMBER_ID ב-Supabase (ראה docs/WHATSAPP_SETUP.md)'
      case 'no_assignee':
        return 'WhatsApp לא נשלח — לא הוגדר משתמש מוקצה לבקשה/רעיון'
      case 'no_phone':
        return 'WhatsApp לא נשלח — למוקצה אין מספר טלפון (הגדר בניהול משתמשים)'
      case 'invalid_phone':
        return 'WhatsApp לא נשלח — מספר הטלפון של המוקצה לא תקין'
      case 'prefs_off':
        return 'WhatsApp לא נשלח — המוקצה כיבה התראות WhatsApp בפרופיל'
      case 'assignee_not_found':
      case 'inactive':
        return 'WhatsApp לא נשלח — המוקצה לא נמצא או לא פעיל'
      default:
        return null
    }
  }

  if (result.error === 'whatsapp_send_failed') {
    return 'שליחת WhatsApp נכשלה — בדוק template מאושר ב-Meta ו-token תקין'
  }

  if (result.error) {
    return `WhatsApp לא נשלח: ${result.error}`
  }

  return null
}

/** הודעות מייל + WhatsApp אחרי סימון הושלם */
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
  const waMsg = whatsappNotifyUserMessage(result.whatsapp)
  if (waMsg) {
    out.push({
      level: result.whatsapp?.ok ? 'message' : 'warning',
      text: waMsg,
    })
  }
  return out
}
