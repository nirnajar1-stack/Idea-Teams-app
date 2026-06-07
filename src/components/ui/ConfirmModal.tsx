import { AlertTriangle, X } from 'lucide-react'
import { cn } from '../../lib/cn'

export interface ConfirmModalProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'אישור',
  cancelLabel = 'ביטול',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md animate-fade-up rounded-2xl border border-border-light bg-surface-container-lowest p-6 shadow-boutique"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {variant === 'danger' && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-error/10">
                <AlertTriangle className="h-5 w-5 text-error" />
              </div>
            )}
            <h2 id="confirm-modal-title" className="font-display text-headline-md text-on-surface">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1 text-secondary hover:bg-surface-container-low"
            aria-label="סגור"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-6 font-body-md text-on-surface-variant">{message}</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-border-light py-3 font-label-md text-on-surface transition-colors hover:bg-surface-container-low"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              'flex-1 rounded-xl py-3 font-label-md text-on-primary transition-all active:scale-[0.98]',
              variant === 'danger' ? 'bg-error hover:bg-error/90' : 'btn-boutique',
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
