import { LogIn } from 'lucide-react'
import type { AppUser } from '../../types/user'
import { cn } from '../../lib/cn'

export interface UserLoginCardProps {
  user: AppUser
  onSelect: () => void
}

const accentByUser: Record<string, string> = {
  nir: 'hover:border-primary/40',
  golan: 'hover:border-inbox/40',
}

export function UserLoginCard({ user, onSelect }: UserLoginCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group w-full border border-border-light bg-surface-container-lowest/90 p-8 text-center backdrop-blur-xl transition-colors duration-300',
        accentByUser[user.id] ?? 'hover:border-primary/30',
      )}
    >
      <div
        className={cn(
          'mx-auto mb-5 flex h-20 w-20 items-center justify-center text-2xl font-bold transition-colors duration-300',
          user.id === 'nir'
            ? 'bg-primary/15 text-primary'
            : 'bg-surface-container-low text-inbox',
        )}
      >
        {user.initials}
      </div>
      <h2 className="mb-1 font-display text-headline-md text-on-surface">{user.name}</h2>
      <p className="mb-6 font-body-md text-secondary">{user.jobTitle}</p>
      <span className="inline-flex items-center gap-2 font-label-md text-primary">
        <LogIn className="h-5 w-5" />
        כניסה
      </span>
    </button>
  )
}
