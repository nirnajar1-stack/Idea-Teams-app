import { Loader2, Send, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'
import { useChatNotifications } from '../../context/ChatNotificationsContext'
import { useChat } from '../../hooks/useChat'
import { splitBodyMentions } from '../../lib/chatMentions'
import { cn } from '../../lib/cn'
import type { ChatScope } from '../../types/chat'
import { ChatMentionInput } from './ChatMentionInput'

export interface ChatPanelProps {
  scope: ChatScope
  ideaId?: string
  title: string
  subtitle?: string
  className?: string
  compact?: boolean
  markReadOnView?: boolean
}

function formatTime(iso: string) {
  try {
    return new Intl.DateTimeFormat('he-IL', {
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short',
    }).format(new Date(iso))
  } catch {
    return ''
  }
}

function MessageBody({ body }: { body: string }) {
  const segments = splitBodyMentions(body)
  return (
    <p className="whitespace-pre-wrap break-words font-body-md leading-relaxed">
      {segments.map((seg, i) =>
        seg.mention ? (
          <span key={i} className="font-semibold text-primary">
            {seg.text}
          </span>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </p>
  )
}

export function ChatPanel({
  scope,
  ideaId,
  title,
  subtitle,
  className,
  compact = false,
  markReadOnView = true,
}: ChatPanelProps) {
  const { user } = useAuth()
  const { markGeneralRead, markIdeaRead } = useChatNotifications()
  const { messages, loading, error, sending, send, edit, remove, canSend } = useChat({
    scope,
    ideaId,
  })
  const [draft, setDraft] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!markReadOnView || loading) return
    if (scope === 'general') void markGeneralRead()
    else if (ideaId) void markIdeaRead(ideaId)
  }, [markReadOnView, scope, ideaId, loading, markGeneralRead, markIdeaRead])

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, loading])

  const submitDraft = async () => {
    if (!draft.trim() || !canSend) return
    const ok = await send(draft)
    if (ok) setDraft('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void submitDraft()
  }

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-2xl border border-border-light bg-surface-container-lowest/95 shadow-card backdrop-blur-xl',
        compact ? 'h-full' : 'min-h-[320px]',
        className,
      )}
    >
      <header className="border-b border-border-light px-4 py-3">
        <h3 className="font-display text-headline-md text-on-surface">{title}</h3>
        {subtitle && <p className="mt-0.5 font-label-sm text-secondary">{subtitle}</p>}
      </header>

      <div
        ref={listRef}
        className={cn(
          'flex-1 space-y-3 overflow-y-auto px-4 py-3',
          compact ? 'max-h-[280px]' : 'min-h-[200px] max-h-[360px]',
        )}
      >
        {loading && (
          <div className="flex items-center justify-center gap-2 py-8 text-secondary">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="font-label-md">טוען הודעות…</span>
          </div>
        )}

        {!loading && error && (
          <p className="rounded-xl border border-error/25 bg-error-container/40 px-3 py-2 font-label-sm text-on-error-container">
            {error}
          </p>
        )}

        {!loading && !error && messages.length === 0 && (
          <p className="py-8 text-center font-body-md text-secondary">
            {scope === 'general'
              ? 'אין הודעות עדיין — התחילו שיחה כללית עם @תיוג.'
              : 'אין הודעות ברעיון — כתבו עדכון, תייגו עם @שם והגיבו.'}
          </p>
        )}

        {messages.map((msg) => {
          const isMine = msg.senderUserId === user?.id
          const isEditing = editingId === msg.id
          return (
            <div
              key={msg.id}
              className={cn('flex', isMine ? 'justify-start' : 'justify-end')}
            >
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-3 py-2',
                  isMine
                    ? 'rounded-tr-sm bg-primary/15 text-on-surface'
                    : 'rounded-tl-sm border border-border-light bg-surface-container-low/90',
                )}
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-label-md text-on-surface">{msg.authorName}</span>
                  <span className="font-label-sm text-secondary">{formatTime(msg.createdAt)}</span>
                  {msg.editedAt && (
                    <span className="font-label-sm text-secondary">(נערך)</span>
                  )}
                </div>
                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      value={editDraft}
                      onChange={(e) => setEditDraft(e.target.value)}
                      className="w-full rounded-lg border border-border-light bg-surface-container-lowest p-2 font-body-md"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="font-label-sm text-primary"
                        onClick={async () => {
                          const ok = await edit(msg.id, editDraft)
                          if (ok) {
                            setEditingId(null)
                            toast.success('ההודעה עודכנה')
                          }
                        }}
                      >
                        שמירה
                      </button>
                      <button
                        type="button"
                        className="font-label-sm text-secondary"
                        onClick={() => setEditingId(null)}
                      >
                        ביטול
                      </button>
                    </div>
                  </div>
                ) : (
                  <MessageBody body={msg.body} />
                )}
                {isMine && !msg.deletedAt && !isEditing && (
                  <div className="mt-1 flex gap-2">
                    <button
                      type="button"
                      aria-label="עריכה"
                      className="text-secondary hover:text-primary"
                      onClick={() => {
                        setEditingId(msg.id)
                        setEditDraft(msg.body)
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="מחיקה"
                      className="text-secondary hover:text-error"
                      onClick={async () => {
                        if (await remove(msg.id)) toast.success('ההודעה נמחקה')
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex gap-2 border-t border-border-light p-3"
      >
        <ChatMentionInput
          value={draft}
          onChange={setDraft}
          onSubmit={() => void submitDraft()}
          disabled={!canSend}
          enableMentions
          placeholder="כתוב הודעה… הקלד @ לתיוג"
        />
        <button
          type="submit"
          disabled={!canSend || !draft.trim()}
          className="btn-boutique flex h-11 w-11 shrink-0 items-center justify-center p-0 disabled:opacity-50"
          aria-label="שליחה"
        >
          {sending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </form>
    </div>
  )
}
