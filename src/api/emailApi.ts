import { getSupabase, isSupabaseEnabled } from '../lib/supabaseClient'

export interface EmailNotifyResult {
  ok: boolean
  skipped?: boolean
  reason?: string
  error?: string
  sent?: { email: string; role: string }[]
}

/** שולח מייל לכל המשתמשים הפעילים (לפי נראות הרעיון) כשבקשה/רעיון הושלם */
export async function notifyIdeaCompletedEmail(
  ideaId: string,
  actorUserId: string,
): Promise<EmailNotifyResult> {
  if (!isSupabaseEnabled()) {
    return { ok: false, skipped: true, reason: 'offline' }
  }

  const { data, error } = await getSupabase().functions.invoke('notify-idea-completed', {
    body: { ideaId, actorUserId },
  })

  if (error) {
    console.warn('notify-idea-completed email failed', error)
    return { ok: false, error: error.message }
  }

  return (data ?? { ok: false }) as EmailNotifyResult
}
