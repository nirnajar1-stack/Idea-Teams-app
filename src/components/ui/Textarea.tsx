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
        className={cn('boutique-input resize-none', className)}
        {...props}
      />
    </div>
  )
}
