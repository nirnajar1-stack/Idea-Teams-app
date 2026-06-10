import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { chatApiAvailable } from '../../api/chatApi'
import { useChatNotifications } from '../../context/ChatNotificationsContext'
import { cn } from '../../lib/cn'
import { ChatPanel } from './ChatPanel'
import { DogChatAvatar } from './DogChatAvatar'

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const { generalUnread, markGeneralRead, openGeneralChatTick } = useChatNotifications()

  useEffect(() => {
    if (openGeneralChatTick > 0) {
      setOpen(true)
      void markGeneralRead()
    }
  }, [openGeneralChatTick, markGeneralRead])

  if (!chatApiAvailable()) return null

  const handleToggle = () => {
    setOpen((v) => {
      const next = !v
      if (next) void markGeneralRead()
      return next
    })
  }

  return (
    <div className="fixed bottom-mobile-nav start-4 z-40 md:bottom-6">
      {open && (
        <div className="mb-3 w-[min(100vw-2rem,22rem)] animate-fade-up">
          <ChatPanel
            scope="general"
            title="צ'אט כללי"
            subtitle="שיחה לכל הצוות — הקלד @ לתיוג"
            compact
            markReadOnView={open}
          />
        </div>
      )}

      <button
        type="button"
        onClick={handleToggle}
        aria-label={open ? 'סגור צ\'אט' : 'פתח צ\'אט כללי'}
        aria-expanded={open}
        className={cn(
          'relative flex h-16 w-16 items-center justify-center rounded-full transition-colors duration-200',
          open
            ? 'border border-border-light bg-surface-container-low'
            : 'bg-primary text-on-primary transition-colors duration-300 hover:bg-primary-deep',
        )}
      >
        {open ? (
          <X className="h-6 w-6 text-on-surface" />
        ) : (
          <DogChatAvatar size="lg" animated />
        )}
        {!open && generalUnread > 0 && (
          <span className="absolute -left-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-surface-container-lowest bg-error px-1.5 text-[11px] font-bold text-white">
            {generalUnread > 99 ? '99+' : generalUnread}
          </span>
        )}
      </button>
    </div>
  )
}
