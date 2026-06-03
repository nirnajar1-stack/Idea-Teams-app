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
        className={cn('boutique-input', className)}
        {...props}
      />
    </div>
  )
}
