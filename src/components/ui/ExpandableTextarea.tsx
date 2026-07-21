import { Maximize2, Minimize2 } from 'lucide-react'
import { useState, type TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export interface ExpandableTextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'rows'> {
  label: string
  hint?: string
  defaultRows?: number
  expandedRows?: number
}

export function ExpandableTextarea({
  label,
  hint,
  id,
  className,
  defaultRows = 8,
  expandedRows = 16,
  ...props
}: ExpandableTextareaProps) {
  const areaId = id ?? props.name
  const [expanded, setExpanded] = useState(false)
  const rows = expanded ? expandedRows : defaultRows

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={areaId} className="block font-label-md text-secondary">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="inline-flex items-center gap-1.5 font-label-sm text-primary hover:underline"
        >
          {expanded ? (
            <>
              <Minimize2 className="h-4 w-4" />
              כווץ
            </>
          ) : (
            <>
              <Maximize2 className="h-4 w-4" />
              הרחב
            </>
          )}
        </button>
      </div>
      <textarea
        id={areaId}
        rows={rows}
        className={cn(
          'boutique-input min-h-[10rem] w-full resize-y leading-relaxed',
          expanded && 'min-h-[20rem]',
          className,
        )}
        {...props}
      />
      {hint && <p className="font-label-sm text-secondary">{hint}</p>}
    </div>
  )
}
