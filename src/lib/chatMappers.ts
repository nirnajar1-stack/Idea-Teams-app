import type { ChatMessage, ChatScope } from '../types/chat'

export interface ChatMessageRow {
  id: string
  scope: ChatScope
  idea_id: string | null
  sender_user_id: string
  guest_session_id: string | null
  author_name: string
  author_initials: string
  body: string
  created_at: string
}

export function chatRowToMessage(row: ChatMessageRow): ChatMessage {
  return {
    id: row.id,
    scope: row.scope,
    ideaId: row.idea_id ?? undefined,
    senderUserId: row.sender_user_id,
    guestSessionId: row.guest_session_id ?? undefined,
    authorName: row.author_name,
    authorInitials: row.author_initials,
    body: row.body,
    createdAt: row.created_at,
  }
}

export function sendInputToRow(
  input: {
    scope: ChatScope
    ideaId?: string
    body: string
    senderUserId: string
    guestSessionId?: string
    authorName: string
    authorInitials: string
  },
): Omit<ChatMessageRow, 'id' | 'created_at'> {
  return {
    scope: input.scope,
    idea_id: input.scope === 'idea' ? (input.ideaId ?? null) : null,
    sender_user_id: input.senderUserId,
    guest_session_id: input.guestSessionId ?? null,
    author_name: input.authorName,
    author_initials: input.authorInitials,
    body: input.body.trim(),
  }
}
