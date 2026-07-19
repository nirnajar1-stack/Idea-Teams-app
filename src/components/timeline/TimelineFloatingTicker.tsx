import { CheckCheck, Inbox, Radio } from 'lucide-react'
import { useLayoutEffect, useRef, useState, type DragEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAppRoutes } from '../../context/EmbedModeContext'
import {
  CHECK_CADENCE_LABELS,
  isRoutineCheckDue,
} from '../../lib/ideaUtils'
import { timelineDragMime } from '../../lib/timelineUtils'
import { cn } from '../../lib/cn'
import type { Idea } from '../../types/idea'

const TICKER_PX_PER_SEC = 42

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
  const routes = useAppRoutes()
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
          to={routes.ideaDetail(idea.id)}
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
  const railRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<Animation | null>(null)
  const hoverPausedRef = useRef(false)
  const [loopDuplicate, setLoopDuplicate] = useState(false)

  const renderChips = (suffix = '') =>
    sorted.map((idea) => (
      <TickerChip
        key={`${idea.id}${suffix}`}
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

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    const rail = railRef.current
    if (!viewport || !rail || sorted.length === 0) {
      setLoopDuplicate(false)
      return
    }

    const firstSet = rail.querySelector<HTMLElement>('[data-ticker-set]')
    if (!firstSet) return

    const overflows = firstSet.offsetWidth > viewport.clientWidth + 4
    setLoopDuplicate(overflows)
  }, [taskKey, sorted.length])

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    const rail = railRef.current
    if (!viewport || !rail || sorted.length === 0) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const syncPlayback = () => {
      const anim = animRef.current
      if (!anim) return
      if (hoverPausedRef.current || isDropTarget || isDragging) anim.pause()
      else anim.play()
    }

    const startAnimation = () => {
      animRef.current?.cancel()
      rail.style.transform = ''

      if (reducedMotion) return

      const viewW = viewport.clientWidth
      const sets = rail.querySelectorAll<HTMLElement>('[data-ticker-set]')
      const firstSet = sets[0]
      if (!firstSet || viewW <= 0) return

      const contentW = firstSet.offsetWidth
      if (contentW <= 0) return

      if (loopDuplicate && sets.length > 1) {
        const half = rail.scrollWidth / 2
        const duration = Math.max(18, (half * 2) / TICKER_PX_PER_SEC) * 1000
        animRef.current = rail.animate(
          [
            { transform: 'translateX(0)' },
            { transform: `translateX(-${half}px)` },
          ],
          { duration, iterations: Infinity, easing: 'linear' },
        )
      } else {
        const travel = viewW + contentW
        const duration = Math.max(14, travel / TICKER_PX_PER_SEC) * 1000
        animRef.current = rail.animate(
          [
            { transform: `translateX(${viewW}px)` },
            { transform: `translateX(-${contentW}px)` },
          ],
          { duration, iterations: Infinity, easing: 'linear' },
        )
      }

      syncPlayback()
    }

    startAnimation()

    const ro = new ResizeObserver(() => startAnimation())
    ro.observe(viewport)
    ro.observe(rail)

    return () => {
      ro.disconnect()
      animRef.current?.cancel()
      animRef.current = null
    }
  }, [taskKey, sorted.length, loopDuplicate, isDropTarget, isDragging])

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
      onMouseEnter={() => {
        hoverPausedRef.current = true
        animRef.current?.pause()
      }}
      onMouseLeave={() => {
        hoverPausedRef.current = false
        if (!isDropTarget && !isDragging) animRef.current?.play()
      }}
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
            <div ref={railRef} className="lambo-ticker__rail">
              <div data-ticker-set className="lambo-ticker__set">
                {renderChips()}
              </div>
              {loopDuplicate && (
                <div data-ticker-set className="lambo-ticker__set" aria-hidden>
                  {renderChips('-loop')}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
