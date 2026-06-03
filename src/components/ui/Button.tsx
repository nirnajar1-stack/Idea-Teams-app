import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  icon?: ReactNode
  children: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'btn-boutique',
  secondary:
    'border border-border-light/80 bg-white/70 text-secondary shadow-sm backdrop-blur-sm hover:bg-white hover:text-on-surface active:scale-95',
  ghost:
    'text-primary hover:bg-primary/5 active:scale-95',
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
