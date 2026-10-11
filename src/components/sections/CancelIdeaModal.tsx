import { Ban, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { IDEA_TERM } from '../../constants/terminology'
import { Textarea } from '../ui/Textarea'
import { cn } from '../../lib/cn'

export interface CancelIdeaModalProps {
  open: boolean
  ideaTitle?: string
  onConfirm: (reason: string) => void
  onCancel: () => void
}

export function CancelIdeaModal({
  open,
  ideaTitle,
  onConfirm,
  onCancel,
}: CancelIdeaModalProps) {
  const [reason, setReason] = useState('')
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    if (open) {
      setReason('')
      setTouched(false)
    }
  }, [open])

  if (!open) return null

  const trimmed = reason.trim()
  const invalid = touched && trimmed.length === 0

  const submit = () => {
    setTouched(true)
    if (!trimmed) return
    onConfirm(trimmed)
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-idea-modal-title"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md animate-fade-up rounded-[1.85rem] border border-transparent bg-surface-container-lowest p-6 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-error/10">
              <Ban className="h-5 w-5 text-error" />
            </div>
            <h2
              id="cancel-idea-modal-title"
              className="font-display text-headline-md text-on-surface"
            >
              {IDEA_TERM.cancel}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full p-1 text-secondary hover:bg-surface-container-low"
            aria-label="סגור"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-4 font-body-md text-on-surface-variant">
          {ideaTitle
            ? `לבטל את «${ideaTitle}»? הבקשה/רעיון יישאר במערכת עם סטטוס בוטל.`
            : 'לבטל את הבקשה/רעיון? הוא יישאר במערכת עם סטטוס בוטל.'}
        </p>

        <div className="mb-6">
          <Textarea
            label={`${IDEA_TERM.cancelReason} *`}
            name="cancelReason"
            rows={3}
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="למשל: כבר לא רלוונטי / כפילות / הוחלט אחרת…"
            className={cn(invalid && 'border-error focus:ring-error')}
            aria-invalid={invalid || undefined}
          />
          {invalid && (
            <p className="mt-1.5 font-label-sm text-error">יש להזין סיבת ביטול</p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary-light flex-1 py-3"
          >
            חזרה
          </button>
          <button
            type="button"
            onClick={submit}
            className="flex-1 rounded-full bg-error py-3 font-label-md text-on-primary transition-colors hover:bg-error/90"
          >
            בטל בקשה/רעיון
          </button>
        </div>
      </div>
    </div>
  )
}
