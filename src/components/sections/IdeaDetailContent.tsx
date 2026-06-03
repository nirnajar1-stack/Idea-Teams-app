import {
  Calendar,
  CheckCircle,
  Download,
  FileText,
  Image,
  Target,
  AlertCircle,
} from 'lucide-react'
import {
  formatIdeaDateLong,
  PRIORITY_LABELS,
  WORKFLOW_LABELS,
} from '../../lib/ideaUtils'
import type { Idea } from '../../types/idea'
import { Badge } from '../ui/Badge'

export interface IdeaDetailContentProps {
  idea: Idea
}

export function IdeaDetailContent({ idea }: IdeaDetailContentProps) {
  return (
    <div className="space-y-8 lg:col-span-8">
      <section className="rounded-xl border border-border-light bg-surface-container-lowest p-6 shadow-sm md:p-8">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Badge
            variant="priority-high"
            icon={<AlertCircle className="h-3.5 w-3.5" />}
          >
            עדיפות {PRIORITY_LABELS[idea.priority]}
          </Badge>
          <Badge variant="success" icon={<CheckCircle className="h-3.5 w-3.5" />}>
            {WORKFLOW_LABELS[idea.workflowStatus]}
          </Badge>
          <span className="mr-auto font-label-sm text-secondary">
            ID: #{idea.externalId}
          </span>
        </div>
        <h1 className="mb-4 font-display text-headline-lg-mobile text-on-surface md:text-headline-lg">
          {idea.title}
        </h1>
        <p className="mb-8 font-body-lg leading-relaxed text-on-surface-variant">
          {idea.description}
        </p>
        <div className="grid grid-cols-1 gap-6 rounded-xl border border-border-light bg-surface-subtle p-6 md:grid-cols-2">
          <div>
            <h3 className="mb-2 font-label-md uppercase tracking-wider text-secondary">
              יוצר הרעיון
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-container font-bold text-primary">
                {idea.authorInitials}
              </div>
              <div>
                <div className="font-label-md text-on-surface">{idea.authorName}</div>
                <div className="text-[12px] text-secondary">{idea.authorRole}</div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="mb-2 font-label-md uppercase tracking-wider text-secondary">
              תאריך יצירה
            </h3>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-secondary" />
              <div className="font-label-md text-on-surface">
                {formatIdeaDateLong(idea.createdAt)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border-light bg-surface-container-lowest p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="mb-4 flex items-center gap-3 text-primary">
            <Target className="h-6 w-6" />
            <h2 className="font-display text-headline-md text-on-surface">יעדים מרכזיים</h2>
          </div>
          <ul className="space-y-4">
            {idea.goals.length > 0 ? (
              idea.goals.map((goal) => (
                <li key={goal} className="flex items-start gap-3">
                  <CheckCircle className="mt-1 h-5 w-5 shrink-0 text-success-vibrant" />
                  <span className="font-body-md text-on-surface-variant">{goal}</span>
                </li>
              ))
            ) : (
              <li className="font-body-md text-secondary">טרם הוגדרו יעדים</li>
            )}
          </ul>
        </div>

        <div className="rounded-xl border border-border-light bg-surface-container-lowest p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="mb-4 flex items-center gap-3 text-primary">
            <FileText className="h-6 w-6" />
            <h2 className="font-display text-headline-md text-on-surface">קבצים מצורפים</h2>
          </div>
          <div className="space-y-3">
            {idea.attachments.length > 0 ? (
              idea.attachments.map((file) => (
                <button
                  key={file.id}
                  type="button"
                  className="group flex w-full cursor-pointer items-center justify-between rounded-lg border border-border-light bg-surface-subtle p-3 transition-colors hover:bg-surface-container-low"
                >
                  <div className="flex items-center gap-3">
                    {file.type === 'pdf' ? (
                      <FileText className="h-5 w-5 text-primary" />
                    ) : (
                      <Image className="h-5 w-5 text-primary" />
                    )}
                    <span className="font-label-md text-on-surface">{file.name}</span>
                  </div>
                  <Download className="h-5 w-5 text-secondary transition-colors group-hover:text-primary" />
                </button>
              ))
            ) : (
              <p className="font-body-md text-secondary">אין קבצים מצורפים</p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
