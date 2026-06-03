import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  icon?: ReactNode
  children: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-on-primary shadow-sm hover:opacity-90 active:scale-95',
  secondary:
    'border border-border-light bg-surface-container-lowest text-secondary hover:bg-surface-subtle active:scale-95',
  ghost:
    'text-primary hover:bg-surface-container-low active:scale-95',
}

export function Button({
  variant = 'primary',
  icon,
  children,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-label-md transition-all duration-200',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}
