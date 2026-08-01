import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ label, id, className, error, ...props }, ref) {
    const inputId = id ?? props.name

    return (
      <div className="space-y-2">
        <label htmlFor={inputId} className="block font-label-md text-secondary">
          {label}
          {props.required && <span className="text-error"> *</span>}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'boutique-input',
            error && 'border-error focus:ring-error',
            className,
          )}
          aria-invalid={error || undefined}
          {...props}
        />
      </div>
    )
  },
)
