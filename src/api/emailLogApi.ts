import { getSupabase, isSupabaseEnabled } from '../lib/supabaseClient'

export type EmailExclusionSubjectType = 'user' | 'group'

export interface EmailCompletionExclusion {
  id: string
  subjectType: EmailExclusionSubjectType
  subjectId: string
  createdAt: string
  createdByUserId?: string
}

export type EmailSendStatus = 'sent' | 'skipped' | 'failed'

export interface EmailSendLogEntry {
  id: string
  ideaId?: string
  actorUserId?: string
  actorName?: string
  recipientUserId?: string
  recipientEmail: string
  recipientName?: string
  role?: string
  status: EmailSendStatus
  reason?: string
  providerId?: string
  ideaTitle?: string
  createdAt: string
}

interface ExclusionRow {
  id: string
  subject_type: EmailExclusionSubjectType
  subject_id: string
  created_at: string
  created_by_user_id: string | null
}

interface LogRow {
  id: string
  idea_id: string | null
  actor_user_id: string | null
  actor_name: string | null
  recipient_user_id: string | null
  recipient_email: string
  recipient_name: string | null
  role: string | null
  status: EmailSendStatus
  reason: string | null
  provider_id: string | null
  idea_title: string | null
  created_at: string
}

export async function fetchEmailExclusions(): Promise<EmailCompletionExclusion[]> {
  if (!isSupabaseEnabled()) return []
  const { data, error } = await getSupabase()
    .from('email_completion_exclusions')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return ((data ?? []) as ExclusionRow[]).map((r) => ({
    id: r.id,
    subjectType: r.subject_type,
    subjectId: r.subject_id,
    createdAt: r.created_at,
    createdByUserId: r.created_by_user_id ?? undefined,
  }))
}

export async function addEmailExclusion(
  subjectType: EmailExclusionSubjectType,
  subjectId: string,
  actorUserId: string,
): Promise<EmailCompletionExclusion> {
  const entry: EmailCompletionExclusion = {
    id: `ex-${Date.now().toString(36)}`,
    subjectType,
    subjectId,
    createdAt: new Date().toISOString(),
    createdByUserId: actorUserId,
  }
  if (!isSupabaseEnabled()) return entry
  const { error } = await getSupabase().from('email_completion_exclusions').insert({
    id: entry.id,
    subject_type: subjectType,
    subject_id: subjectId,
    created_by_user_id: actorUserId,
  })
  if (error) throw error
  return entry
}

export async function removeEmailExclusion(id: string): Promise<void> {
  if (!isSupabaseEnabled()) return
  const { error } = await getSupabase()
    .from('email_completion_exclusions')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function fetchEmailSendLog(limit = 100): Promise<EmailSendLogEntry[]> {
  if (!isSupabaseEnabled()) return []
  const { data, error } = await getSupabase()
    .from('email_send_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return ((data ?? []) as LogRow[]).map((r) => ({
    id: r.id,
    ideaId: r.idea_id ?? undefined,
    actorUserId: r.actor_user_id ?? undefined,
    actorName: r.actor_name ?? undefined,
    recipientUserId: r.recipient_user_id ?? undefined,
    recipientEmail: r.recipient_email,
    recipientName: r.recipient_name ?? undefined,
    role: r.role ?? undefined,
    status: r.status,
    reason: r.reason ?? undefined,
    providerId: r.provider_id ?? undefined,
    ideaTitle: r.idea_title ?? undefined,
    createdAt: r.created_at,
  }))
}
