/** הודעת שגיאה ידידותית לשליחת צ'אט */
export function formatChatSendError(error: unknown): string {
  const err = error as { code?: string; message?: string; details?: string }
  const msg = err?.message ?? ''
  const code = err?.code ?? ''

  if (
    code === '42P01' ||
    msg.includes("Could not find the table") ||
    msg.includes('chat_messages')
  ) {
    return 'טבלת הצ\'אט לא קיימת — הרץ ב-Supabase את migrations/003_chat_messages.sql'
  }

  if (
    code === 'PGRST204' ||
    msg.includes('reply_to_user_id') ||
    msg.includes('mentioned_user_ids') ||
    msg.includes('schema cache')
  ) {
    return 'חסרות עמודות התראות — הרץ ב-Supabase את migrations/004_chat_reads_and_mentions.sql'
  }

  if (code === '23503') {
    if (msg.includes('idea_id') || msg.includes('ideas')) {
      return 'הרעיון לא נמצא בענן. שמור את הרעיון מחדש או רענן את הדף.'
    }
    if (msg.includes('sender_user_id') || msg.includes('app_users')) {
      return 'המשתמש לא נמצא ב-Supabase. ודא שמשתמשי הדמו קיימים בטבלת app_users.'
    }
    if (msg.includes('reply_to_user_id')) {
      return 'נמען התגובה לא קיים במערכת.'
    }
    return 'נתונים לא תואמים לענן (קישור למשתמש/רעיון).'
  }

  if (msg) return `שליחת ההודעה נכשלה: ${msg}`
  return 'שליחת ההודעה נכשלה.'
}

export function isMissingExtendedChatColumns(error: unknown): boolean {
  const err = error as { code?: string; message?: string }
  const msg = err?.message ?? ''
  return (
    err?.code === 'PGRST204' ||
    msg.includes('reply_to_user_id') ||
    msg.includes('mentioned_user_ids') ||
    (msg.includes('column') && msg.includes('does not exist'))
  )
}
