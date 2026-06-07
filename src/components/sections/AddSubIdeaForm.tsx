import {
  Activity,
  CheckCircle2,
  CirclePlus,
  Code,
  Loader2,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useIdeas } from '../../context/IdeasContext'
import { ROUTES } from '../../constants/app'
import type { Idea, IdeaCategory, IdeaPriority } from '../../types/idea'
import { CategoryCard } from '../ui/CategoryCard'
import { DateInput } from '../ui/DateInput'
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

export interface AddSubIdeaFormProps {
  parent: Idea
}

export function AddSubIdeaForm({ parent }: AddSubIdeaFormProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addIdea } = useIdeas()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<IdeaCategory>('development')
  const [priority, setPriority] = useState<IdeaPriority>('medium')
  const [targetStartDate, setTargetStartDate] = useState(defaultTargetDate)
  const [submitState, setSubmitState] = useState<SubmitState>('idle')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim() || !targetStartDate) return

    setSubmitState('loading')
    await new Promise((r) => setTimeout(r, 600))

    await addIdea({
      title,
      description,
      category,
      ideaSource: parent.ideaSource,
      priority,
      targetStartDate,
      sendToMaybeInbox: false,
      parentId: parent.id,
      visibility: parent.visibility ?? 'team',
    })
    setSubmitState('success')
    await new Promise((r) => setTimeout(r, 800))
    navigate(ROUTES.ideaDetail(parent.id))
  }

  return (
    <>
      <div className="mb-6 animate-fade-up text-right">
        <Link
          to={ROUTES.ideaDetail(parent.id)}
          className="mb-4 inline-block font-label-md text-primary hover:underline"
        >
          ← חזרה למארז: {parent.title}
        </Link>
        <span className="section-eyebrow">תת-רעיון</span>
        <h1 className="mb-2 font-display text-headline-lg text-on-surface">
          הוספת תת-רעיון
        </h1>
        <p className="font-body-md text-secondary">
          התת-רעיון יתווסף תחת המארז &quot;{parent.title}&quot; ·{' '}
          <strong className="text-on-surface">{user?.name}</strong>
        </p>
      </div>

      <div className="glass-card animate-fade-up p-6 md:p-8">
        <form className="space-y-8" onSubmit={handleSubmit}>
          <Input
            label="כותרת תת-רעיון"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="שלב או רעיון משנה"
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
            label="תיאור"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            required
          />

          <DateInput
            label="תאריך יעד להתחלה"
            name="targetStartDate"
            value={targetStartDate}
            onChange={(e) => setTargetStartDate(e.target.value)}
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

          <button
            type="submit"
            disabled={submitState !== 'idle'}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-xl py-4 font-display text-headline-md transition-all',
              submitState === 'success'
                ? 'bg-success-vibrant text-on-primary'
                : 'btn-boutique',
            )}
          >
            {submitState === 'loading' && (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                שומר…
              </>
            )}
            {submitState === 'success' && (
              <>
                <CheckCircle2 className="h-6 w-6" />
                נוסף למארז
              </>
            )}
            {submitState === 'idle' && (
              <>
                <CirclePlus className="h-6 w-6" />
                הוסף תת-רעיון
              </>
            )}
          </button>
        </form>
      </div>
    </>
  )
}
