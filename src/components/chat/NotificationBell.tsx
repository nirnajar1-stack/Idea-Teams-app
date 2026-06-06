import { Bell, MessageCircle, MessagesSquare } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/app'
import { useChatNotifications } from '../../context/ChatNotificationsContext'
import { chatApiAvailable } from '../../api/chatApi'

export function NotificationBell() {
  const navigate = useNavigate()
  const {
    bellNotifications,
    bellUnreadTotal,
    markIdeaRead,
    markGeneralRead,
    requestOpenGeneralChat,
  } = useChatNotifications()
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  if (!chatApiAvailable()) return null

  const handleOpenIdea = (ideaId: string) => {
    setOpen(false)
    void markIdeaRead(ideaId)
    navigate(`${ROUTES.ideaDetail(ideaId)}#idea-chat`)
  }

  const handleOpenGeneral = () => {
    setOpen(false)
    void markGeneralRead()
    requestOpenGeneralChat()
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full p-2 transition-all duration-200 hover:bg-primary/10 active:scale-95"
        aria-label="התראות צ'אט"
        aria-expanded={open}
      >
        <Bell className="h-6 w-6 text-on-surface" />
        {bellUnreadTotal > 0 && (
          <span className="absolute -left-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-white">
            {bellUnreadTotal > 9 ? '9+' : bellUnreadTotal}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-[min(90vw,20rem)] animate-fade-up rounded-2xl border border-border-light bg-surface-container-lowest/95 p-2 shadow-boutique backdrop-blur-xl">
          <p className="px-3 py-2 font-label-md text-on-surface">התראות צ&apos;אט</p>
          {bellNotifications.length === 0 ? (
            <p className="px-3 py-6 text-center font-label-sm text-secondary">
              אין התראות חדשות
            </p>
          ) : (
            <ul className="max-h-72 space-y-1 overflow-y-auto">
              {bellNotifications.map((n) => (
                <li key={`${n.kind}-${n.targetId}`}>
                  <button
                    type="button"
                    onClick={() =>
                      n.kind === 'general'
                        ? handleOpenGeneral()
                        : handleOpenIdea(n.targetId)
                    }
                    className="flex w-full gap-3 rounded-xl px-3 py-3 text-right transition-colors hover:bg-primary/10"
                  >
                    <span
                      className={
                        n.kind === 'general'
                          ? 'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary'
                          : 'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-inbox/15 text-inbox'
                      }
                    >
                      {n.kind === 'general' ? (
                        <MessageCircle className="h-4 w-4" />
                      ) : (
                        <MessagesSquare className="h-4 w-4" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate font-label-md text-on-surface">
                          {n.title}
                        </span>
                        <span className="shrink-0 rounded-full bg-error px-2 py-0.5 text-[10px] font-bold text-white">
                          {n.unreadCount}
                        </span>
                      </span>
                      <span className="mt-0.5 block truncate font-label-sm text-secondary">
                        {n.latestAuthorName}: {n.latestBody}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
