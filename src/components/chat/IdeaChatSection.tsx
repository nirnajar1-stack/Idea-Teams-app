import { MessagesSquare } from 'lucide-react'
import { chatApiAvailable } from '../../api/chatApi'
import type { Idea } from '../../types/idea'
import { ChatPanel } from './ChatPanel'

export interface IdeaChatSectionProps {
  idea: Idea
}

export function IdeaChatSection({ idea }: IdeaChatSectionProps) {
  if (!chatApiAvailable()) return null

  return (
    <section id="idea-chat" className="glass-card scroll-mt-28 p-6 md:p-8">
      <span className="section-eyebrow">
        <MessagesSquare className="h-3.5 w-3.5" />
        צ'אט רעיון
      </span>
      <ChatPanel
        scope="idea"
        ideaId={idea.id}
        title={`דיון: ${idea.title}`}
        subtitle="הודעות המקושרות לרעיון זה בלבד"
      />
    </section>
  )
}
