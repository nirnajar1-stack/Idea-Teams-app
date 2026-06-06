import type { RealtimeChannel } from '@supabase/supabase-js'
import { getSupabase, isSupabaseEnabled } from '../lib/supabaseClient'
import {
  chatRowToMessage,
  sendInputToRow,
  type ChatMessageRow,
  type ChatReadCursorRow,
} from '../lib/chatMappers'
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
  const { data, error } = await getSupabase()
    .from('chat_read_cursors')
    .select('scope, idea_id, last_read_at')
    .eq('user_id', userId)
  if (error) throw error
  return (data as ChatReadCursorRow[]).map((row) => ({
    scope: row.scope,
    ideaId: row.idea_id ?? undefined,
    lastReadAt: row.last_read_at,
  }))
}

export async function markChatRead(
  userId: string,
  scope: ChatScope,
  ideaId?: string,
): Promise<void> {
  const now = new Date().toISOString()

  if (scope === 'general') {
    const { data: existing } = await getSupabase()
      .from('chat_read_cursors')
      .select('id')
      .eq('user_id', userId)
      .eq('scope', 'general')
      .maybeSingle()

    if (existing?.id) {
      const { error } = await getSupabase()
        .from('chat_read_cursors')
        .update({ last_read_at: now })
        .eq('id', existing.id)
      if (error) throw error
      return
    }

    const { error } = await getSupabase().from('chat_read_cursors').insert({
      user_id: userId,
      scope: 'general',
      idea_id: null,
      last_read_at: now,
    })
    if (error) throw error
    return
  }

  if (!ideaId) return

  const { data: existing } = await getSupabase()
    .from('chat_read_cursors')
    .select('id')
    .eq('user_id', userId)
    .eq('scope', 'idea')
    .eq('idea_id', ideaId)
    .maybeSingle()

  if (existing?.id) {
    const { error } = await getSupabase()
      .from('chat_read_cursors')
      .update({ last_read_at: now })
      .eq('id', existing.id)
    if (error) throw error
    return
  }

  const { error } = await getSupabase().from('chat_read_cursors').insert({
    user_id: userId,
    scope: 'idea',
    idea_id: ideaId,
    last_read_at: now,
  })
  if (error) throw error
}

export async function sendChatMessage(
  user: AppUser,
  scope: ChatScope,
  body: string,
  ideaId?: string,
  meta?: { replyToUserId?: string; mentionedUserIds?: string[] },
): Promise<ChatMessage> {
  const row = sendInputToRow({
    scope,
    ideaId,
    body,
    senderUserId: user.id,
    guestSessionId: user.guestSessionId,
    authorName: user.name,
    authorInitials: user.initials,
    replyToUserId: meta?.replyToUserId,
    mentionedUserIds: meta?.mentionedUserIds,
  })

  const { data, error } = await getSupabase()
    .from('chat_messages')
    .insert(row)
    .select('*')
    .single()
  if (error) throw error
  return chatRowToMessage(data as ChatMessageRow)
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
