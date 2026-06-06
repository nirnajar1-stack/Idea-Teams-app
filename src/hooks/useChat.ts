import { useCallback, useEffect, useRef, useState } from 'react'
import {
  chatApiAvailable,
  canEditChatMessage,
  deleteChatMessage,
  editChatMessage,
  fetchGeneralMessages,
  fetchIdeaMessages,
  sendChatMessage,
  subscribeToChat,
  unsubscribeChat,
} from '../api/chatApi'
import { useAuth } from '../context/AuthContext'
import { useUsers } from '../context/UsersContext'
import { formatChatSendError } from '../lib/chatErrors'
import { parseMentionedUserIds } from '../lib/chatMentions'
import type { ChatMessage, ChatScope } from '../types/chat'

export interface UseChatOptions {
  scope: ChatScope
  ideaId?: string
  enabled?: boolean
}

export function useChat({ scope, ideaId, enabled = true }: UseChatOptions) {
  const { user } = useAuth()
  const { users } = useUsers()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const messageIds = useRef(new Set<string>())

  const cloudReady = chatApiAvailable()
  const canLoad =
    enabled && cloudReady && !!user && (scope === 'general' || !!ideaId)

  const addMessage = useCallback((msg: ChatMessage) => {
    if (messageIds.current.has(msg.id)) return
    messageIds.current.add(msg.id)
    setMessages((prev) => [...prev, msg])
  }, [])

  useEffect(() => {
    if (!canLoad) {
      setLoading(false)
      if (!cloudReady) {
        setError('צ\'אט זמין רק עם חיבור Supabase לענן.')
      } else {
        setError(null)
      }
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)
    messageIds.current.clear()

    const load =
      scope === 'general' ? fetchGeneralMessages : () => fetchIdeaMessages(ideaId!)

    void load()
      .then((list) => {
        if (cancelled) return
        list.forEach((m) => messageIds.current.add(m.id))
        setMessages(list)
      })
      .catch(() => {
        if (!cancelled) setError('טעינת הודעות הצ\'אט נכשלה.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    const channel = subscribeToChat(scope, ideaId, (msg) => {
      if (cancelled) return
      if (scope === 'idea' && msg.ideaId !== ideaId) return
      addMessage(msg)
    })

    return () => {
      cancelled = true
      unsubscribeChat(channel)
    }
  }, [canLoad, scope, ideaId, cloudReady, addMessage])

  const send = useCallback(
    async (body: string) => {
      const trimmed = body.trim()
      if (!trimmed || !user || !cloudReady) return false
      if (scope === 'idea' && !ideaId) return false

      const validUserIds = new Set(users.map((u) => u.id))

      const lastMsg = messages.at(-1)
      const rawReply =
        lastMsg && lastMsg.senderUserId !== user.id
          ? lastMsg.senderUserId
          : undefined
      const replyToUserId =
        rawReply && validUserIds.has(rawReply) ? rawReply : undefined

      const mentionedUserIds = parseMentionedUserIds(trimmed, users, user.id).filter(
        (id) => validUserIds.has(id),
      )

      setSending(true)
      setError(null)
      try {
        const msg = await sendChatMessage(user, scope, trimmed, ideaId, {
          replyToUserId,
          mentionedUserIds,
        })
        addMessage(msg)
        return true
      } catch (err) {
        setError(formatChatSendError(err))
        return false
      } finally {
        setSending(false)
      }
    },
    [user, users, cloudReady, scope, ideaId, messages, addMessage],
  )

  const edit = useCallback(
    async (messageId: string, body: string) => {
      if (!user || !cloudReady) return false
      const msg = messages.find((m) => m.id === messageId)
      if (!msg || !canEditChatMessage(msg, user.id)) return false
      setError(null)
      try {
        const updated = await editChatMessage(messageId, body)
        setMessages((prev) => prev.map((m) => (m.id === messageId ? updated : m)))
        return true
      } catch {
        setError('עריכת ההודעה נכשלה.')
        return false
      }
    },
    [user, cloudReady, messages],
  )

  const remove = useCallback(
    async (messageId: string) => {
      if (!user || !cloudReady) return false
      const msg = messages.find((m) => m.id === messageId)
      if (!msg || msg.senderUserId !== user.id) return false
      setError(null)
      try {
        await deleteChatMessage(messageId, user.id)
        setMessages((prev) => prev.filter((m) => m.id !== messageId))
        messageIds.current.delete(messageId)
        return true
      } catch {
        setError('מחיקת ההודעה נכשלה.')
        return false
      }
    },
    [user, cloudReady, messages],
  )

  return {
    messages,
    loading,
    error,
    sending,
    send,
    edit,
    remove,
    cloudReady,
    canSend: canLoad && !sending,
  }
}
