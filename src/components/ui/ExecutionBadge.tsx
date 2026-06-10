import { ListTodo } from 'lucide-react'

export function ExecutionBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1 border border-primary/30 bg-primary/10 px-2.5 py-1 font-label-sm text-primary">
      <ListTodo className="h-3.5 w-3.5" aria-hidden />
      {compact ? 'לביצוע' : 'מסומן לביצוע'}
    </span>
  )
}
