/** הודעת שגיאה ידידותית לשמירת רעיון */
export function formatIdeaSaveError(error: unknown): string {
  const err = error as { code?: string; message?: string; details?: string }
  const msg = [err?.message, err?.details].filter(Boolean).join(' ')
  const code = err?.code ?? ''

  if (
    code === 'PGRST202' ||
    msg.includes('Could not find the function') ||
    (msg.includes('insert_idea_for_session') && msg.includes('does not exist'))
  ) {
    return 'פונקציית שמירה חסרה — הרץ ב-Supabase את migrations/017_reload_ideas_write_rpc.sql'
  }

  if (
    code === '42501' ||
    msg.includes('row-level security') ||
    msg.includes('Row level security') ||
    msg.includes('permission denied for function')
  ) {
    return 'אין הרשאה ל-API — הרץ ב-Supabase את migrations/017_reload_ideas_write_rpc.sql'
  }

  if (msg.includes('creator not found')) {
    return 'המשתמש לא נמצא ב-Supabase — ודא שמשתמשי הדמו קיימים בטבלת app_users'
  }

  if (msg.includes('creator mismatch') || msg.includes('authentication required')) {
    return 'בעיית התחברות — התנתק והתחבר מחדש'
  }

  if (msg.includes('visibility') && msg.includes('does not exist')) {
    return 'חסרה עמודת visibility — הרץ migrations/010_master_visibility.sql'
  }

  if (code === '23505' || msg.includes('ideas_external_id_unique')) {
    return 'מזהה רעיון כבר קיים — נסה שוב'
  }

  if (msg) return `שמירת הרעיון נכשלה: ${msg}`
  return 'שמירת הרעיון נכשלה'
}
