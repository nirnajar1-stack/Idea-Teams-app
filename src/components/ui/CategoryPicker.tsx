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
  value: IdeaCategory | null
  onChange: (category: IdeaCategory) => void
  name?: string
  required?: boolean
  error?: boolean
}

export function CategoryPicker({
  value,
  onChange,
  name = 'category',
  required = false,
  error = false,
}: CategoryPickerProps) {
  return (
    <div className="space-y-2">
      <div
        className={`grid grid-cols-1 gap-3 min-[420px]:grid-cols-3 sm:gap-4 ${error ? 'rounded border border-error/40 p-2' : ''}`}
        role="radiogroup"
        aria-label="קטגוריה"
        aria-required={required}
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
      {required && !value && (
        <p className="text-sm text-error">יש לבחור קטגוריה — פיתוח, בקרה או טכני</p>
      )}
    </div>
  )
}
