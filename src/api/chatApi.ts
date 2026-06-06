import type { RealtimeChannel } from '@supabase/supabase-js'
import { getSupabase, isSupabaseEnabled } from '../lib/supabaseClient'
import {
  chatRowToMessage,
  sendInputToBaseRow,
  sendInputToRow,
  type ChatMessageRow,
  type ChatReadCursorRow,
} from '../lib/chatMappers'
import { isMissingExtendedChatColumns } from '../lib/chatErrors'
import type { ChatMessage, ChatReadCursor, ChatScope } from '../types/chat'
import type { AppUser } from '../types/user'

export function chatApiAvailable(): boolean {
  return isSupabaseEnabled()
}

export async function fetchGeneralMessages(): Promise<ChatMessage[]> {
  const { data, error } = await getSupabase()
    .from('chat_messages')
    .select('*')
    .eq('scope', 'general')
    .is('deleted_at', null)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data as ChatMessageRow[]).map(chatRowToMessage)
}

export async function fetchIdeaMessages(ideaId: string): Promise<ChatMessage[]> {
  const { data, error } = await getSupabase()
    .from('chat_messages')
    .select('*')
    .eq('scope', 'idea')
    .eq('idea_id', ideaId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data as ChatMessageRow[]).map(chatRowToMessage)
}

export async function fetchAllIdeaMessages(): Promise<ChatMessage[]> {
  const { data, error } = await getSupabase()
    .from('chat_messages')
    .select('*')
    .eq('scope', 'idea')
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data as ChatMessageRow[]).map(chatRowToMessage)
}

export async function fetchReadCursors(userId: string): Promise<ChatReadCursor[]> {
  const { data, error } = await getSupabase().rpc('list_chat_read_cursors_for_session', {
    p_user_id: userId,
  })
  if (error) throw error
  return (data as ChatReadCursorRow[]).map((row) => ({
    scope: row.scope as ChatScope,
    ideaId: row.idea_id ?? undefined,
    lastReadAt: row.last_read_at,
  }))
}

export async function markChatRead(
  userId: string,
  scope: ChatScope,
  ideaId?: string,
): Promise<void> {
  const { error } = await getSupabase().rpc('mark_chat_read_for_session', {
    p_user_id: userId,
    p_scope: scope,
    p_idea_id: ideaId ?? null,
  })
  if (error) throw error
}

async function insertChatRow(row: Record<string, unknown>): Promise<ChatMessage> {
  const { data, error } = await getSupabase()
    .from('chat_messages')
    .insert(row)
    .select('*')
    .single()
  if (error) throw error
  return chatRowToMessage(data as ChatMessageRow)
}

export async function sendChatMessage(
  user: AppUser,
  scope: ChatScope,
  body: string,
  ideaId?: string,
  meta?: { replyToUserId?: string; mentionedUserIds?: string[] },
): Promise<ChatMessage> {
  const baseInput = {
    scope,
    ideaId,
    body,
    senderUserId: user.id,
    guestSessionId: user.guestSessionId,
    authorName: user.name,
    authorInitials: user.initials,
  }

  const { data, error } = await getSupabase().rpc('send_chat_message_for_session', {
    p_user_id: user.id,
    p_scope: scope,
    p_body: body,
    p_idea_id: ideaId ?? null,
    p_guest_session_id: user.guestSessionId ?? null,
    p_author_name: user.name,
    p_author_initials: user.initials,
    p_reply_to_user_id: meta?.replyToUserId ?? null,
    p_mentioned_user_ids: meta?.mentionedUserIds ?? [],
  })

  if (!error && data) {
    return chatRowToMessage(data as ChatMessageRow)
  }

  const rpcMissing =
    error?.code === 'PGRST202' ||
    (error?.message ?? '').includes('send_chat_message_for_session')

  if (!rpcMissing) throw error

  const fullRow = sendInputToRow({
    ...baseInput,
    replyToUserId: meta?.replyToUserId,
    mentionedUserIds: meta?.mentionedUserIds,
  })

  try {
    return await insertChatRow(fullRow)
  } catch (firstError) {
    if (!isMissingExtendedChatColumns(firstError)) throw firstError
    return insertChatRow(sendInputToBaseRow(baseInput))
  }
}

export function subscribeToChat(
  scope: ChatScope,
  ideaId: string | undefined,
  onInsert: (message: ChatMessage) => void,
): RealtimeChannel {
  const supabase = getSupabase()
  const channelName =
    scope === 'general' ? 'chat-general' : `chat-idea-${ideaId}`

  const filter =
    scope === 'general'
      ? 'scope=eq.general'
      : `scope=eq.idea,idea_id=eq.${ideaId}`

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter,
      },
      (payload) => {
        onInsert(chatRowToMessage(payload.new as ChatMessageRow))
      },
    )
    .subscribe()

  return channel
}

export function subscribeToAllChatInserts(
  onInsert: (message: ChatMessage) => void,
): RealtimeChannel {
  const channel = getSupabase()
    .channel('chat-all-notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
      },
      (payload) => {
        onInsert(chatRowToMessage(payload.new as ChatMessageRow))
      },
    )
    .subscribe()
  return channel
}

export function unsubscribeChat(channel: RealtimeChannel) {
  void getSupabase().removeChannel(channel)
}

const EDIT_WINDOW_MS = 15 * 60 * 1000

export function canEditChatMessage(msg: ChatMessage, userId: string): boolean {
  if (msg.senderUserId !== userId || msg.deletedAt) return false
  return Date.now() - new Date(msg.createdAt).getTime() < EDIT_WINDOW_MS
}

export async function editChatMessage(
  messageId: string,
  body: string,
): Promise<ChatMessage> {
  const { data, error } = await getSupabase()
    .from('chat_messages')
    .update({ body: body.trim(), edited_at: new Date().toISOString() })
    .eq('id', messageId)
    .select('*')
    .single()
  if (error) throw error
  return chatRowToMessage(data as ChatMessageRow)
}

export async function deleteChatMessage(
  messageId: string,
  userId: string,
): Promise<void> {
  const { error } = await getSupabase()
    .from('chat_messages')
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by_user_id: userId,
      body: '[הודעה נמחקה]',
    })
    .eq('id', messageId)
  if (error) throw error
}
