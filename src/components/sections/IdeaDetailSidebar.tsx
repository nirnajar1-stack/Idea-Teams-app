import { CheckCheck, Pencil, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/app'
import type { Idea } from '../../types/idea'
import { ProgressBar } from '../ui/ProgressBar'

export interface IdeaDetailSidebarProps {
  idea: Idea
  onComplete: () => void
  onDelete: () => void
}

export function IdeaDetailSidebar({
  idea,
  onComplete,
  onDelete,
}: IdeaDetailSidebarProps) {
  const navigate = useNavigate()

  return (
    <aside className="space-y-6 lg:col-span-4">
      <div className="sticky top-24 rounded-xl border border-border-light bg-surface-container-lowest p-6 shadow-sm">
        <h3 className="mb-6 font-display text-headline-md text-on-surface">פעולות</h3>
        <div className="space-y-4">
          <button
            type="button"
            onClick={onComplete}
            disabled={idea.workflowStatus === 'completed'}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-label-md text-on-primary shadow-lg shadow-primary/20 transition-all hover:brightness-110 active:scale-95 disabled:opacity-60"
          >
            <CheckCheck className="h-5 w-5" />
            סימון כהושלם
          </button>
          <button
            type="button"
            onClick={() => navigate(ROUTES.addIdea)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border-light bg-surface-container-lowest py-4 font-label-md text-secondary transition-all hover:bg-surface-subtle active:scale-95"
          >
            <Pencil className="h-5 w-5" />
            עריכת רעיון
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex w-full items-center justify-center gap-2 rounded-lg py-2 font-label-md text-error transition-colors hover:bg-error/5"
          >
            <Trash2 className="h-5 w-5" />
            מחיקת רעיון
          </button>
        </div>

        <hr className="my-6 border-border-light" />

        <div className="space-y-4">
          <h4 className="font-label-md uppercase text-secondary">תגים</h4>
          <div className="flex flex-wrap gap-2">
            {idea.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border-light bg-surface-container-low px-3 py-1 text-[13px] text-on-surface-variant"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <h4 className="mb-4 font-label-md uppercase text-secondary">התקדמות</h4>
          <ProgressBar
            percent={idea.progress}
            label={`${idea.progress}% הושלם`}
            stepLabel={idea.progressStep}
          />
        </div>
      </div>

      {idea.conceptImageUrl && (
        <div className="overflow-hidden rounded-xl border border-border-light bg-surface-container-lowest shadow-sm">
          <div className="relative h-48">
            <img
              src={idea.conceptImageUrl}
              alt="קונספט ויזואלי"
              className="h-full w-full object-cover"
            />
            {/* PLACEHOLDER: החליפו ב-src/assets/concept.png כשזמין */}
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-4">
              <span className="font-label-md text-white">קונספט ויזואלי ראשוני</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
