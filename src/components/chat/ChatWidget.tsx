import { MessageCircle, X } from 'lucide-react'
import { useState } from 'react'
import { chatApiAvailable } from '../../api/chatApi'
import { cn } from '../../lib/cn'
import { ChatPanel } from './ChatPanel'

export function ChatWidget() {
  const [open, setOpen] = useState(false)

  if (!chatApiAvailable()) return null

  return (
    <div className="fixed bottom-24 start-4 z-40 md:bottom-6">
      {open && (
        <div className="mb-3 w-[min(100vw-2rem,22rem)] animate-fade-up">
          <ChatPanel
            scope="general"
            title="צ'אט כללי"
            subtitle="שיחה לכל הצוות באפליקציה"
            compact
          />
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'סגור צ\'אט' : 'פתח צ\'אט כללי'}
        aria-expanded={open}
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-full shadow-glow transition-all duration-200 active:scale-95',
          open
            ? 'border border-border-light bg-surface-container-low text-on-surface'
            : 'btn-boutique',
        )}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  )
}
