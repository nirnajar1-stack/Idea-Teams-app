import { useMemo, useState } from 'react'
import {
  CalendarDays,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from 'lucide-react'
import { useUsers } from '../../context/UsersContext'
import {
  buildMonthGrid,
  buildWeekDays,
  type TimelineViewMode,
  weekRangeLabel,
} from '../../lib/timelineUtils'
import { cn } from '../../lib/cn'
import type { Idea } from '../../types/idea'
import { isRoutineCheckIdea } from '../../lib/ideaUtils'
import { TimelineBacklog } from './TimelineBacklog'
import { TimelineDayColumn } from './TimelineDayColumn'
import { TimelineFloatingTicker } from './TimelineFloatingTicker'
import { TimelineMonthGrid } from './TimelineMonthGrid'

type MobilePanel = 'calendar' | 'backlog'

interface TimelineBoardProps {
  ideas: Idea[]
  onSchedule: (ideaId: string, plannedDate: string | null) => Promise<void>
  onMarkRoutineCheck: (ideaId: string) => Promise<void>
  onAddToFloating: (ideaId: string) => Promise<boolean>
  onRemoveFromFloating: (ideaId: string) => Promise<boolean>
}

export function TimelineBoard({
  ideas,
  onSchedule,
  onMarkRoutineCheck,
  onAddToFloating,
  onRemoveFromFloating,
}: TimelineBoardProps) {
  const { usersById } = useUsers()
  const [viewMode, setViewMode] = useState<TimelineViewMode>('week')
  const [weekOffset, setWeekOffset] = useState(0)
  const [monthOffset, setMonthOffset] = useState(0)
  const [dropTarget, setDropTarget] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('calendar')

  const assigneeNames = useMemo(() => {
    const map = new Map<string, string>()
    usersById.forEach((u, id) => map.set(id, u.name))
    return map
  }, [usersById])

  const activeIdeas = useMemo(
    () => ideas.filter((i) => i.workflowStatus !== 'completed' && !i.parentId),
    [ideas],
  )

  const floatingTasks = useMemo(
    () => activeIdeas.filter((i) => isRoutineCheckIdea(i)),
    [activeIdeas],
  )

  const schedulableIdeas = useMemo(
    () => activeIdeas.filter((i) => !isRoutineCheckIdea(i)),
    [activeIdeas],
  )

  const backlog = useMemo(
    () => schedulableIdeas.filter((i) => !i.plannedDate),
    [schedulableIdeas],
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
    for (const idea of schedulableIdeas) {
      if (!idea.plannedDate) continue
      const list = map.get(idea.plannedDate)
      if (list) list.push(idea)
    }
    return map
  }, [schedulableIdeas, visibleDateKeys])

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

  const endDrag = () => {
    setDropTarget(null)
    setDragging(false)
  }

  const handleDropOnDate = async (ideaId: string, dateKey: string) => {
    endDrag()
    await onSchedule(ideaId, dateKey)
  }

  const handleDropBacklog = async (ideaId: string) => {
    endDrag()
    const idea = activeIdeas.find((i) => i.id === ideaId)
    if (!idea) return
    if (isRoutineCheckIdea(idea)) {
      await onRemoveFromFloating(ideaId)
    } else {
      await onSchedule(ideaId, null)
    }
  }

  const handleReturnToBacklog = async (ideaId: string) => {
    await onSchedule(ideaId, null)
  }

  const handleRemoveFromFloating = async (ideaId: string) => {
    await onRemoveFromFloating(ideaId)
  }

  const handleDropFloating = async (ideaId: string) => {
    endDrag()
    await onAddToFloating(ideaId)
  }

  const dragHandlers = {
    onDragStart: () => setDragging(true),
    onDragEnd: endDrag,
  }

  const calendar = (
    <div className={cn('min-w-0', dragging && 'cursor-grabbing')}>
      {viewMode === 'week' ? (
        <div className="timeline-calendar__grid">
          {weekDays.map((dateKey) => (
            <TimelineDayColumn
              key={dateKey}
              dateKey={dateKey}
              ideas={byDate.get(dateKey) ?? []}
              isDropTarget={dropTarget === dateKey}
              onDrop={handleDropOnDate}
              onDragOver={setDropTarget}
              onDragLeave={() => setDropTarget(null)}
              onReturnToBacklog={(id) => void handleReturnToBacklog(id)}
              {...dragHandlers}
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
  )

  const backlogPanel = (
    <TimelineBacklog
      backlog={backlog}
      isDropTarget={dropTarget === 'backlog'}
      onDropBacklog={handleDropBacklog}
      onDragOver={() => setDropTarget('backlog')}
      onDragLeave={() => setDropTarget(null)}
      {...dragHandlers}
    />
  )

  const viewTabClass = (active: boolean) =>
    cn(
      'flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5 font-label-sm transition-colors sm:font-label-md',
      active ? 'bg-primary text-on-primary' : 'text-secondary hover:text-on-surface',
    )

  return (
    <div className="timeline-shell">
      <TimelineFloatingTicker
        tasks={floatingTasks}
        assigneeNames={assigneeNames}
        isDropTarget={dropTarget === 'floating'}
        isDragging={dragging}
        onMarkChecked={onMarkRoutineCheck}
        onRemoveFromFloating={(id) => void handleRemoveFromFloating(id)}
        onDropIdea={(id) => void handleDropFloating(id)}
        onDragOver={() => setDropTarget('floating')}
        onDragLeave={() => setDropTarget(null)}
        {...dragHandlers}
      />

      <div className="timeline-toolbar">
        <div
          className="timeline-mobile-tabs mb-3 lg:hidden"
          role="tablist"
          aria-label="אזורי טיימליין"
        >
          {(
            [
              { id: 'calendar' as const, label: 'לוח ימים', icon: CalendarRange },
              { id: 'backlog' as const, label: 'לא מתוכנן', icon: Inbox, count: backlog.length },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon
            const active = mobilePanel === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setMobilePanel(tab.id)}
                className={cn(
                  'timeline-mobile-tab',
                  active && 'timeline-mobile-tab--active',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{tab.label}</span>
                {'count' in tab && tab.count > 0 && (
                  <span
                    className={cn(
                      'min-w-[1.1rem] shrink-0 px-1 text-[10px] font-bold tabular-nums',
                      active ? 'bg-on-primary text-primary' : 'bg-surface-container-high text-secondary',
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div
            className="flex w-full border border-border-light bg-surface-container-low p-0.5 sm:max-w-xs"
            role="tablist"
            aria-label="תצוגת טיימליין"
          >
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'week'}
              onClick={() => setViewMode('week')}
              className={viewTabClass(viewMode === 'week')}
            >
              <CalendarRange className="h-4 w-4" />
              שבועי
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'month'}
              onClick={() => setViewMode('month')}
              className={viewTabClass(viewMode === 'month')}
            >
              <CalendarDays className="h-4 w-4" />
              חודשי
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 lg:justify-end">
            <button
              type="button"
              onClick={goPrev}
              className="timeline-toolbar__nav-btn"
              aria-label={viewMode === 'week' ? 'שבוע קודם' : 'חודש קודם'}
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <div className="min-w-0 flex-1 text-center lg:flex-none lg:min-w-[14rem]">
              <p className="timeline-toolbar__period">{periodLabel}</p>
              <button
                type="button"
                onClick={goToday}
                className="mt-1 font-label-sm text-primary transition-opacity hover:opacity-80"
              >
                חזרה להיום
              </button>
            </div>

            <button
              type="button"
              onClick={goNext}
              className="timeline-toolbar__nav-btn"
              aria-label={viewMode === 'week' ? 'שבוע הבא' : 'חודש הבא'}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="hidden lg:grid lg:grid-cols-[minmax(12rem,14rem)_1fr]">
        <div className="timeline-sidebar">{backlogPanel}</div>
        <div className="timeline-calendar">{calendar}</div>
      </div>

      <div className="lg:hidden">
        {mobilePanel === 'calendar' ? (
          <div className="timeline-calendar timeline-calendar--mobile">{calendar}</div>
        ) : (
          <div className="timeline-sidebar timeline-sidebar--mobile">{backlogPanel}</div>
        )}
      </div>
    </div>
  )
}
