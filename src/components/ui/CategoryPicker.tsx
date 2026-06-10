import { Activity, Code, Wrench } from 'lucide-react'
import type { IdeaCategory } from '../../types/idea'
import { CATEGORY_LABELS } from '../../lib/ideaUtils'
import { CategoryCard } from './CategoryCard'

export const IDEA_CATEGORIES: IdeaCategory[] = [
  'development',
  'monitoring',
  'technical',
]

const CATEGORY_ICONS = {
  development: Code,
  monitoring: Activity,
  technical: Wrench,
} as const

export interface CategoryPickerProps {
  value: IdeaCategory
  onChange: (category: IdeaCategory) => void
  name?: string
}

export function CategoryPicker({ value, onChange, name = 'category' }: CategoryPickerProps) {
  return (
    <div
      className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-3 sm:gap-4"
      role="radiogroup"
      aria-label="קטגוריה"
    >
      {IDEA_CATEGORIES.map((cat) => (
        <CategoryCard
          key={cat}
          name={name}
          category={cat}
          label={CATEGORY_LABELS[cat]}
          icon={CATEGORY_ICONS[cat]}
          selected={value === cat}
          onSelect={() => onChange(cat)}
        />
      ))}
    </div>
  )
}
