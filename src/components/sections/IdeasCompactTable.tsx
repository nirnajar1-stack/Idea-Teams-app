import { ChevronLeft, ListTodo } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAppRoutes } from '../../context/EmbedModeContext'
import { useFlashOnChange } from '../../hooks/useFlashOnChange'
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

function PriorityCell({ idea }: { idea: Idea }) {
  const flash = useFlashOnChange(idea.priority)
  return (
    <Badge
      variant={priorityVariant[idea.priority]}
      className={cn('!py-0 text-[10px]', flash)}
    >
      {PRIORITY_LABELS[idea.priority]}
    </Badge>
  )
}

function ExecutionToggleButton({
  idea,
  onToggle,
  className,
  labelOn,
  labelOff,
}: {
  idea: Idea
  onToggle: () => void
  className?: string
  labelOn: string
  labelOff: string
}) {
  const flash = useFlashOnChange(idea.sentToExecution)
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'transition-all duration-300',
        idea.sentToExecution
          ? 'border-primary/30 bg-primary/5 text-primary'
          : 'border-border-light text-secondary',
        flash,
        className,
      )}
      title={idea.sentToExecution ? 'הסר לביצוע' : 'תייג לביצוע'}
    >
      <ListTodo className="h-3.5 w-3.5 shrink-0" />
      <span className="xl:inline">{idea.sentToExecution ? labelOn : labelOff}</span>
    </button>
  )
}

export function IdeasCompactTable({
  ideas,
  showMasterExecutionToggle,
  onExecutionToggle,
}: IdeasCompactTableProps) {
  const routes = useAppRoutes()

  return (
    <>
      {/* מובייל: שורות מלאות לרוחב המסך — בלי גלילה אופקית */}
      <ul className="list-stagger space-y-2 md:hidden" aria-label="רשימת בקשות קומפקטית">
        {ideas.map((idea) => (
          <li key={idea.id}>
            <div className="rounded-[1.25rem] bg-surface-container-lowest p-3 shadow-soft">
              <Link
                to={routes.ideaDetail(idea.id)}
                className="flex items-start gap-2.5"
              >
                <div className="min-w-0 flex-1 text-right">
                  <p className="line-clamp-2 font-label-md leading-snug text-on-surface">
                    {idea.title}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center justify-end gap-1.5">
                    <PriorityCell idea={idea} />
                    <span className="text-micro text-secondary">
                      {CATEGORY_LABELS[idea.category]}
                    </span>
                    <TargetDateBadge
                      targetStartDate={idea.targetStartDate}
                      workflowStatus={idea.workflowStatus}
                      compact
                    />
                  </div>
                </div>
                <ChevronLeft className="mt-1 h-4 w-4 shrink-0 text-secondary" aria-hidden />
              </Link>
              {showMasterExecutionToggle && onExecutionToggle && (
                <ExecutionToggleButton
                  idea={idea}
                  onToggle={() => onExecutionToggle(idea.id, !idea.sentToExecution)}
                  className="mt-2 flex min-h-9 w-full items-center justify-center gap-1.5 rounded-xl border text-label-sm"
                  labelOn="בביצוע"
                  labelOff="תייג לביצוע"
                />
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* דסקטופ / טאבלט רחב */}
      <div className="hidden overflow-x-auto rounded-[1.75rem] border border-transparent bg-surface-container-lowest shadow-card md:block">
        <table className="w-full min-w-[560px] text-right">
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
                  <PriorityCell idea={idea} />
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
                      <ExecutionToggleButton
                        idea={idea}
                        onToggle={() =>
                          onExecutionToggle(idea.id, !idea.sentToExecution)
                        }
                        className="inline-flex min-h-10 items-center gap-1 border px-2 py-1.5 font-label-sm hover:border-primary/25"
                        labelOn="בביצוע"
                        labelOff="לביצוע"
                      />
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
    </>
  )
}
