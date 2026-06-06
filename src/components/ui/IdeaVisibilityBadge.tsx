import { Lock, Shield, Users } from 'lucide-react'
import type { IdeaVisibility } from '../../types/idea'
import { IDEA_VISIBILITY_LABELS } from '../../lib/ideaVisibility'
import { Badge } from '../ui/Badge'

const ICONS = {
  team: Users,
  managers_only: Shield,
  master_private: Lock,
} as const

export function IdeaVisibilityBadge({ visibility }: { visibility: IdeaVisibility }) {
  if (visibility === 'team') return null
  const Icon = ICONS[visibility]
  const variant = visibility === 'master_private' ? 'priority-high' : 'surface'
  return (
    <Badge variant={variant} icon={<Icon className="h-3.5 w-3.5" />}>
      {IDEA_VISIBILITY_LABELS[visibility]}
    </Badge>
  )
}
