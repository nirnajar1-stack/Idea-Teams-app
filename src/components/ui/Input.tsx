import type { InputHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function Input({ label, id, className, ...props }: InputProps) {
  const inputId = id ?? props.name

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block font-label-md text-secondary">
        {label}
      </label>
      <input
        id={inputId}
        className={cn(
          'w-full rounded-lg border border-border-light bg-surface-subtle px-4 py-3 font-body-md text-on-surface transition-all placeholder:text-outline-variant focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
          className,
        )}
        {...props}
      />
    </div>
  )
}
