/** הודעת שגיאה ידידותית לשמירת משתמש */
export function formatUserSaveError(error: unknown): string {
  const err = error as { code?: string; message?: string; details?: string }
  const msg = [err?.message, err?.details].filter(Boolean).join(' ')
  const code = err?.code ?? ''

  if (
    code === 'PGRST202' ||
    msg.includes('Could not find the function') ||
    (msg.includes('insert_app_user_for_session') && msg.includes('does not exist'))
  ) {
    return 'פונקציית שמירת משתמשים חסרה — הרץ ב-Supabase את migrations/018_users_write_rpc.sql'
  }

  if (
    code === '42501' ||
    msg.includes('row-level security') ||
    msg.includes('permission denied')
  ) {
    return 'האפליקציה רצה בגרסה ישנה (שמירה ישירה חסומה). רענן Ctrl+F5, או המתן ל-redeploy ב-Vercel. ב-Supabase הרץ 018+019.'
  }

  if (msg.includes('only active manager')) {
    return 'רק מנהל או מאסטר פעיל יכול לנהל משתמשים — וודא שרצת migrations/019_fix_users_actor_rpc.sql'
  }

  if (msg.includes('u.phone does not exist') || (msg.includes('column') && msg.includes('phone'))) {
    return 'חסרה עמודת טלפון — הרץ migrations/025_add_phone_column.sql ב-Supabase SQL Editor'
  }

  if (msg.includes('cannot change name of view column')) {
    return 'עדכון view נכשל — הרץ שוב את migrations/025_add_phone_column.sql (גרסה מעודכנת עם DROP VIEW)'
  }

  if (msg.includes('app_users_access_level_check') || msg.includes('access_level')) {
    return 'רמת גישה לא תקינה — הרץ migrations/019_fix_users_actor_rpc.sql'
  }

  if (msg.includes('cannot delete last active manager')) {
    return 'לא ניתן למחוק את המנהל הפעיל האחרון'
  }

  if (code === '23505' || msg.includes('app_users_email_unique') || msg.includes('app_users_username_unique')) {
    return 'אימייל או שם משתמש כבר קיימים במערכת'
  }

  if (msg) return `שמירת המשתמש נכשלה: ${msg}`
  return 'שמירת המשתמש נכשלה'
}
