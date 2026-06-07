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
import { usePreferences } from './PreferencesContext'
import {
  buildBellNotifications,
  buildCursorMap,
  countUnreadGeneral,
  cursorKey,
} from '../lib/chatNotifications'
import {
  buildTargetDateNotifications,
  filterNotificationsByPrefs,
} from '../lib/notificationPrefs'
import { DEFAULT_USER_PREFERENCES } from '../types/preferences'
import type { ChatBellNotification, ChatMessage } from '../types/chat'

interface ChatNotificationsContextValue {
  generalUnread: number
  bellNotifications: ChatBellNotification[]
  bellUnreadTotal: number
  ideaNotifications: ChatBellNotification[]
  ideaUnreadTotal: number
  refresh: () => Promise<void>
  markGeneralRead: () => Promise<void>
  markIdeaRead: (ideaId: string) => Promise<void>
  requestOpenGeneralChat: () => void
  openGeneralChatTick: number
  ready: boolean
}

const ChatNotificationsContext = createContext<ChatNotificationsContextValue | null>(null)

export function ChatNotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { ideas, visibleIdeas } = useIdeas()
  const { prefs: userPrefs } = usePreferences()
  const [generalMessages, setGeneralMessages] = useState<ChatMessage[]>([])
  const [ideaMessages, setIdeaMessages] = useState<ChatMessage[]>([])
  const [cursorMap, setCursorMap] = useState<Map<string, string>>(new Map())
  const [openGeneralChatTick, setOpenGeneralChatTick] = useState(0)
  const [ready, setReady] = useState(false)

  const prefs = userPrefs ?? (user ? { userId: user.id, ...DEFAULT_USER_PREFERENCES } : null)
  const ideasById = useMemo(() => new Map(ideas.map((i) => [i.id, i])), [ideas])

  const refresh = useCallback(async () => {
    if (!user || !chatApiAvailable()) {
      setReady(true)
      return
    }
    try {
      const [general, idea] = await Promise.all([
        fetchGeneralMessages(),
        fetchAllIdeaMessages(),
      ])
      setGeneralMessages(general)
      setIdeaMessages(idea)
      try {
        const cursors = await fetchReadCursors(user.id)
        setCursorMap(buildCursorMap(cursors))
      } catch {
        setCursorMap(new Map())
      }
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
    if (!user || !prefs?.notifyGeneralMentions) return 0
    const lastRead =
      cursorMap.get(cursorKey('general')) ?? '1970-01-01T00:00:00Z'
    return countUnreadGeneral(generalMessages, user.id, lastRead)
  }, [generalMessages, cursorMap, user, prefs?.notifyGeneralMentions])

  const bellNotifications = useMemo(() => {
    if (!user || !prefs) return []
    const chatNotifications = buildBellNotifications(
      generalMessages,
      ideaMessages,
      ideasById,
      user.id,
      cursorMap,
    )
    const targetDateNotifications = buildTargetDateNotifications(
      visibleIdeas,
      user.id,
      prefs,
    )
    return filterNotificationsByPrefs(
      [...chatNotifications, ...targetDateNotifications],
      prefs,
    )
  }, [generalMessages, ideaMessages, ideasById, user, cursorMap, prefs, visibleIdeas])

  const ideaNotifications = useMemo(
    () => bellNotifications.filter((n) => n.kind === 'idea'),
    [bellNotifications],
  )

  const ideaUnreadTotal = useMemo(
    () => ideaNotifications.reduce((sum, n) => sum + n.unreadCount, 0),
    [ideaNotifications],
  )

  const bellUnreadTotal = useMemo(
    () => bellNotifications.reduce((sum, n) => sum + n.unreadCount, 0),
    [bellNotifications],
  )

  const requestOpenGeneralChat = useCallback(() => {
    setOpenGeneralChatTick((t) => t + 1)
  }, [])

  const markGeneralRead = useCallback(async () => {
    if (!user) return
    const now = new Date().toISOString()
    setCursorMap((prev) => new Map(prev).set(cursorKey('general'), now))
    try {
      await markChatRead(user.id, 'general')
    } catch {
      /* keep optimistic cursor until next successful refresh */
    }
  }, [user])

  const markIdeaRead = useCallback(
    async (ideaId: string) => {
      if (!user) return
      const now = new Date().toISOString()
      setCursorMap((prev) => new Map(prev).set(cursorKey('idea', ideaId), now))
      try {
        await markChatRead(user.id, 'idea', ideaId)
      } catch {
        /* keep optimistic cursor until next successful refresh */
      }
    },
    [user],
  )

  const value = useMemo(
    () => ({
      generalUnread,
      bellNotifications,
      bellUnreadTotal,
      ideaNotifications,
      ideaUnreadTotal,
      refresh,
      markGeneralRead,
      markIdeaRead,
      requestOpenGeneralChat,
      openGeneralChatTick,
      ready,
    }),
    [
      generalUnread,
      bellNotifications,
      bellUnreadTotal,
      ideaNotifications,
      ideaUnreadTotal,
      refresh,
      markGeneralRead,
      markIdeaRead,
      requestOpenGeneralChat,
      openGeneralChatTick,
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
