import type { LucideIcon } from 'lucide-react'
import { MoreVertical } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/app'
import { Badge } from './Badge'
import { cn } from '../../lib/cn'

export interface IdeaTableRowProps {
  ideaId: string
  title: string
  category: string
  status: string
  statusVariant: 'development' | 'monitoring'
  date: string
  icon: LucideIcon
  iconWrapperClassName: string
}

export function IdeaTableRow({
  ideaId,
  title,
  category,
  status,
  statusVariant,
  date,
  icon: Icon,
  iconWrapperClassName,
}: IdeaTableRowProps) {
  return (
    <tr className="group transition-colors hover:bg-surface-subtle">
      <td className="px-4 py-5 md:px-8">
        <Link
          to={ROUTES.ideaDetail(ideaId)}
          className="flex items-center gap-3"
        >
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg',
              iconWrapperClassName,
            )}
          >
            <Icon className="h-5 w-5" aria-hidden />
          </div>
          <span className="font-label-md text-on-surface transition-colors group-hover:text-primary">
            {title}
          </span>
        </Link>
      </td>
      <td className="hidden px-8 py-5 text-body-md text-secondary sm:table-cell">
        {category}
      </td>
      <td className="px-4 py-5 md:px-8">
        <Badge variant={statusVariant}>{status}</Badge>
      </td>
      <td className="hidden px-8 py-5 text-body-md text-secondary md:table-cell">
        {date}
      </td>
      <td className="px-4 py-5 text-left md:px-8">
        <Link
          to={ROUTES.ideaDetail(ideaId)}
          className="inline-flex rounded-lg p-2 opacity-100 transition-all hover:bg-surface-container md:opacity-0 md:group-hover:opacity-100"
          aria-label={`פעולות עבור ${title}`}
        >
          <MoreVertical className="h-5 w-5 text-secondary" />
        </Link>
      </td>
    </tr>
  )
}
