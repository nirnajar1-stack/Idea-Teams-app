import { LogIn } from 'lucide-react'
import type { AppUser } from '../../types/user'
import { cn } from '../../lib/cn'

export interface UserLoginCardProps {
  user: AppUser
  onSelect: () => void
}

const accentByUser = {
  nir: 'hover:border-primary hover:bg-primary/5',
  golan: 'hover:border-tertiary hover:bg-tertiary/5',
} as const

export function UserLoginCard({ user, onSelect }: UserLoginCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex flex-col items-center rounded-2xl border-2 border-border-light bg-surface-container-lowest p-8 shadow-card transition-all duration-200 active:scale-[0.98]',
        accentByUser[user.id],
      )}
    >
      <div
        className={cn(
          'mb-4 flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-primary',
          user.id === 'nir' ? 'bg-primary-fixed' : 'bg-surface-container-high',
        )}
      >
        {user.initials}
      </div>
      <h2 className="mb-1 font-display text-headline-md text-on-surface">
        {user.name}
      </h2>
      <p className="mb-6 font-body-md text-secondary">{user.role}</p>
      <span className="inline-flex items-center gap-2 font-label-md text-primary">
        <LogIn className="h-5 w-5" />
        כניסה
      </span>
    </button>
  )
}
