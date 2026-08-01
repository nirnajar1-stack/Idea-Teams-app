import { ListTodo } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAppRoutes } from '../../context/EmbedModeContext'
import {
  CATEGORY_LABELS,
  formatIdeaDate,
  PRIORITY_LABELS,
} from '../../lib/ideaUtils'
import type { Idea } from '../../types/idea'
import { Badge } from '../ui/Badge'
import { TargetDateBadge } from '../ui/TargetDateBadge'
import { cn } from '../../lib/cn'

export interface IdeasCompactTableProps {
  ideas: Idea[]
  showMasterExecutionToggle?: boolean
  onExecutionToggle?: (ideaId: string, send: boolean) => void
}

const priorityVariant = {
  high: 'priority-high',
  medium: 'priority-medium',
  low: 'priority-low',
} as const

export function IdeasCompactTable({
  ideas,
  showMasterExecutionToggle,
  onExecutionToggle,
}: IdeasCompactTableProps) {
  const routes = useAppRoutes()

  return (
    <div className="overflow-x-auto rounded-[1.75rem] border border-transparent bg-surface-container-lowest shadow-card">
      <table className="w-full min-w-[640px] text-right">
        <thead className="border-b border-border-light bg-surface-subtle">
          <tr>
            <th className="px-3 py-3 font-label-sm text-secondary md:px-4">כותרת</th>
            <th className="px-3 py-3 font-label-sm text-secondary md:px-4">חשיבות</th>
            <th className="hidden px-3 py-3 font-label-sm text-secondary sm:table-cell md:px-4">
              קטגוריה
            </th>
            <th className="px-3 py-3 font-label-sm text-secondary md:px-4">יעד</th>
            <th className="hidden px-3 py-3 font-label-sm text-secondary lg:table-cell md:px-4">
              פותח
            </th>
            <th className="px-3 py-3 font-label-sm text-secondary md:px-4">
              <span className="sr-only">פעולות</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {ideas.map((idea) => (
            <tr
              key={idea.id}
              className="border-b border-border-light/80 transition-colors last:border-0 hover:bg-surface-subtle"
            >
              <td className="px-3 py-2.5 md:px-4">
                <Link
                  to={routes.ideaDetail(idea.id)}
                  className="block min-w-0 font-label-md text-on-surface hover:text-primary"
                >
                  <span className="line-clamp-1">{idea.title}</span>
                  <span className="mt-0.5 block font-label-sm text-secondary sm:hidden">
                    {idea.authorName}
                  </span>
                </Link>
              </td>
              <td className="px-3 py-2.5 md:px-4">
                <Badge
                  variant={priorityVariant[idea.priority]}
                  className="!py-0 text-[10px]"
                >
                  {PRIORITY_LABELS[idea.priority]}
                </Badge>
              </td>
              <td className="hidden px-3 py-2.5 text-body-sm text-secondary sm:table-cell md:px-4">
                {CATEGORY_LABELS[idea.category]}
              </td>
              <td className="px-3 py-2.5 md:px-4">
                <TargetDateBadge
                  targetStartDate={idea.targetStartDate}
                  workflowStatus={idea.workflowStatus}
                  compact
                />
              </td>
              <td className="hidden px-3 py-2.5 text-body-sm text-secondary lg:table-cell md:px-4">
                {idea.authorName}
                <span className="mt-0.5 block text-[11px] opacity-70">
                  {formatIdeaDate(idea.createdAt)}
                </span>
              </td>
              <td className="px-3 py-2.5 md:px-4">
                <div className="flex items-center justify-end gap-1">
                  {showMasterExecutionToggle && onExecutionToggle && (
                    <button
                      type="button"
                      onClick={() =>
                        onExecutionToggle(idea.id, !idea.sentToExecution)
                      }
                      className={cn(
                        'inline-flex min-h-10 items-center gap-1 border px-2 py-1.5 font-label-sm transition-colors',
                        idea.sentToExecution
                          ? 'border-primary/30 bg-primary/5 text-primary'
                          : 'border-border-light text-secondary hover:border-primary/25',
                      )}
                      title={
                        idea.sentToExecution ? 'הסר לביצוע' : 'תייג לביצוע'
                      }
                    >
                      <ListTodo className="h-3.5 w-3.5" />
                      <span className="hidden xl:inline">
                        {idea.sentToExecution ? 'בביצוע' : 'לביצוע'}
                      </span>
                    </button>
                  )}
                  <Link
                    to={routes.ideaDetail(idea.id)}
                    className="inline-flex min-h-10 items-center px-2 font-label-sm text-primary hover:underline"
                  >
                    פרטים
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
