import type { TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
}

export function Textarea({ label, id, className, ...props }: TextareaProps) {
  const areaId = id ?? props.name

  return (
    <div className="space-y-2">
      <label htmlFor={areaId} className="block font-label-md text-secondary">
        {label}
      </label>
      <textarea
        id={areaId}
        className={cn(
          'w-full resize-none rounded-lg border border-border-light bg-surface-subtle px-4 py-3 font-body-md text-on-surface transition-all placeholder:text-outline-variant focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
          className,
        )}
        {...props}
      />
    </div>
  )
}
