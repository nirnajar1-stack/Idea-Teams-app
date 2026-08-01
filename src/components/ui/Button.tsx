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
  secondary: 'btn-secondary-light',
  ghost:
    'min-h-12 rounded-full px-4 text-sm font-medium tracking-tight text-secondary transition-colors duration-300 hover:bg-surface-container hover:text-on-surface',
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
        'inline-flex items-center justify-center gap-2 transition-colors duration-300',
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
