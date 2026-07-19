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
}: IdeaTableRowProps) {
  const routes = useAppRoutes()

  return (
    <tr className="group transition-colors hover:bg-surface-subtle">
      <td className="px-4 py-5 md:px-8">
        <Link
          to={routes.ideaDetail(ideaId)}
          className="flex items-center gap-3"
        >
          <div
            className={cn('flex h-10 w-10 items-center justify-center', iconWrapperClassName)}
          >
            <Icon className="h-5 w-5" aria-hidden />
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
      <td className="hidden px-8 py-5 text-body-md text-secondary sm:table-cell">
        {category}
      </td>
      <td className="hidden px-8 py-5 font-label-sm text-secondary lg:table-cell">
        {authorName}
      </td>
      <td className="px-4 py-5 md:px-8">
        <Badge variant={statusVariant}>{status}</Badge>
      </td>
      <td className="hidden px-4 py-5 md:table-cell md:px-8">
        <TargetDateBadge targetStartDate={targetStartDate} compact />
      </td>
      <td className="hidden px-8 py-5 text-body-md text-secondary xl:table-cell">
        {date}
      </td>
      <td className="px-4 py-5 text-left md:px-8">
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
