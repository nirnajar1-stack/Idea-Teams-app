import { Activity, CheckCircle2, CirclePlus, Code, Lightbulb, Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useIdeas } from '../../context/IdeasContext'
import { ROUTES } from '../../constants/app'
import type { IdeaCategory, IdeaPriority } from '../../types/idea'
import { CategoryCard } from '../ui/CategoryCard'
import { Input } from '../ui/Input'
import { PriorityChip } from '../ui/PriorityChip'
import { Textarea } from '../ui/Textarea'
import { cn } from '../../lib/cn'

type SubmitState = 'idle' | 'loading' | 'success'

export function AddIdeaForm() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addIdea } = useIdeas()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<IdeaCategory>('development')
  const [priority, setPriority] = useState<IdeaPriority>('medium')
  const [submitState, setSubmitState] = useState<SubmitState>('idle')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) return

    setSubmitState('loading')
    await new Promise((r) => setTimeout(r, 800))

    const idea = addIdea({ title, description, category, priority })
    setSubmitState('success')
    await new Promise((r) => setTimeout(r, 1200))
    navigate(ROUTES.ideaDetail(idea.id))
  }

  return (
    <>
      <div className="mb-10 text-right">
        <h1 className="mb-2 font-display text-headline-lg text-on-surface">
          הוספת רעיון חדש
        </h1>
        <p className="font-body-md text-secondary">
          יש לך רעיון מבריק? שתף אותו עם הצוות — הרעיון יירשם בשם{' '}
          <strong className="text-on-surface">{user?.name}</strong>.
        </p>
      </div>

      <div className="rounded-xl border border-border-light bg-surface-container-lowest p-6 shadow-card md:p-8">
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

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitState !== 'idle'}
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-xl py-4 font-display text-headline-md text-on-primary shadow-lg transition-all duration-150 active:scale-[0.98]',
                submitState === 'success'
                  ? 'bg-success-vibrant'
                  : 'bg-primary hover:bg-primary-container',
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
                  הוסף רעיון למערכת
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-12 flex items-center gap-6 rounded-xl border border-border-light bg-surface-container p-6">
        <div className="rounded-full bg-primary/10 p-3">
          <Lightbulb className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h3 className="mb-1 font-label-md text-on-surface">צריך עזרה בניסוח?</h3>
          <p className="font-body-md text-secondary">
            התייעץ עם צוות ה-Product שלנו בערוץ ה-Slack הייעודי לקבלת משוב ראשוני.
          </p>
        </div>
      </div>

      <div
        className="pointer-events-none fixed top-20 right-[5%] -z-10 h-64 w-64 rounded-full bg-primary/5 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed bottom-20 left-[5%] -z-10 h-96 w-96 rounded-full bg-surface-container-high/40 blur-[100px]"
        aria-hidden
      />
    </>
  )
}
