import type { ChatMessage, ChatReadCursor, ChatBellNotification, IdeaChatNotification } from '../types/chat'
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
      ideaTitle: ideasById.get(ideaId)?.title ?? 'בקשה/רעיון',
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

export function buildGeneralMentionNotifications(
  messages: ChatMessage[],
  userId: string,
  cursorMap: Map<string, string>,
): ChatBellNotification[] {
  const lastRead = cursorMap.get(cursorKey('general')) ?? '1970-01-01T00:00:00Z'
  const since = new Date(lastRead).getTime()

  const relevant = messages.filter(
    (m) =>
      m.scope === 'general' &&
      m.senderUserId !== userId &&
      new Date(m.createdAt).getTime() > since &&
      (m.mentionedUserIds.includes(userId) || m.replyToUserId === userId),
  )

  if (relevant.length === 0) return []

  const latest = [...relevant].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0]

  return [
    {
      kind: 'general',
      targetId: 'general',
      title: "צ'אט כללי — תיוג",
      unreadCount: relevant.length,
      latestBody: latest.body,
      latestAuthorName: latest.authorName,
      latestAt: latest.createdAt,
    },
  ]
}

export function buildBellNotifications(
  generalMessages: ChatMessage[],
  ideaMessages: ChatMessage[],
  ideasById: Map<string, Idea>,
  userId: string,
  cursorMap: Map<string, string>,
): ChatBellNotification[] {
  const general = buildGeneralMentionNotifications(generalMessages, userId, cursorMap)
  const ideas = buildIdeaNotifications(ideaMessages, ideasById, userId, cursorMap).map(
    (n): ChatBellNotification => ({
      kind: 'idea',
      targetId: n.ideaId,
      title: n.ideaTitle,
      unreadCount: n.unreadCount,
      latestBody: n.latestBody,
      latestAuthorName: n.latestAuthorName,
      latestAt: n.latestAt,
    }),
  )
  return [...general, ...ideas].sort(
    (a, b) => new Date(b.latestAt).getTime() - new Date(a.latestAt).getTime(),
  )
}
