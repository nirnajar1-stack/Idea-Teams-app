import { getSupabase, isSupabaseEnabled } from '../lib/supabaseClient'
import { DEFAULT_USER_PREFERENCES, type UserPreferences } from '../types/preferences'

interface PrefsRow {
  user_id: string
  notify_idea_chat: boolean
  notify_general_mentions: boolean
  notify_replies: boolean
  notify_target_date: boolean
  notify_email_completed: boolean
  email_notifications: boolean
}

function rowToPrefs(row: PrefsRow): UserPreferences {
  return {
    userId: row.user_id,
    notifyIdeaChat: row.notify_idea_chat,
    notifyGeneralMentions: row.notify_general_mentions,
    notifyReplies: row.notify_replies,
    notifyTargetDate: row.notify_target_date,
    notifyEmailCompleted: row.notify_email_completed ?? true,
    emailNotifications: row.email_notifications,
  }
}

function prefsToRow(prefs: UserPreferences): PrefsRow {
  return {
    user_id: prefs.userId,
    notify_idea_chat: prefs.notifyIdeaChat,
    notify_general_mentions: prefs.notifyGeneralMentions,
    notify_replies: prefs.notifyReplies,
    notify_target_date: prefs.notifyTargetDate,
    notify_email_completed: prefs.notifyEmailCompleted,
    email_notifications: prefs.emailNotifications,
  }
}

export async function fetchUserPreferences(userId: string): Promise<UserPreferences> {
  if (!isSupabaseEnabled()) {
    return { userId, ...DEFAULT_USER_PREFERENCES }
  }
  const { data, error } = await getSupabase()
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  if (!data) return { userId, ...DEFAULT_USER_PREFERENCES }
  return rowToPrefs(data as PrefsRow)
}

export async function upsertUserPreferences(prefs: UserPreferences): Promise<void> {
  if (!isSupabaseEnabled()) {
    localStorage.setItem(`ideaflow-prefs-${prefs.userId}`, JSON.stringify(prefs))
    return
  }
  const { error } = await getSupabase()
    .from('user_preferences')
    .upsert(prefsToRow(prefs), { onConflict: 'user_id' })
  if (error) throw error
}

export function loadLocalPreferences(userId: string): UserPreferences {
  try {
    const raw = localStorage.getItem(`ideaflow-prefs-${userId}`)
    if (raw) {
      const parsed = JSON.parse(raw) as UserPreferences & { notifyWhatsappCompleted?: boolean }
      const { notifyWhatsappCompleted: _wa, ...rest } = parsed
      return { ...DEFAULT_USER_PREFERENCES, ...rest, userId }
    }
  } catch {
    /* ignore */
  }
  return { userId, ...DEFAULT_USER_PREFERENCES }
}
