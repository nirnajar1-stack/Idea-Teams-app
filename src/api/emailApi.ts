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
    const responsePayload = await readFunctionErrorPayload(error)
    const details = responsePayload ?? payload

    if (details.skipped && details.reason) {
      return { ok: false, skipped: true, reason: details.reason }
    }
    if (details.error) {
      return { ok: false, error: details.error }
    }
    const msg = error.message ?? ''
    if (msg.includes('Invalid JWT') || msg.includes('401')) {
      return { ok: false, error: 'edge_function_auth_failed' }
    }
    return { ok: false, error: msg }
  }

  return (data ?? { ok: false }) as EmailNotifyResult
}

async function readFunctionErrorPayload(
  error: unknown,
): Promise<(EmailNotifyResult & { error?: string; reason?: string }) | null> {
  const context = (error as { context?: unknown }).context
  if (!(context instanceof Response)) return null

  try {
    return (await context.clone().json()) as EmailNotifyResult & {
      error?: string
      reason?: string
    }
  } catch {
    try {
      const text = await context.clone().text()
      return text ? { ok: false, error: text } : null
    } catch {
      return null
    }
  }
}
