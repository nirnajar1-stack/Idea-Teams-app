import { ListTodo } from 'lucide-react'
import { cn } from '../../lib/cn'

export function ExecutionBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 border border-primary/30 bg-primary/10 px-2.5 py-1 font-label-sm text-primary transition-[color,background-color,border-color,transform] duration-300 animate-status-pop',
      )}
    >
      <ListTodo className="h-3.5 w-3.5" aria-hidden />
      {compact ? 'לביצוע' : 'מסומן לביצוע'}
    </span>
  )
}
