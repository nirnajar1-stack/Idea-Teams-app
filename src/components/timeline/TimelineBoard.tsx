import { useMemo, useState } from 'react'
import { CalendarDays, CalendarRange, ChevronLeft, ChevronRight } from 'lucide-react'
import { useUsers } from '../../context/UsersContext'
import {
  buildMonthGrid,
  buildWeekDays,
  type TimelineViewMode,
  weekRangeLabel,
} from '../../lib/timelineUtils'
import { cn } from '../../lib/cn'
import type { Idea } from '../../types/idea'
import { TimelineBacklog } from './TimelineBacklog'
import { TimelineDayColumn } from './TimelineDayColumn'
import { TimelineMonthGrid } from './TimelineMonthGrid'

interface TimelineBoardProps {
  ideas: Idea[]
  onSchedule: (ideaId: string, plannedDate: string | null) => Promise<void>
}

export function TimelineBoard({ ideas, onSchedule }: TimelineBoardProps) {
  const { usersById } = useUsers()
  const [viewMode, setViewMode] = useState<TimelineViewMode>('week')
  const [weekOffset, setWeekOffset] = useState(0)
  const [monthOffset, setMonthOffset] = useState(0)
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

  const weekDays = useMemo(() => buildWeekDays(weekOffset), [weekOffset])
  const monthGrid = useMemo(() => buildMonthGrid(monthOffset), [monthOffset])

  const visibleDateKeys = useMemo(
    () => (viewMode === 'week' ? weekDays : monthGrid.daysInMonth),
    [viewMode, weekDays, monthGrid.daysInMonth],
  )

  const byDate = useMemo(() => {
    const map = new Map<string, Idea[]>()
    for (const day of visibleDateKeys) map.set(day, [])
    for (const idea of activeIdeas) {
      if (!idea.plannedDate) continue
      const list = map.get(idea.plannedDate)
      if (list) list.push(idea)
    }
    return map
  }, [activeIdeas, visibleDateKeys])

  const periodLabel =
    viewMode === 'week' ? weekRangeLabel(weekOffset) : monthGrid.label

  const goToday = () => {
    setWeekOffset(0)
    setMonthOffset(0)
  }

  const goPrev = () => {
    if (viewMode === 'week') setWeekOffset((o) => o - 1)
    else setMonthOffset((o) => o - 1)
  }

  const goNext = () => {
    if (viewMode === 'week') setWeekOffset((o) => o + 1)
    else setMonthOffset((o) => o + 1)
  }

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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:gap-4">
        <div
          className="flex border border-border-light bg-surface-container-low p-1"
          role="tablist"
          aria-label="תצוגת טיימליין"
        >
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'week'}
            onClick={() => setViewMode('week')}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 py-2.5 font-label-md transition-colors',
              viewMode === 'week'
                ? 'bg-primary text-on-primary'
                : 'text-secondary hover:text-on-surface',
            )}
          >
            <CalendarRange className="h-4 w-4" />
            שבועי
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'month'}
            onClick={() => setViewMode('month')}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 py-2.5 font-label-md transition-colors',
              viewMode === 'month'
                ? 'bg-primary text-on-primary'
                : 'text-secondary hover:text-on-surface',
            )}
          >
            <CalendarDays className="h-4 w-4" />
            חודשי
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={goPrev}
            className="flex items-center gap-1 border border-border-light px-2.5 py-2 font-label-md text-secondary hover:bg-surface-container sm:px-3"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="hidden sm:inline">
              {viewMode === 'week' ? 'שבוע קודם' : 'חודש קודם'}
            </span>
            <span className="sm:hidden">קודם</span>
          </button>

          <div className="min-w-0 flex-1 px-1 text-center">
            <p className="truncate font-label-md text-on-surface sm:font-display sm:text-headline-md">
              {periodLabel}
            </p>
            <button
              type="button"
              onClick={goToday}
              className="mt-0.5 font-label-sm text-primary hover:underline"
            >
              חזרה להיום
            </button>
          </div>

          <button
            type="button"
            onClick={goNext}
            className="flex items-center gap-1 border border-border-light px-2.5 py-2 font-label-md text-secondary hover:bg-surface-container sm:px-3"
          >
            <span className="hidden sm:inline">
              {viewMode === 'week' ? 'שבוע הבא' : 'חודש הבא'}
            </span>
            <span className="sm:hidden">הבא</span>
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
        <TimelineBacklog
          backlog={backlog}
          assigneeNames={assigneeNames}
          isDropTarget={dropTarget === 'backlog'}
          onDropBacklog={handleDropBacklog}
          onDragOver={() => setDropTarget('backlog')}
          onDragLeave={() => setDropTarget(null)}
          onDragStart={() => setDragging(true)}
          onDragEnd={() => setDragging(false)}
        />

        <div
          className={cn(
            'min-w-0 flex-1',
            viewMode === 'week' &&
              '-mx-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory sm:mx-0 sm:px-0.5',
            dragging && 'cursor-grabbing',
          )}
        >
          {viewMode === 'week' ? (
            <div className="flex gap-3">
              {weekDays.map((dateKey) => (
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
          ) : (
            <TimelineMonthGrid
              grid={monthGrid}
              byDate={byDate}
              assigneeNames={assigneeNames}
              dropTarget={dropTarget}
              onDrop={handleDropOnDate}
              onDragOver={setDropTarget}
              onDragLeave={() => setDropTarget(null)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
