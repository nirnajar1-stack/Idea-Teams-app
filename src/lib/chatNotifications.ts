import type { ChatMessage, ChatReadCursor, IdeaChatNotification } from '../types/chat'
import type { Idea } from '../types/idea'

export function cursorKey(scope: 'general' | 'idea', ideaId?: string): string {
  return scope === 'general' ? 'general' : `idea:${ideaId}`
}

export function buildCursorMap(cursors: ChatReadCursor[]): Map<string, string> {
  const map = new Map<string, string>()
  for (const c of cursors) {
    map.set(cursorKey(c.scope, c.ideaId), c.lastReadAt)
  }
  return map
}

export function countUnreadGeneral(
  messages: ChatMessage[],
  userId: string,
  lastReadAt: string,
): number {
  const since = new Date(lastReadAt).getTime()
  return messages.filter(
    (m) =>
      m.scope === 'general' &&
      m.senderUserId !== userId &&
      new Date(m.createdAt).getTime() > since,
  ).length
}

export function isIdeaMessageForUser(
  message: ChatMessage,
  userId: string,
  idea: Idea | undefined,
): boolean {
  if (message.scope !== 'idea' || !message.ideaId || message.senderUserId === userId) {
    return false
  }
  if (idea?.createdByUserId === userId) return true
  if (message.replyToUserId === userId) return true
  if (message.mentionedUserIds.includes(userId)) return true
  return false
}

export function buildIdeaNotifications(
  messages: ChatMessage[],
  ideasById: Map<string, Idea>,
  userId: string,
  cursorMap: Map<string, string>,
): IdeaChatNotification[] {
  const buckets = new Map<string, ChatMessage[]>()

  for (const m of messages) {
    if (m.scope !== 'idea' || !m.ideaId) continue
    const idea = ideasById.get(m.ideaId)
    if (!isIdeaMessageForUser(m, userId, idea)) continue

    const lastRead = cursorMap.get(cursorKey('idea', m.ideaId)) ?? '1970-01-01T00:00:00Z'
    if (new Date(m.createdAt).getTime() <= new Date(lastRead).getTime()) continue

    const list = buckets.get(m.ideaId) ?? []
    list.push(m)
    buckets.set(m.ideaId, list)
  }

  const notifications: IdeaChatNotification[] = []
  for (const [ideaId, msgs] of buckets) {
    const sorted = [...msgs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    const latest = sorted[0]
    notifications.push({
      ideaId,
      ideaTitle: ideasById.get(ideaId)?.title ?? 'רעיון',
      unreadCount: msgs.length,
      latestBody: latest.body,
      latestAuthorName: latest.authorName,
      latestAt: latest.createdAt,
    })
  }

  return notifications.sort(
    (a, b) => new Date(b.latestAt).getTime() - new Date(a.latestAt).getTime(),
  )
}
