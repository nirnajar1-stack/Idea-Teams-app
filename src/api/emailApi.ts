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

  const payload = (data ?? {}) as EmailNotifyResult & {
    error?: string
    reason?: string
    skipped?: boolean
  }

  if (error) {
    console.warn('notify-idea-completed email failed', error, payload)
    if (payload.skipped && payload.reason) {
      return { ok: false, skipped: true, reason: payload.reason }
    }
    if (payload.error) {
      return { ok: false, error: payload.error }
    }
    const msg = error.message ?? ''
    if (msg.includes('non-2xx') || msg.includes('Invalid JWT') || msg.includes('401')) {
      return { ok: false, error: 'edge_function_auth_failed' }
    }
    return { ok: false, error: msg }
  }

  return (data ?? { ok: false }) as EmailNotifyResult
}
