import type { InputHTMLAttributes } from 'react'
import { Calendar } from 'lucide-react'
import { cn } from '../../lib/cn'

export interface DateInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  hint?: string
}

export function DateInput({ label, hint, id, className, ...props }: DateInputProps) {
  const inputId = id ?? props.name

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block font-label-md text-secondary">
        {label}
      </label>
      <div className="relative">
        <Calendar
          className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary/70"
          aria-hidden
        />
        <input
          id={inputId}
          type="date"
          className={cn('boutique-input pr-12', className)}
          {...props}
        />
      </div>
      {hint && <p className="font-label-sm text-secondary">{hint}</p>}
    </div>
  )
}
