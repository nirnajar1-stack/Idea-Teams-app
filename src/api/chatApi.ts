import type { RealtimeChannel } from '@supabase/supabase-js'
import { getSupabase, isSupabaseEnabled } from '../lib/supabaseClient'
import {
  chatRowToMessage,
  sendInputToRow,
  type ChatMessageRow,
} from '../lib/chatMappers'
import type { ChatMessage, ChatScope } from '../types/chat'
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

export async function sendChatMessage(
  user: AppUser,
  scope: ChatScope,
  body: string,
  ideaId?: string,
): Promise<ChatMessage> {
  const row = sendInputToRow({
    scope,
    ideaId,
    body,
    senderUserId: user.id,
    guestSessionId: user.guestSessionId,
    authorName: user.name,
    authorInitials: user.initials,
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

export function unsubscribeChat(channel: RealtimeChannel) {
  void getSupabase().removeChannel(channel)
}
