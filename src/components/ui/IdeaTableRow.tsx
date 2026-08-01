import type { LucideIcon } from 'lucide-react'
import { MoreVertical } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAppRoutes } from '../../context/EmbedModeContext'
import { Badge } from './Badge'
import { TargetDateBadge } from './TargetDateBadge'
import { cn } from '../../lib/cn'

export interface IdeaTableRowProps {
  ideaId: string
  title: string
  authorName: string
  targetStartDate: string
  category: string
  status: string
  statusVariant: 'development' | 'monitoring' | 'technical'
  date: string
  icon: LucideIcon
  iconWrapperClassName: string
  compact?: boolean
}

export function IdeaTableRow({
  ideaId,
  title,
  authorName,
  targetStartDate,
  category,
  status,
  statusVariant,
  date,
  icon: Icon,
  iconWrapperClassName,
  compact = false,
}: IdeaTableRowProps) {
  const routes = useAppRoutes()
  const cell = compact ? 'px-4 py-2.5' : 'px-4 py-5 md:px-8'
  const cellWide = compact ? 'px-4 py-2.5' : 'px-8 py-5'

  return (
    <tr className="group transition-colors hover:bg-surface-subtle">
      <td className={cell}>
        <Link
          to={routes.ideaDetail(ideaId)}
          className="flex items-center gap-3"
        >
          <div
            className={cn(
              'flex items-center justify-center',
              compact ? 'h-8 w-8' : 'h-10 w-10',
              iconWrapperClassName,
            )}
          >
            <Icon className={compact ? 'h-4 w-4' : 'h-5 w-5'} aria-hidden />
          </div>
          <div>
            <span className="font-label-md text-on-surface transition-colors group-hover:text-primary">
              {title}
            </span>
            <span className="mt-0.5 block font-label-sm text-secondary sm:hidden">
              {authorName}
            </span>
          </div>
        </Link>
      </td>
      <td className={cn('hidden text-body-md text-secondary sm:table-cell', cellWide)}>
        {category}
      </td>
      <td className={cn('hidden font-label-sm text-secondary lg:table-cell', cellWide)}>
        {authorName}
      </td>
      <td className={cell}>
        <Badge variant={statusVariant}>{status}</Badge>
      </td>
      <td className={cn('hidden md:table-cell', cell)}>
        <TargetDateBadge targetStartDate={targetStartDate} compact />
      </td>
      <td className={cn('hidden text-body-md text-secondary xl:table-cell', cellWide)}>
        {date}
      </td>
      <td className={cn('text-left', cell)}>
        <Link
          to={routes.ideaDetail(ideaId)}
          className="inline-flex p-2 opacity-100 transition-colors hover:bg-surface-container md:opacity-0 md:group-hover:opacity-100"
          aria-label={`פעולות עבור ${title}`}
        >
          <MoreVertical className="h-5 w-5 text-secondary" />
        </Link>
      </td>
    </tr>
  )
}
