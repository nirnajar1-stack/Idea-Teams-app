import { CheckCircle2, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import type { Idea } from '../../types/idea'
import { cn } from '../../lib/cn'
import { IdeaListCard } from './IdeaListCard'
import { EmptyState } from '../ui/EmptyState'

export interface CompletedIdeasSectionProps {
  ideas: Idea[]
  compact: boolean
}

export function CompletedIdeasSection({ ideas, compact }: CompletedIdeasSectionProps) {
  const [open, setOpen] = useState(true)

  return (
    <section
      className="mt-10 border-t border-border-light pt-8"
      aria-label="בקשות/רעיונות שהושלמו"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mb-4 flex w-full items-center justify-between gap-3 px-1 py-2 text-right transition-colors hover:bg-primary/5"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 font-display text-headline-md text-on-surface">
          <CheckCircle2 className="h-6 w-6 text-success-vibrant" />
          בקשות/רעיונות שהושלמו
          <span className="rounded-full bg-success-vibrant/15 px-2.5 py-0.5 font-label-sm text-success-vibrant">
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
          title="אין בקשות/רעיונות שהושלמו"
          description="בקשות/רעיונות שסומנו כהושלמו יופיעו כאן."
        />
      )}

      {open && ideas.length > 0 && (
        <div className={cn('space-y-3 opacity-90', compact && 'space-y-2')}>
          {ideas.map((idea, i) => (
            <div
              key={idea.id}
              className="animate-fade-up"
              style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
            >
              <IdeaListCard idea={idea} compact={compact} completed />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
