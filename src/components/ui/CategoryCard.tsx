import type { LucideIcon } from 'lucide-react'
import type { IdeaCategory } from '../../types/idea'
import { cn } from '../../lib/cn'

export interface CategoryCardProps {
  category: IdeaCategory
  label: string
  icon: LucideIcon
  selected: boolean
  onSelect: () => void
}

export function CategoryCard({
  category,
  label,
  icon: Icon,
  selected,
  onSelect,
}: CategoryCardProps) {
  return (
    <label className="relative cursor-pointer">
      <input
        type="radio"
        name="category"
        value={category}
        className="peer sr-only"
        checked={selected}
        onChange={onSelect}
      />
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-xl border-2 border-transparent bg-surface-subtle p-6 transition-all duration-200 hover:bg-surface-container-low',
          selected && 'border-primary bg-primary/5',
        )}
      >
        <Icon className="mb-2 h-8 w-8 text-primary" aria-hidden />
        <span className="font-label-md text-on-surface">{label}</span>
      </div>
    </label>
  )
}
