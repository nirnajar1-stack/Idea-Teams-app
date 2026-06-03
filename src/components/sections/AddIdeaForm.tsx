import {
  Activity,
  CheckCircle2,
  CirclePlus,
  Code,
  Lightbulb,
  Loader2,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useIdeas } from '../../context/IdeasContext'
import { ROUTES } from '../../constants/app'
import { canCreateContainerIdea } from '../../lib/permissions'
import type { IdeaCategory, IdeaPriority } from '../../types/idea'
import { ContainerKindToggle } from '../ui/ContainerKindToggle'
import { CategoryCard } from '../ui/CategoryCard'
import { DateInput } from '../ui/DateInput'
import { InboxToggle } from '../ui/InboxToggle'
import { Input } from '../ui/Input'
import { PriorityChip } from '../ui/PriorityChip'
import { Textarea } from '../ui/Textarea'
import { cn } from '../../lib/cn'

type SubmitState = 'idle' | 'loading' | 'success'

function defaultTargetDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 14)
  return d.toISOString().slice(0, 10)
}

export function AddIdeaForm() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addIdea } = useIdeas()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<IdeaCategory>('development')
  const [priority, setPriority] = useState<IdeaPriority>('medium')
  const [targetStartDate, setTargetStartDate] = useState(defaultTargetDate)
  const [sendToMaybeInbox, setSendToMaybeInbox] = useState(false)
  const [isContainer, setIsContainer] = useState(false)
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const allowContainer = canCreateContainerIdea(user)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim() || !targetStartDate) return

    setSubmitState('loading')
    await new Promise((r) => setTimeout(r, 800))

    const idea = addIdea({
      title,
      description,
      category,
      priority,
      targetStartDate,
      sendToMaybeInbox: isContainer ? false : sendToMaybeInbox,
      ideaKind: isContainer ? 'container' : 'standard',
    })
    setSubmitState('success')
    await new Promise((r) => setTimeout(r, 1200))
    navigate(
      sendToMaybeInbox ? ROUTES.inbox : ROUTES.ideaDetail(idea.id),
    )
  }

  return (
    <>
      <div className="mb-10 animate-fade-up text-right">
        <span className="section-eyebrow">רעיון חדש</span>
        <h1 className="mb-2 font-display text-headline-lg text-on-surface">
          הוספת רעיון חדש
        </h1>
        <p className="font-body-md text-secondary">
          יש לך רעיון מבריק? שתף אותו עם הצוות — הרעיון יירשם בשם{' '}
          <strong className="text-on-surface">{user?.name}</strong>.
        </p>
      </div>

      <div className="glass-card animate-fade-up p-6 md:p-8" style={{ animationDelay: '80ms' }}>
        <form className="space-y-8" onSubmit={handleSubmit}>
          <Input
            label="כותרת הרעיון"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="למשל: ייעול תהליך החיוב החודשי"
            required
          />

          <div className="space-y-3">
            <span className="block font-label-md text-secondary">קטגוריה</span>
            <div className="grid grid-cols-2 gap-4">
              <CategoryCard
                category="development"
                label="פיתוח"
                icon={Code}
                selected={category === 'development'}
                onSelect={() => setCategory('development')}
              />
              <CategoryCard
                category="monitoring"
                label="בקרה"
                icon={Activity}
                selected={category === 'monitoring'}
                onSelect={() => setCategory('monitoring')}
              />
            </div>
          </div>

          <Textarea
            label="תיאור הרעיון"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="פרט כאן את המהות של הרעיון, את הבעיה שהוא פותר ואיך הוא ייושם..."
            rows={5}
            required
          />

          <DateInput
            label="תאריך יעד להתחלה"
            name="targetStartDate"
            value={targetStartDate}
            onChange={(e) => setTargetStartDate(e.target.value)}
            hint="מתי מתוכנן להתחיל לעבוד על הרעיון?"
            required
          />

          <div className="space-y-3">
            <span className="block font-label-md text-secondary">רמת חשיבות</span>
            <div className="flex flex-wrap gap-3">
              {(['low', 'medium', 'high'] as IdeaPriority[]).map((p) => (
                <PriorityChip
                  key={p}
                  priority={p}
                  selected={priority === p}
                  onSelect={() => setPriority(p)}
                />
              ))}
            </div>
          </div>

          {allowContainer && (
            <ContainerKindToggle
              checked={isContainer}
              onChange={(v) => {
                setIsContainer(v)
                if (v) setSendToMaybeInbox(false)
              }}
            />
          )}

          {!isContainer && (
            <InboxToggle checked={sendToMaybeInbox} onChange={setSendToMaybeInbox} />
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitState !== 'idle'}
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-xl py-4 font-display text-headline-md transition-all duration-200 active:scale-[0.98]',
                submitState === 'success'
                  ? 'bg-success-vibrant text-on-primary shadow-glow'
                  : 'btn-boutique',
                submitState === 'loading' && 'opacity-80',
              )}
            >
              {submitState === 'loading' && (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  שולח רעיון...
                </>
              )}
              {submitState === 'success' && (
                <>
                  <CheckCircle2 className="h-6 w-6" />
                  הרעיון נוסף בהצלחה!
                </>
              )}
              {submitState === 'idle' && (
                <>
                  <CirclePlus className="h-6 w-6" />
                  {isContainer
                    ? 'צור מארז תת-רעיונות'
                    : sendToMaybeInbox
                      ? 'שמירה ל-Inbox'
                      : 'הוסף רעיון למערכת'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-12 flex items-center gap-6 glass-card p-6">
        <div className="rounded-2xl bg-gradient-to-br from-primary/15 to-inbox/10 p-3">
          <Lightbulb className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h3 className="mb-1 font-label-md text-on-surface">צריך עזרה בניסוח?</h3>
          <p className="font-body-md text-secondary">
            התייעץ עם צוות ה-Product בערוץ ה-Slack הייעודי לקבלת משוב ראשוני.
          </p>
        </div>
      </div>
    </>
  )
}
