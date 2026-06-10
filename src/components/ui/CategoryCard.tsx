import type { LucideIcon } from 'lucide-react'
import type { IdeaCategory } from '../../types/idea'
import { cn } from '../../lib/cn'

export interface CategoryCardProps {
  category: IdeaCategory
  label: string
  icon: LucideIcon
  selected: boolean
  onSelect: () => void
  name?: string
}

export function CategoryCard({
  category,
  label,
  icon: Icon,
  selected,
  onSelect,
  name = 'category',
}: CategoryCardProps) {
  return (
    <label className="relative block cursor-pointer">
      <input
        type="radio"
        name={name}
        value={category}
        className="peer sr-only"
        checked={selected}
        onChange={onSelect}
        aria-checked={selected}
      />
      <div
        className={cn(
          'flex min-h-[5.5rem] flex-col items-center justify-center border-2 p-4 transition-all duration-200 sm:min-h-[6.5rem] sm:p-5',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background',
          selected
            ? 'border-primary bg-primary text-on-primary'
            : 'border-border-light bg-surface-subtle text-secondary hover:border-primary/40 hover:bg-surface-container-low',
        )}
      >
        <Icon className="mb-2 h-7 w-7 sm:h-8 sm:w-8" aria-hidden />
        <span className="font-label-md">{label}</span>
      </div>
    </label>
  )
}
