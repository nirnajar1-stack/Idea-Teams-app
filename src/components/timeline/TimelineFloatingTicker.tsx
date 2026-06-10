import { CheckCheck, Inbox, Radio } from 'lucide-react'
import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
} from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/app'
import {
  CHECK_CADENCE_LABELS,
  isRoutineCheckDue,
} from '../../lib/ideaUtils'
import { timelineDragMime } from '../../lib/timelineUtils'
import { cn } from '../../lib/cn'
import type { Idea } from '../../types/idea'

const TICKER_PX_PER_SEC = 48

interface TimelineFloatingTickerProps {
  tasks: Idea[]
  assigneeNames: Map<string, string>
  isDropTarget: boolean
  isDragging: boolean
  onMarkChecked: (ideaId: string) => Promise<void>
  onRemoveFromFloating: (ideaId: string) => void
  onDropIdea: (ideaId: string) => void
  onDragOver: () => void
  onDragLeave: () => void
  onDragStart?: () => void
  onDragEnd?: () => void
}

function TickerChip({
  idea,
  assigneeName,
  onMarkChecked,
  onRemoveFromFloating,
  onDragStart,
  onDragEnd,
}: {
  idea: Idea
  assigneeName?: string
  onMarkChecked: (ideaId: string) => Promise<void>
  onRemoveFromFloating: (ideaId: string) => void
  onDragStart?: () => void
  onDragEnd?: () => void
}) {
  const due = isRoutineCheckDue(idea)

  return (
    <article
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData(timelineDragMime(), idea.id)
        e.dataTransfer.effectAllowed = 'move'
        onDragStart?.()
      }}
      onDragEnd={onDragEnd}
      className={cn(
        'timeline-ticker-chip flex shrink-0 cursor-grab items-center gap-2 border px-3 py-2 active:cursor-grabbing',
        due ? 'border-primary/50 bg-primary/5' : 'border-border-light bg-surface-container-low/80',
      )}
    >
      {due && (
        <span className="h-1.5 w-1.5 shrink-0 animate-pulse bg-primary" aria-hidden />
      )}
      <div className="min-w-0 max-w-[12rem] sm:max-w-[16rem]">
        <Link
          to={ROUTES.ideaDetail(idea.id)}
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          className="block truncate font-label-sm text-on-surface hover:text-primary"
          title={idea.title}
        >
          {idea.title}
        </Link>
        <p className="truncate text-[11px] text-secondary">
          {idea.checkCadence ? CHECK_CADENCE_LABELS[idea.checkCadence] : 'ללא זמן'}
          {assigneeName ? ` · ${assigneeName}` : ''}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => onRemoveFromFloating(idea.id)}
          className="border border-border-light p-1.5 text-secondary transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
          aria-label={`החזר ${idea.title} ללא מתוכנן`}
          title="החזר ללא מתוכנן"
        >
          <Inbox className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={() => void onMarkChecked(idea.id)}
          className="border border-border-light p-1.5 text-secondary transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
          aria-label={`סומן ${idea.title} כנבדק`}
          title="סומן כנבדק"
        >
          <CheckCheck className="h-3 w-3" />
        </button>
      </div>
    </article>
  )
}

type TickerMotion = 'solo' | 'loop' | 'loop-padded'

export function TimelineFloatingTicker({
  tasks,
  assigneeNames,
  isDropTarget,
  isDragging,
  onMarkChecked,
  onRemoveFromFloating,
  onDropIdea,
  onDragOver,
  onDragLeave,
  onDragStart,
  onDragEnd,
}: TimelineFloatingTickerProps) {
  const sorted = [...tasks].sort((a, b) => {
    const aDue = isRoutineCheckDue(a) ? 0 : 1
    const bDue = isRoutineCheckDue(b) ? 0 : 1
    if (aDue !== bDue) return aDue - bDue
    return a.title.localeCompare(b.title, 'he')
  })

  const dueCount = sorted.filter((i) => isRoutineCheckDue(i)).length
  const taskKey = sorted.map((i) => i.id).join('|')

  const viewportRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const [motion, setMotion] = useState<TickerMotion>('loop')
  const [spacerWidth, setSpacerWidth] = useState(0)
  const [railStyle, setRailStyle] = useState<CSSProperties>({})

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    const measure = measureRef.current
    if (!viewport || !measure || sorted.length === 0) return

    const update = () => {
      const contentWidth = measure.scrollWidth
      const viewportWidth = viewport.clientWidth
      if (contentWidth <= 0 || viewportWidth <= 0) return

      if (sorted.length === 1 && contentWidth < viewportWidth) {
        const travel = viewportWidth + contentWidth
        setMotion('solo')
        setSpacerWidth(0)
        setRailStyle({
          '--ticker-solo-start': `${viewportWidth}px`,
          '--ticker-solo-end': `-${contentWidth}px`,
          '--ticker-duration': `${Math.max(14, travel / TICKER_PX_PER_SEC)}s`,
        } as CSSProperties)
        return
      }

      const overflows = contentWidth > viewportWidth + 2
      if (overflows) {
        setMotion('loop')
        setSpacerWidth(0)
        setRailStyle({
          '--ticker-duration': `${Math.max(22, (contentWidth * 2) / TICKER_PX_PER_SEC)}s`,
          '--ticker-end': '-50%',
        } as CSSProperties)
        return
      }

      const spacer = Math.max(viewportWidth - contentWidth + 64, 96)
      const travel = contentWidth + spacer
      setMotion('loop-padded')
      setSpacerWidth(spacer)
      setRailStyle({
        '--ticker-duration': `${Math.max(18, (travel * 2) / TICKER_PX_PER_SEC)}s`,
        '--ticker-end': `-${travel}px`,
      } as CSSProperties)
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(viewport)
    ro.observe(measure)
    return () => ro.disconnect()
  }, [taskKey, sorted.length])

  const renderChips = (keySuffix = '') =>
    sorted.map((idea) => (
      <TickerChip
        key={`${idea.id}${keySuffix}`}
        idea={idea}
        assigneeName={
          idea.assigneeUserId ? assigneeNames.get(idea.assigneeUserId) : undefined
        }
        onMarkChecked={onMarkChecked}
        onRemoveFromFloating={onRemoveFromFloating}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      />
    ))

  const dropHandlers = {
    onDragOver: (e: DragEvent) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      onDragOver()
    },
    onDragLeave,
    onDrop: (e: DragEvent) => {
      e.preventDefault()
      const ideaId = e.dataTransfer.getData(timelineDragMime())
      if (ideaId) onDropIdea(ideaId)
    },
  }

  return (
    <section
      className={cn(
        'lambo-ticker border-b border-border-light bg-surface-container-low transition-colors',
        isDropTarget && 'bg-primary/10 ring-2 ring-inset ring-primary/50',
        isDragging && !isDropTarget && 'opacity-95',
      )}
      aria-label="משימות צפות ללא שיוך לזמן"
      {...dropHandlers}
    >
      <div className="lambo-ticker__label">
        <span className="flex items-center gap-1.5 font-label-sm text-on-surface sm:font-label-md">
          <Radio className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" aria-hidden />
          <span className="hidden sm:inline">משימות צפות</span>
          <span className="sm:hidden">צף</span>
        </span>
        <span className="mt-0.5 block text-[11px] text-secondary sm:font-label-sm">
          {isDropTarget ? (
            <span className="text-primary">שחרר כאן</span>
          ) : tasks.length > 0 ? (
            <>
              {tasks.length} ללא זמן
              {dueCount > 0 && (
                <span className="text-primary"> · {dueCount} לבדיקה</span>
              )}
            </>
          ) : (
            'גרור מלא מתוכנן'
          )}
        </span>
      </div>

      <div className="lambo-ticker__viewport min-w-0 flex-1">
        {tasks.length === 0 ? (
          <div
            className={cn(
              'flex h-full min-h-[3rem] items-center px-4',
              isDropTarget && 'justify-center',
            )}
          >
            <p
              className={cn(
                'font-label-sm text-secondary',
                isDropTarget && 'font-label-md text-primary',
              )}
            >
              {isDropTarget
                ? 'שחרר להפיכה למשימה צפה'
                : 'גרור משימות מ"לא מתוכנן" לכאן'}
            </p>
          </div>
        ) : (
          <div ref={viewportRef} className="lambo-ticker__track">
            <div ref={measureRef} className="lambo-ticker__measure" aria-hidden>
              {renderChips('-measure')}
            </div>
            <div
              className={cn(
                'lambo-ticker__rail',
                motion === 'solo' && 'lambo-ticker__rail--solo',
                (isDropTarget || isDragging) && 'lambo-ticker__rail--paused',
              )}
              style={railStyle}
            >
              {renderChips()}
              {motion === 'loop' && renderChips('-loop')}
              {motion === 'loop-padded' && (
                <>
                  <div
                    className="lambo-ticker__spacer shrink-0"
                    style={{ width: spacerWidth }}
                    aria-hidden
                  />
                  {renderChips('-loop')}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
