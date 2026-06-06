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
}

export interface SendChatInput {
  scope: ChatScope
  ideaId?: string
  body: string
}
