import { CheckCircle2, Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { useIdeas } from '../../context/IdeasContext'
import { ROUTES } from '../../constants/app'
import { formatIdeaSaveError } from '../../lib/ideaSaveErrors'
import { mergeLabelIdsIntoTags, extractLabelIds } from '../../lib/labelTags'
import type { Idea, IdeaCategory, IdeaPriority, IdeaSource } from '../../types/idea'
import { CategoryPicker } from '../ui/CategoryPicker'
import { categoryDepartment } from '../../lib/ideaUtils'
import { DateInput } from '../ui/DateInput'
import { Input } from '../ui/Input'
import { PriorityChip } from '../ui/PriorityChip'
import { ExpandableTextarea } from '../ui/ExpandableTextarea'
import { IdeaSourceSelect } from './IdeaSourceSelect'
import { TaskLabelSelect } from './TaskLabelSelect'
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
  const [labelIds, setLabelIds] = useState<string[]>(extractLabelIds(idea.tags))
  const [submitState, setSubmitState] = useState<SubmitState>('idle')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim() || !targetStartDate) return

    setSubmitState('loading')
    try {
      const { ok } = await updateIdea(idea.id, {
        title: title.trim(),
        description: description.trim(),
        category,
        department: categoryDepartment(category),
        ideaSource,
        priority,
        targetStartDate,
        tags: mergeLabelIdsIntoTags(idea.tags, labelIds),
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
            <CategoryPicker value={category} onChange={setCategory} />
          </div>

          <IdeaSourceSelect value={ideaSource} onChange={setIdeaSource} />

          <ExpandableTextarea
            label="תיאור הבקשה/רעיון"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <DateInput
            label="תאריך יעד להתחלה"
            name="targetStartDate"
            value={targetStartDate}
            onChange={(e) => setTargetStartDate(e.target.value)}
            required
          />

          <TaskLabelSelect value={labelIds} onChange={setLabelIds} />

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
              className="btn-secondary-light flex-1 py-4"
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={submitState !== 'idle'}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 py-4 font-display text-headline-md transition-colors',
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
