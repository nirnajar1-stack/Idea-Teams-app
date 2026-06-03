import { LogIn } from 'lucide-react'
import type { AppUser } from '../../types/user'
import { cn } from '../../lib/cn'

export interface UserLoginCardProps {
  user: AppUser
  onSelect: () => void
}

const accentByUser = {
  nir: 'hover:border-primary/40 hover:shadow-glow',
  golan: 'hover:border-inbox/40 hover:shadow-[0_8px_32px_rgba(124,107,207,0.2)]',
} as const

export function UserLoginCard({ user, onSelect }: UserLoginCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group w-full rounded-2xl border border-white/70 bg-white/70 p-8 text-center shadow-card backdrop-blur-xl transition-all duration-300 active:scale-[0.98]',
        accentByUser[user.id],
      )}
    >
      <div
        className={cn(
          'mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl text-2xl font-bold transition-transform duration-300 group-hover:scale-105',
          user.id === 'nir'
            ? 'bg-gradient-to-br from-primary-fixed to-primary/20 text-primary'
            : 'bg-gradient-to-br from-inbox-soft to-inbox/20 text-inbox',
        )}
      >
        {user.initials}
      </div>
      <h2 className="mb-1 font-display text-headline-md text-on-surface">{user.name}</h2>
      <p className="mb-6 font-body-md text-secondary">{user.role}</p>
      <span className="inline-flex items-center gap-2 font-label-md text-primary">
        <LogIn className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
        כניסה
      </span>
    </button>
  )
}
