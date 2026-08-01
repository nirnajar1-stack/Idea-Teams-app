import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Archive,
  CheckCircle2,
  CirclePlus,
  Loader2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { ROUTES } from '../../constants/app'
import { useAuth } from '../../context/AuthContext'
import { useIdeas } from '../../context/IdeasContext'
import { formatIdeaSaveError } from '../../lib/ideaSaveErrors'
import { resolveVisibilityOnCreate } from '../../lib/ideaVisibility'
import { todayDateKey } from '../../lib/ideaUtils'
import { cn } from '../../lib/cn'
import type { IdeaCategory, IdeaPriority, IdeaSource } from '../../types/idea'
import { DEFAULT_IDEA_SOURCE } from '../../types/idea'
import { CategoryPicker } from '../ui/CategoryPicker'
import { DateInput } from '../ui/DateInput'
import { Input } from '../ui/Input'
import { PriorityChip } from '../ui/PriorityChip'
import { Textarea } from '../ui/Textarea'
import { IdeaSourceSelect } from './IdeaSourceSelect'
import { TaskLabelSelect } from './TaskLabelSelect'

export interface QuickAddSheetProps {
  open: boolean
  onClose: () => void
}

type SubmitState = 'idle' | 'loading' | 'success'

function defaultTargetDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 14)
  return d.toISOString().slice(0, 10)
}

function createInitialForm() {
  return {
    title: '',
    description: '',
    category: 'development' as IdeaCategory,
    ideaSource: DEFAULT_IDEA_SOURCE as IdeaSource,
    priority: 'medium' as IdeaPriority,
    targetStartDate: defaultTargetDate(),
    labelIds: [] as string[],
    sendToMaybeInbox: false,
  }
}

export function QuickAddSheet({ open, onClose }: QuickAddSheetProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addIdea } = useIdeas()
  const titleId = useId()
  const titleRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const [form, setForm] = useState(createInitialForm)
  const [descOpen, setDescOpen] = useState(false)
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [showValidation, setShowValidation] = useState(false)

  const resetForm = () => {
    setForm(createInitialForm())
    setDescOpen(false)
    setShowValidation(false)
    setSubmitState('idle')
  }

  useEffect(() => {
    if (!open) return
    resetForm()
    const t = window.setTimeout(() => titleRef.current?.focus(), 50)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.clearTimeout(t)
      document.body.style.overflow = prevOverflow
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only on open
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && submitState === 'idle') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, submitState])

  if (!open) return null

  const save = async (andNew: boolean) => {
    setShowValidation(true)
    if (!form.title.trim()) {
      titleRef.current?.focus()
      return
    }
    if (!form.category) {
      toast.error('יש לבחור קטגוריה')
      return
    }
    if (!form.targetStartDate) {
      toast.error('יש לבחור תאריך יעד להתחלה')
      return
    }

    setSubmitState('loading')
    try {
      const description =
        form.description.trim() || form.title.trim()
      const idea = await addIdea({
        title: form.title.trim(),
        description,
        category: form.category,
        ideaSource: form.ideaSource,
        priority: form.priority,
        targetStartDate: form.targetStartDate || todayDateKey(),
        labelIds: form.labelIds,
        sendToMaybeInbox: form.sendToMaybeInbox,
        ideaKind: 'standard',
        visibility: user ? resolveVisibilityOnCreate(user, 'team') : 'team',
      })
      setSubmitState('success')
      toast.success(
        form.sendToMaybeInbox ? 'נשמר ב-Inbox' : 'הבקשה/רעיון נוסף',
      )

      if (andNew) {
        resetForm()
        window.setTimeout(() => titleRef.current?.focus(), 40)
        return
      }

      onClose()
      navigate(
        form.sendToMaybeInbox ? ROUTES.inbox : ROUTES.ideaDetail(idea.id),
      )
    } catch (err) {
      setSubmitState('idle')
      console.error('quickAdd failed', err)
      toast.error(formatIdeaSaveError(err))
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    void save(false)
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center md:items-center md:p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="סגור"
        disabled={submitState === 'loading'}
        onClick={() => submitState === 'idle' && onClose()}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'relative z-10 flex max-h-[min(92dvh,720px)] w-full flex-col border border-transparent bg-surface-container-lowest shadow-card',
          'animate-fade-up rounded-t-[1.85rem] md:max-w-lg md:rounded-[1.85rem]',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 flex-col border-b border-border-light">
          <div className="flex justify-center pt-2 md:hidden" aria-hidden>
            <span className="h-1 w-10 rounded-full bg-outline-variant/60" />
          </div>
          <div className="flex items-start justify-between gap-3 px-4 py-3 md:px-5 md:py-4">
            <div className="min-w-0 text-right">
              <h2
                id={titleId}
                className="font-display text-headline-md text-on-surface"
              >
                בקשה/רעיון חדש
              </h2>
              <p className="mt-0.5 text-body-sm text-secondary">
                רישום מהיר —{' '}
                <Link
                  to={ROUTES.addIdea}
                  className="text-primary underline-offset-2 hover:underline"
                  onClick={onClose}
                >
                  טופס מלא
                </Link>
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={submitState === 'loading'}
              className="flex min-h-12 min-w-12 items-center justify-center text-secondary transition-colors hover:text-on-surface"
              aria-label="סגור"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={handleSubmit}
        >
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4 md:px-5">
            <Input
              ref={titleRef}
              label="כותרת"
              name="title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="למשל: ייעול תהליך החיוב החודשי"
              required
              error={showValidation && !form.title.trim()}
            />

            <div>
              {!descOpen ? (
                <button
                  type="button"
                  onClick={() => setDescOpen(true)}
                  className="text-label-md text-secondary underline-offset-2 hover:text-primary hover:underline"
                >
                  + הוסף תיאור
                </button>
              ) : (
                <Textarea
                  label="תיאור"
                  name="description"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="מהות הבקשה, הבעיה, ואיך ליישם…"
                  rows={3}
                />
              )}
            </div>

            <div className="space-y-2">
              <span className="block font-label-md text-secondary">חשיבות</span>
              <div className="flex flex-wrap gap-2">
                {(['low', 'medium', 'high'] as IdeaPriority[]).map((p) => (
                  <PriorityChip
                    key={p}
                    priority={p}
                    selected={form.priority === p}
                    onSelect={() => setForm((f) => ({ ...f, priority: p }))}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="block font-label-md text-secondary">
                קטגוריה <span className="text-error">*</span>
              </span>
              <CategoryPicker
                value={form.category}
                onChange={(category) => setForm((f) => ({ ...f, category }))}
                required
              />
            </div>

            <DateInput
              label="תאריך יעד להתחלה"
              name="targetStartDate"
              value={form.targetStartDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, targetStartDate: e.target.value }))
              }
              required
            />

            <details className="overflow-hidden rounded-[1.35rem] border border-border-light bg-surface-container-lowest shadow-soft open:border-primary/20">
              <summary className="cursor-pointer list-none px-3 py-3 font-label-md text-secondary marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex min-h-10 items-center justify-between gap-2">
                  עוד אפשרויות
                  <span className="text-xs text-tertiary">מקור · לייבלים</span>
                </span>
              </summary>
              <div className="space-y-5 border-t border-border-light px-3 py-4">
                <IdeaSourceSelect
                  value={form.ideaSource}
                  onChange={(ideaSource) => setForm((f) => ({ ...f, ideaSource }))}
                />
                <TaskLabelSelect
                  value={form.labelIds}
                  onChange={(labelIds) => setForm((f) => ({ ...f, labelIds }))}
                />
              </div>
            </details>

            <button
              type="button"
              role="switch"
              aria-checked={form.sendToMaybeInbox}
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  sendToMaybeInbox: !f.sendToMaybeInbox,
                }))
              }
              className={cn(
                'flex min-h-12 w-full items-center gap-3 border px-3 py-2.5 text-right transition-colors',
                form.sendToMaybeInbox
                  ? 'border-primary/40 bg-primary/5 text-primary'
                  : 'border-border-light text-secondary hover:border-outline-variant',
              )}
            >
              <Archive className="h-4 w-4 shrink-0" aria-hidden />
              <span className="flex-1 font-label-md">
                {form.sendToMaybeInbox
                  ? 'יישמר ב-Inbox'
                  : 'שלח ל-Inbox (אולי בהמשך)'}
              </span>
            </button>
          </div>

          <div className="flex shrink-0 flex-col gap-2 border-t border-border-light bg-surface-container-lowest px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:flex-row md:px-5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitState === 'loading'}
              className="btn-secondary-light order-3 min-h-12 flex-1 md:order-1"
            >
              ביטול
            </button>
            <button
              type="button"
              disabled={submitState !== 'idle'}
              onClick={() => void save(true)}
              className="order-2 min-h-12 flex-1 rounded-full border border-border-light font-label-md text-on-surface transition-colors hover:bg-surface-container-low disabled:opacity-60"
            >
              שמור וחדש
            </button>
            <button
              type="submit"
              disabled={submitState !== 'idle'}
              className={cn(
                'order-1 flex min-h-12 flex-[1.4] items-center justify-center gap-2 rounded-full md:order-3',
                submitState === 'success'
                  ? 'bg-success-vibrant text-on-primary'
                  : 'btn-boutique',
                submitState === 'loading' && 'opacity-80',
              )}
            >
              {submitState === 'loading' && (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  שומר…
                </>
              )}
              {submitState === 'success' && (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  נשמר
                </>
              )}
              {submitState === 'idle' && (
                <>
                  <CirclePlus className="h-5 w-5" />
                  שמור
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
