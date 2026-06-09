import { Layers } from 'lucide-react'
import { cn } from '../../lib/cn'

export interface ContainerKindToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
}

export function ContainerKindToggle({ checked, onChange }: ContainerKindToggleProps) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-all',
        checked
          ? 'border-primary/35 bg-primary/5 shadow-glow'
          : 'border-border-light bg-surface-container-low/80 hover:border-primary/30',
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 rounded text-primary focus:ring-primary"
      />
      <div className="flex-1">
        <div className="mb-1 flex items-center gap-2 font-label-md text-on-surface">
          <Layers className="h-5 w-5 text-primary" />
          בקשה/רעיון עם תת-בקשות/רעיונות
        </div>
        <p className="font-label-sm text-secondary">
          מארז שמאגד מספר בקשות/רעיונות קשורים. לאחר היצירה תוכלו להוסיף תת-בקשות/רעיונות בדף
          הפרטים. אפשרות זו זמינה למנהל בלבד.
        </p>
      </div>
    </label>
  )
}
