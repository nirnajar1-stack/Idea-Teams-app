export type ChatScope = 'general' | 'idea'

export interface ChatMessage {
  id: string
  scope: ChatScope
  ideaId?: string
  senderUserId: string
  guestSessionId?: string
  authorName: string
  authorInitials: string
  body: string
  createdAt: string
  replyToUserId?: string
  mentionedUserIds: string[]
  editedAt?: string
  deletedAt?: string
}

export interface SendChatInput {
  scope: ChatScope
  ideaId?: string
  body: string
  replyToUserId?: string
  mentionedUserIds?: string[]
}

export interface ChatReadCursor {
  scope: ChatScope
  ideaId?: string
  lastReadAt: string
}

export interface IdeaChatNotification {
  ideaId: string
  ideaTitle: string
  unreadCount: number
  latestBody: string
  latestAuthorName: string
  latestAt: string
}

/** התראה בפעמון — צ'אט כללי (תיוג) או רעיון */
export interface ChatBellNotification {
  kind: 'general' | 'idea'
  targetId: string
  title: string
  unreadCount: number
  latestBody: string
  latestAuthorName: string
  latestAt: string
}
