import { getSupabase, isSupabaseEnabled } from '../lib/supabaseClient'

export interface WhatsAppNotifyResult {
  ok: boolean
  skipped?: boolean
  reason?: string
  error?: string
}

/** שולח WhatsApp למוקצה כשהרעיון הושלם (Edge Function) */
export async function notifyIdeaCompletedWhatsApp(
  ideaId: string,
  actorUserId: string,
): Promise<WhatsAppNotifyResult> {
  if (!isSupabaseEnabled()) {
    return { ok: false, skipped: true, reason: 'offline' }
  }

  const { data, error } = await getSupabase().functions.invoke('notify-idea-completed', {
    body: { ideaId, actorUserId },
  })

  if (error) {
    console.warn('notify-idea-completed failed', error)
    return { ok: false, error: error.message }
  }

  return (data ?? { ok: false }) as WhatsAppNotifyResult
}
