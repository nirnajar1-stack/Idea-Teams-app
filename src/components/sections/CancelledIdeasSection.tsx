import { Ban, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import type { Idea } from '../../types/idea'
import { IDEA_TERM } from '../../constants/terminology'
import { cn } from '../../lib/cn'
import { IdeaListCard } from './IdeaListCard'
import { EmptyState } from '../ui/EmptyState'

export interface CancelledIdeasSectionProps {
  ideas: Idea[]
  compact: boolean
}

export function CancelledIdeasSection({ ideas, compact }: CancelledIdeasSectionProps) {
  const [open, setOpen] = useState(ideas.length > 0)

  return (
    <section
      className="mt-10 border-t border-border-light pt-8"
      aria-label={`${IDEA_TERM.many} שבוטלו`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mb-4 flex w-full items-center justify-between gap-3 px-1 py-2 text-right transition-colors hover:bg-error/5"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 font-display text-headline-md text-on-surface">
          <Ban className="h-6 w-6 text-error" />
          {IDEA_TERM.many} שבוטלו
          <span className="rounded-full bg-error/15 px-2.5 py-0.5 font-label-sm text-error">
            {ideas.length}
          </span>
        </span>
        <ChevronDown
          className={cn(
            'h-5 w-5 shrink-0 text-secondary transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && ideas.length === 0 && (
        <EmptyState
          title={`אין ${IDEA_TERM.many} שבוטלו`}
          description={`${IDEA_TERM.many} שבוטלו (ולא נמחקו) יופיעו כאן עם סיבת הביטול.`}
        />
      )}

      {open && ideas.length > 0 && (
        <div className={cn('list-stagger space-y-3 opacity-90', compact && 'space-y-2')}>
          {ideas.map((idea) => (
            <div key={idea.id}>
              <IdeaListCard idea={idea} compact={compact} />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
