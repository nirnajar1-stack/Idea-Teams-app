import {
  Activity,
  CheckCircle2,
  Code,
  Loader2,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { useIdeas } from '../../context/IdeasContext'
import { ROUTES } from '../../constants/app'
import { formatIdeaSaveError } from '../../lib/ideaSaveErrors'
import type { Idea, IdeaCategory, IdeaPriority, IdeaSource } from '../../types/idea'
import { CategoryCard } from '../ui/CategoryCard'
import { DateInput } from '../ui/DateInput'
import { Input } from '../ui/Input'
import { PriorityChip } from '../ui/PriorityChip'
import { Textarea } from '../ui/Textarea'
import { IdeaSourceSelect } from './IdeaSourceSelect'
import { cn } from '../../lib/cn'

type SubmitState = 'idle' | 'loading' | 'success'

export interface EditIdeaFormProps {
  idea: Idea
}

export function EditIdeaForm({ idea }: EditIdeaFormProps) {
  const navigate = useNavigate()
  const { updateIdea } = useIdeas()
  const [title, setTitle] = useState(idea.title)
  const [description, setDescription] = useState(idea.description)
  const [category, setCategory] = useState<IdeaCategory>(idea.category)
  const [ideaSource, setIdeaSource] = useState<IdeaSource>(idea.ideaSource)
  const [priority, setPriority] = useState<IdeaPriority>(idea.priority)
  const [targetStartDate, setTargetStartDate] = useState(idea.targetStartDate)
  const [submitState, setSubmitState] = useState<SubmitState>('idle')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim() || !targetStartDate) return

    setSubmitState('loading')
    try {
      const ok = await updateIdea(idea.id, {
        title: title.trim(),
        description: description.trim(),
        category,
        department: category === 'development' ? 'פיתוח' : 'בקרה',
        ideaSource,
        priority,
        targetStartDate,
      })
      if (!ok) {
        toast.error('אין הרשאה לערוך בקשה/רעיון זה')
        setSubmitState('idle')
        return
      }
      setSubmitState('success')
      toast.success('הבקשה/רעיון עודכן בהצלחה')
      await new Promise((r) => setTimeout(r, 600))
      navigate(ROUTES.ideaDetail(idea.id))
    } catch (err) {
      setSubmitState('idle')
      toast.error(formatIdeaSaveError(err))
    }
  }

  return (
    <>
      <div className="mb-10 animate-fade-up text-right">
        <span className="section-eyebrow">עריכת בקשה/רעיון</span>
        <h1 className="mb-2 font-display text-headline-lg text-on-surface">
          {idea.title}
        </h1>
        <p className="font-body-md text-secondary">#{idea.externalId}</p>
      </div>

      <div className="glass-card animate-fade-up p-6 md:p-8" style={{ animationDelay: '80ms' }}>
        <form className="space-y-8" onSubmit={handleSubmit}>
          <Input
            label="כותרת הבקשה/רעיון"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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

          <IdeaSourceSelect value={ideaSource} onChange={setIdeaSource} />

          <Textarea
            label="תיאור הבקשה/רעיון"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
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

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(ROUTES.ideaDetail(idea.id))}
              className="flex-1 rounded-xl border border-border-light py-4 font-label-md text-on-surface hover:bg-surface-container-low"
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={submitState !== 'idle'}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-xl py-4 font-display text-headline-md transition-all active:scale-[0.98]',
                submitState === 'success'
                  ? 'bg-success-vibrant text-on-primary'
                  : 'btn-boutique',
                submitState === 'loading' && 'opacity-80',
              )}
            >
              {submitState === 'loading' && (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  שומר...
                </>
              )}
              {submitState === 'success' && (
                <>
                  <CheckCircle2 className="h-6 w-6" />
                  נשמר!
                </>
              )}
              {submitState === 'idle' && 'שמור שינויים'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
