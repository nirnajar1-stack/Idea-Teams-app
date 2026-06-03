export interface ProgressBarProps {
  percent: number
  label?: string
  stepLabel?: string
}

export function ProgressBar({ percent, label, stepLabel }: ProgressBarProps) {
  return (
    <div>
      <div className="mb-2 h-2 w-full rounded-full bg-surface-container-high">
        <div
          className="h-2 rounded-full bg-primary transition-all duration-500"
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
      {(label || stepLabel) && (
        <div className="flex justify-between text-[12px] text-secondary">
          {label && <span>{label}</span>}
          {stepLabel && <span>{stepLabel}</span>}
        </div>
      )}
    </div>
  )
}
