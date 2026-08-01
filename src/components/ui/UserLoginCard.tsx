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
        'group w-full rounded-[1.85rem] border border-transparent bg-surface-container-lowest p-8 text-center shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover',
        accentByUser[user.id] ?? '',
      )}
    >
      <div
        className={cn(
          'mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold transition-colors duration-300',
          user.id === 'nir'
            ? 'bg-primary text-on-primary'
            : 'bg-surface-container text-on-surface',
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
