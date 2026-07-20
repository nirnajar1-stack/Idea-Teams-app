import type { Idea } from '../types/idea'
import type { UserPreferences } from '../types/preferences'
import type { ChatBellNotification } from '../types/chat'
import { getDaysUntilTarget } from './ideaUtils'

export function buildTargetDateNotifications(
  ideas: Idea[],
  userId: string,
  prefs: UserPreferences,
): ChatBellNotification[] {
  if (!prefs.notifyTargetDate) return []

  const relevant = ideas.filter((idea) => {
    if (idea.workflowStatus === 'completed') return false
    if (idea.createdByUserId !== userId && idea.assigneeUserId !== userId && !idea.assigneeUserIds?.includes(userId)) return false
    const days = getDaysUntilTarget(idea.targetStartDate)
    return days <= 3
  })

  return relevant.map((idea) => {
    const days = getDaysUntilTarget(idea.targetStartDate)
    const body =
      days < 0
        ? `תאריך היעד עבר לפני ${Math.abs(days)} ימים`
        : days === 0
          ? 'תאריך היעד הוא היום'
          : `תאריך היעד בעוד ${days} ימים`

    return {
      kind: 'idea' as const,
      targetId: idea.id,
      title: `תזכורת: ${idea.title}`,
      unreadCount: 1,
      latestBody: body,
      latestAuthorName: 'מערכת',
      latestAt: new Date().toISOString(),
    }
  })
}

export function filterNotificationsByPrefs(
  notifications: ChatBellNotification[],
  prefs: UserPreferences,
): ChatBellNotification[] {
  return notifications.filter((n) => {
    if (n.kind === 'idea') {
      if (n.latestAuthorName === 'מערכת') return prefs.notifyTargetDate
      return prefs.notifyIdeaChat
    }
    if (n.kind === 'general') {
      return prefs.notifyGeneralMentions || prefs.notifyReplies
    }
    return true
  })
}
