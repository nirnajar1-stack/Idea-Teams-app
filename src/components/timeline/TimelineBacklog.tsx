import { ChevronDown, Inbox } from 'lucide-react'
import { useState, type DragEvent } from 'react'
import { cn } from '../../lib/cn'
import { timelineDragMime } from '../../lib/timelineUtils'
import type { Idea } from '../../types/idea'
import { TimelineIdeaCard } from './TimelineIdeaCard'

interface TimelineBacklogProps {
  backlog: Idea[]
  assigneeNames: Map<string, string>
  isDropTarget: boolean
  onDropBacklog: (ideaId: string) => void
  onDragOver: () => void
  onDragLeave: () => void
  onDragStart: () => void
  onDragEnd: () => void
}

export function TimelineBacklog({
  backlog,
  assigneeNames,
  isDropTarget,
  onDropBacklog,
  onDragOver,
  onDragLeave,
  onDragStart,
  onDragEnd,
}: TimelineBacklogProps) {
  const [mobileOpen, setMobileOpen] = useState(true)

  const dropHandlers = {
    onDragOver: (e: DragEvent) => {
      e.preventDefault()
      onDragOver()
    },
    onDragLeave,
    onDrop: (e: DragEvent) => {
      e.preventDefault()
      const ideaId = e.dataTransfer.getData(timelineDragMime())
      if (ideaId) onDropBacklog(ideaId)
    },
  }

  return (
    <>
      {/* מובייל — פס גלילה אופקי */}
      <section
        className={cn(
          'rounded-xl border border-border-light bg-surface-container-lowest p-3 lg:hidden',
          isDropTarget && 'border-primary ring-2 ring-primary/20',
        )}
        {...dropHandlers}
      >
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="mb-2 flex w-full items-center justify-between gap-2"
          aria-expanded={mobileOpen}
        >
          <span className="flex items-center gap-2 font-label-md text-on-surface">
            <Inbox className="h-4 w-4 text-primary" />
            לא מתוכנן
            <span className="rounded-full bg-surface-container-high px-2 py-0.5 font-label-sm text-secondary">
              {backlog.length}
            </span>
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-secondary transition-transform',
              mobileOpen && 'rotate-180',
            )}
          />
        </button>

        {mobileOpen && (
          <>
            <p className="mb-2 font-label-sm text-secondary">
              גרור ליום בלוח או החזר לכאן
            </p>
            {backlog.length === 0 ? (
              <p className="py-3 text-center font-label-sm text-secondary">הכל מתוכנן</p>
            ) : (
              <div className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory">
                {backlog.map((idea) => (
                  <div key={idea.id} className="w-[min(85vw,260px)] shrink-0 snap-center">
                    <TimelineIdeaCard
                      idea={idea}
                      assigneeName={
                        idea.assigneeUserId
                          ? assigneeNames.get(idea.assigneeUserId)
                          : undefined
                      }
                      onDragStart={onDragStart}
                      onDragEnd={onDragEnd}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* דסקטופ — סרגל צד */}
      <aside
        className={cn(
          'hidden w-64 shrink-0 rounded-xl border border-border-light bg-surface-container-lowest p-4 lg:block',
          isDropTarget && 'border-primary ring-2 ring-primary/20',
        )}
        {...dropHandlers}
      >
        <div className="mb-3 flex items-center gap-2">
          <Inbox className="h-5 w-5 text-primary" />
          <h2 className="font-display text-headline-md text-on-surface">לא מתוכנן</h2>
          <span className="rounded-full bg-surface-container-high px-2 py-0.5 font-label-sm text-secondary">
            {backlog.length}
          </span>
        </div>
        <p className="mb-4 font-label-sm text-secondary">
          גרור בקשות/רעיונות לימים בלוח, או החזר לכאן להסרת תאריך.
        </p>
        <div className="flex max-h-[calc(100vh-16rem)] flex-col gap-2 overflow-y-auto">
          {backlog.map((idea) => (
            <TimelineIdeaCard
              key={idea.id}
              idea={idea}
              assigneeName={
                idea.assigneeUserId ? assigneeNames.get(idea.assigneeUserId) : undefined
              }
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          ))}
          {backlog.length === 0 && (
            <p className="py-6 text-center font-label-sm text-secondary">הכל מתוכנן</p>
          )}
        </div>
      </aside>
    </>
  )
}
