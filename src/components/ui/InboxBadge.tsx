import { Archive } from 'lucide-react'

export function InboxBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-inbox/30 bg-inbox-soft px-2.5 py-1 font-label-sm text-inbox">
      <Archive className="h-3.5 w-3.5" aria-hidden />
      Inbox · אולי בהמשך
    </span>
  )
}
