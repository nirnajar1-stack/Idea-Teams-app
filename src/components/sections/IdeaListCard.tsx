import { Archive, ArrowLeft, Code, ListTodo, Rocket, Verified, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useAppRoutes } from '../../context/EmbedModeContext'
import { useIdeas } from '../../context/IdeasContext'
import {
  CATEGORY_LABELS,
  formatIdeaDate,
  isContainerIdea,
  PRIORITY_LABELS,
  WORKFLOW_LABELS,
} from '../../lib/ideaUtils'
import { cn } from '../../lib/cn'
import type { Idea, IdeaPriority } from '../../types/idea'
import { Badge } from '../ui/Badge'
import { ContainerBadge } from '../ui/ContainerBadge'
import { ExecutionBadge } from '../ui/ExecutionBadge'
import { InboxBadge } from '../ui/InboxBadge'
import { IdeaSourceBadge } from '../ui/IdeaSourceBadge'
import { TargetDateBadge } from '../ui/TargetDateBadge'

export interface IdeaListCardProps {
  idea: Idea
  compact?: boolean
  completed?: boolean
  showInboxActions?: boolean
  onRestoreFromInbox?: (ideaId: string) => void
  showMasterExecutionToggle?: boolean
  onExecutionToggle?: (ideaId: string, send: boolean) => void
}

const priorityVariant: Record<
  IdeaPriority,
  'priority-high' | 'priority-medium' | 'priority-low'
> = {
  high: 'priority-high',
  medium: 'priority-medium',
  low: 'priority-low',
}

export function IdeaListCard({
  idea,
  compact = false,
  completed = false,
  showInboxActions = false,
  onRestoreFromInbox,
  showMasterExecutionToggle = false,
  onExecutionToggle,
}: IdeaListCardProps) {
  const routes = useAppRoutes()
  const { getSubIdeas } = useIdeas()
  const CategoryIcon =
    idea.category === 'development'
      ? Code
      : idea.category === 'technical'
        ? Wrench
        : Verified
  const subCount = isContainerIdea(idea) ? getSubIdeas(idea.id).length : 0

  const executionToggleButton = showMasterExecutionToggle && onExecutionToggle && (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        const send = !idea.sentToExecution
        onExecutionToggle(idea.id, send)
        toast.success(send ? 'סומן לביצוע' : 'הוסר תיוג לביצוע')
      }}
      className="inline-flex shrink-0 items-center gap-1 border border-primary/20 bg-primary/5 px-2.5 py-1.5 font-label-sm text-primary transition-colors hover:bg-primary/10"
    >
      <ListTodo className="h-3.5 w-3.5" />
      {idea.sentToExecution ? 'הסר לביצוע' : 'תייג לביצוע'}
    </button>
  )

  const restoreButton = showInboxActions && onRestoreFromInbox && (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        onRestoreFromInbox(idea.id)
        toast.success('הוחזר לבקשות/רעיונות פעילים')
      }}
      className="inline-flex shrink-0 items-center gap-1 border border-primary/20 bg-primary/5 px-2.5 py-1.5 font-label-sm text-primary transition-colors hover:bg-primary/10"
    >
      <Rocket className="h-3.5 w-3.5" />
      החזר לפעילים
    </button>
  )

  if (compact) {
    return (
      <article
        className={cn(
          'group flex items-center gap-3 border border-border-light bg-surface-container-lowest/90 px-3 py-2.5 transition-colors hover:border-primary/30 hover:bg-primary/5',
          completed && 'border-success-vibrant/20 bg-success-vibrant/5',
          showInboxActions && 'border-inbox/20',
        )}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container-low text-[9px] font-semibold text-secondary">
          {idea.authorInitials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="truncate font-label-md text-on-surface group-hover:text-primary">
              {idea.title}
            </h3>
            <Badge variant={priorityVariant[idea.priority]} className="!py-0 text-[10px]">
              {PRIORITY_LABELS[idea.priority]}
            </Badge>
            {showInboxActions && <InboxBadge />}
            {idea.sentToExecution && <ExecutionBadge compact />}
            <IdeaSourceBadge source={idea.ideaSource} compact />
            {completed && (
              <Badge variant="surface" className="!py-0 text-[10px] text-success-vibrant">
                {WORKFLOW_LABELS.completed}
              </Badge>
            )}
          </div>
          <p className="truncate font-label-sm text-secondary">
            {idea.authorName} · {formatIdeaDate(idea.createdAt)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {executionToggleButton}
          {restoreButton}
          <Link
            to={routes.ideaDetail(idea.id)}
            className="p-2 text-primary transition-colors hover:bg-primary/10"
            aria-label={`פרטים — ${idea.title}`}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </article>
    )
  }

  return (
    <article
      className={cn(
        'glass-card-hover group p-6 md:p-7',
        completed && 'border-success-vibrant/25 bg-success-vibrant/5',
        showInboxActions && 'border-inbox/20',
      )}
    >
      <div className="flex flex-col justify-between gap-4">
        <div className="flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant={priorityVariant[idea.priority]}>
              {PRIORITY_LABELS[idea.priority]}
            </Badge>
            <Badge variant="surface" icon={<CategoryIcon className="h-3.5 w-3.5" />}>
              {CATEGORY_LABELS[idea.category]}
            </Badge>
            {showInboxActions && (
              <Badge variant="surface" icon={<Archive className="h-3.5 w-3.5" />} className="text-inbox">
                Inbox
              </Badge>
            )}
            {completed && (
              <Badge variant="surface" className="text-success-vibrant">
                {WORKFLOW_LABELS.completed}
              </Badge>
            )}
            {isContainerIdea(idea) && (
              <ContainerBadge subCount={subCount} compact />
            )}
            {!showInboxActions && idea.sendToMaybeInbox && <InboxBadge />}
            {idea.sentToExecution && <ExecutionBadge />}
            <IdeaSourceBadge source={idea.ideaSource} />
            <TargetDateBadge targetStartDate={idea.targetStartDate} compact />
            <span className="mr-auto font-label-sm text-secondary md:mr-0">
              {formatIdeaDate(idea.createdAt)}
            </span>
          </div>
          <h3 className="mb-2 font-display text-headline-md text-on-surface transition-colors group-hover:text-primary">
            {idea.title}
          </h3>
          <p className="mb-6 line-clamp-2 font-body-md text-on-surface-variant">
            {idea.description}
          </p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-low text-[10px] font-semibold text-secondary">
                {idea.authorInitials}
              </div>
              <span className="font-label-sm text-secondary">
                נפתח על ידי <span className="text-on-surface">{idea.authorName}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              {executionToggleButton}
              {restoreButton}
              <Link
                to={routes.ideaDetail(idea.id)}
                className="flex items-center gap-1 font-label-md text-primary hover:underline decoration-2 underline-offset-4"
              >
                פרטים נוספים
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
