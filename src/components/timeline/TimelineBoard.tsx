import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react'
import { useUsers } from '../../context/UsersContext'
import { buildTimelineDays, timelineDragMime } from '../../lib/timelineUtils'
import { cn } from '../../lib/cn'
import type { Idea } from '../../types/idea'
import { TimelineDayColumn } from './TimelineDayColumn'
import { TimelineIdeaCard } from './TimelineIdeaCard'

const DAYS_PER_VIEW = 7

interface TimelineBoardProps {
  ideas: Idea[]
  onSchedule: (ideaId: string, plannedDate: string | null) => Promise<void>
}

export function TimelineBoard({ ideas, onSchedule }: TimelineBoardProps) {
  const { usersById } = useUsers()
  const [offset, setOffset] = useState(0)
  const [dropTarget, setDropTarget] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  const assigneeNames = useMemo(() => {
    const map = new Map<string, string>()
    usersById.forEach((u, id) => map.set(id, u.name))
    return map
  }, [usersById])

  const activeIdeas = useMemo(
    () => ideas.filter((i) => i.workflowStatus !== 'completed' && !i.parentId),
    [ideas],
  )

  const backlog = useMemo(
    () => activeIdeas.filter((i) => !i.plannedDate),
    [activeIdeas],
  )

  const days = useMemo(() => buildTimelineDays(offset, DAYS_PER_VIEW), [offset])

  const byDate = useMemo(() => {
    const map = new Map<string, Idea[]>()
    for (const day of days) map.set(day, [])
    for (const idea of activeIdeas) {
      if (!idea.plannedDate) continue
      const list = map.get(idea.plannedDate)
      if (list) list.push(idea)
    }
    return map
  }, [activeIdeas, days])

  const handleDropOnDate = async (ideaId: string, dateKey: string) => {
    setDropTarget(null)
    setDragging(false)
    await onSchedule(ideaId, dateKey)
  }

  const handleDropBacklog = async (ideaId: string) => {
    setDropTarget(null)
    setDragging(false)
    await onSchedule(ideaId, null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setOffset((o) => o - DAYS_PER_VIEW)}
          className="flex items-center gap-1 rounded-xl border border-border-light px-3 py-2 font-label-md text-secondary hover:bg-surface-container"
        >
          <ChevronRight className="h-4 w-4" />
          שבוע קודם
        </button>
        <button
          type="button"
          onClick={() => setOffset(0)}
          className="rounded-xl px-3 py-2 font-label-md text-primary hover:bg-primary/10"
        >
          חזרה להיום
        </button>
        <button
          type="button"
          onClick={() => setOffset((o) => o + DAYS_PER_VIEW)}
          className="flex items-center gap-1 rounded-xl border border-border-light px-3 py-2 font-label-md text-secondary hover:bg-surface-container"
        >
          שבוע הבא
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside
          className={cn(
            'w-full shrink-0 rounded-xl border border-border-light bg-surface-container-lowest p-4 lg:w-64',
            dropTarget === 'backlog' && 'border-primary ring-2 ring-primary/20',
          )}
          onDragOver={(e) => {
            e.preventDefault()
            setDropTarget('backlog')
          }}
          onDragLeave={() => setDropTarget(null)}
          onDrop={(e) => {
            e.preventDefault()
            const ideaId = e.dataTransfer.getData(timelineDragMime())
            if (ideaId) void handleDropBacklog(ideaId)
          }}
        >
          <div className="mb-3 flex items-center gap-2">
            <Inbox className="h-5 w-5 text-primary" />
            <h2 className="font-display text-headline-md text-on-surface">לא מתוכנן</h2>
            <span className="rounded-full bg-surface-container-high px-2 py-0.5 font-label-sm text-secondary">
              {backlog.length}
            </span>
          </div>
          <p className="mb-4 font-label-sm text-secondary">
            גרור משימות לימים בלוח, או החזר לכאן להסרת תאריך.
          </p>
          <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto lg:max-h-[calc(100vh-16rem)]">
            {backlog.map((idea) => (
              <TimelineIdeaCard
                key={idea.id}
                idea={idea}
                assigneeName={
                  idea.assigneeUserId ? assigneeNames.get(idea.assigneeUserId) : undefined
                }
                onDragStart={() => setDragging(true)}
                onDragEnd={() => setDragging(false)}
              />
            ))}
            {backlog.length === 0 && (
              <p className="py-6 text-center font-label-sm text-secondary">הכל מתוכנן</p>
            )}
          </div>
        </aside>

        <div
          className={cn(
            'min-w-0 flex-1 overflow-x-auto pb-2',
            dragging && 'cursor-grabbing',
          )}
        >
          <div className="flex gap-3">
            {days.map((dateKey) => (
              <TimelineDayColumn
                key={dateKey}
                dateKey={dateKey}
                ideas={byDate.get(dateKey) ?? []}
                assigneeNames={assigneeNames}
                isDropTarget={dropTarget === dateKey}
                onDrop={handleDropOnDate}
                onDragOver={setDropTarget}
                onDragLeave={() => setDropTarget(null)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
