import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  chatApiAvailable,
  fetchAllIdeaMessages,
  fetchGeneralMessages,
  fetchReadCursors,
  markChatRead,
  subscribeToAllChatInserts,
  unsubscribeChat,
} from '../api/chatApi'
import { useAuth } from './AuthContext'
import { useIdeas } from './IdeasContext'
import {
  buildCursorMap,
  buildIdeaNotifications,
  countUnreadGeneral,
  cursorKey,
} from '../lib/chatNotifications'
import type { ChatMessage, IdeaChatNotification } from '../types/chat'

interface ChatNotificationsContextValue {
  generalUnread: number
  ideaNotifications: IdeaChatNotification[]
  ideaUnreadTotal: number
  refresh: () => Promise<void>
  markGeneralRead: () => Promise<void>
  markIdeaRead: (ideaId: string) => Promise<void>
  ready: boolean
}

const ChatNotificationsContext = createContext<ChatNotificationsContextValue | null>(null)

export function ChatNotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { ideas } = useIdeas()
  const [generalMessages, setGeneralMessages] = useState<ChatMessage[]>([])
  const [ideaMessages, setIdeaMessages] = useState<ChatMessage[]>([])
  const [cursorMap, setCursorMap] = useState<Map<string, string>>(new Map())
  const [ready, setReady] = useState(false)

  const ideasById = useMemo(() => new Map(ideas.map((i) => [i.id, i])), [ideas])

  const refresh = useCallback(async () => {
    if (!user || !chatApiAvailable()) {
      setReady(true)
      return
    }
    try {
      const [general, idea, cursors] = await Promise.all([
        fetchGeneralMessages(),
        fetchAllIdeaMessages(),
        fetchReadCursors(user.id),
      ])
      setGeneralMessages(general)
      setIdeaMessages(idea)
      setCursorMap(buildCursorMap(cursors))
    } catch {
      /* keep previous */
    } finally {
      setReady(true)
    }
  }, [user])

  useEffect(() => {
    setReady(false)
    void refresh()
  }, [refresh])

  useEffect(() => {
    if (!user || !chatApiAvailable()) return

    const channel = subscribeToAllChatInserts((msg) => {
      if (msg.scope === 'general') {
        setGeneralMessages((prev) =>
          prev.some((m) => m.id === msg.id) ? prev : [...prev, msg],
        )
      } else {
        setIdeaMessages((prev) =>
          prev.some((m) => m.id === msg.id) ? prev : [...prev, msg],
        )
      }
    })

    return () => unsubscribeChat(channel)
  }, [user])

  const generalUnread = useMemo(() => {
    if (!user) return 0
    const lastRead =
      cursorMap.get(cursorKey('general')) ?? '1970-01-01T00:00:00Z'
    return countUnreadGeneral(generalMessages, user.id, lastRead)
  }, [generalMessages, cursorMap, user])

  const ideaNotifications = useMemo(() => {
    if (!user) return []
    return buildIdeaNotifications(ideaMessages, ideasById, user.id, cursorMap)
  }, [ideaMessages, ideasById, user, cursorMap])

  const ideaUnreadTotal = useMemo(
    () => ideaNotifications.reduce((sum, n) => sum + n.unreadCount, 0),
    [ideaNotifications],
  )

  const markGeneralRead = useCallback(async () => {
    if (!user) return
    const now = new Date().toISOString()
    setCursorMap((prev) => new Map(prev).set(cursorKey('general'), now))
    try {
      await markChatRead(user.id, 'general')
    } catch {
      void refresh()
    }
  }, [user, refresh])

  const markIdeaRead = useCallback(
    async (ideaId: string) => {
      if (!user) return
      const now = new Date().toISOString()
      setCursorMap((prev) => new Map(prev).set(cursorKey('idea', ideaId), now))
      try {
        await markChatRead(user.id, 'idea', ideaId)
      } catch {
        void refresh()
      }
    },
    [user, refresh],
  )

  const value = useMemo(
    () => ({
      generalUnread,
      ideaNotifications,
      ideaUnreadTotal,
      refresh,
      markGeneralRead,
      markIdeaRead,
      ready,
    }),
    [
      generalUnread,
      ideaNotifications,
      ideaUnreadTotal,
      refresh,
      markGeneralRead,
      markIdeaRead,
      ready,
    ],
  )

  return (
    <ChatNotificationsContext.Provider value={value}>
      {children}
    </ChatNotificationsContext.Provider>
  )
}

export function useChatNotifications() {
  const ctx = useContext(ChatNotificationsContext)
  if (!ctx) {
    throw new Error('useChatNotifications must be used within ChatNotificationsProvider')
  }
  return ctx
}
