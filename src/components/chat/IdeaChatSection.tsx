import { MessagesSquare } from 'lucide-react'
import { chatApiAvailable } from '../../api/chatApi'
import type { Idea } from '../../types/idea'
import { ChatPanel } from './ChatPanel'

export interface IdeaChatSectionProps {
  idea: Idea
  /** בלי מסגרת/כותרת — לשימוש בתוך CollapsibleBlock */
  embedded?: boolean
}

export function IdeaChatSection({ idea, embedded = false }: IdeaChatSectionProps) {
  if (!chatApiAvailable()) return null

  const panel = (
    <ChatPanel
      scope="idea"
      ideaId={idea.id}
      title={`דיון: ${idea.title}`}
      subtitle="הודעות המקושרות לבקשה/רעיון זה בלבד"
    />
  )

  if (embedded) {
    return (
      <div id="idea-chat" className="scroll-mt-28">
        {panel}
      </div>
    )
  }

  return (
    <section id="idea-chat" className="glass-card scroll-mt-28 p-6 md:p-8">
      <span className="section-eyebrow">
        <MessagesSquare className="h-3.5 w-3.5" />
        צ'אט בקשה/רעיון
      </span>
      {panel}
    </section>
  )
}
