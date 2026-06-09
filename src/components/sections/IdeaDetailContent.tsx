import {
  Calendar,
  CheckCircle,
  Download,
  FileText,
  Image,
  AlertCircle,
} from 'lucide-react'
import {
  formatIdeaDateLong,
  PRIORITY_LABELS,
  WORKFLOW_LABELS,
} from '../../lib/ideaUtils'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/app'
import { isContainerIdea, isSubIdea } from '../../lib/ideaUtils'
import type { Idea, IdeaPriority } from '../../types/idea'
import { Badge } from '../ui/Badge'
import { ContainerBadge } from '../ui/ContainerBadge'
import { InboxBadge } from '../ui/InboxBadge'
import { IdeaVisibilityBadge } from '../ui/IdeaVisibilityBadge'
import { IdeaSourceBadge } from '../ui/IdeaSourceBadge'
import { TargetDateBadge } from '../ui/TargetDateBadge'
import { IdeaChatSection } from '../chat/IdeaChatSection'
import { SubIdeasSection } from './SubIdeasSection'
import { AuditLogSection } from './AuditLogSection'
import { AttachmentUpload } from './AttachmentUpload'
import { GoalsTagsEditor } from './GoalsTagsEditor'

const priorityVariant: Record<
  IdeaPriority,
  'priority-high' | 'priority-medium' | 'priority-low'
> = {
  high: 'priority-high',
  medium: 'priority-medium',
  low: 'priority-low',
}

export interface IdeaDetailContentProps {
  idea: Idea
  parent?: Idea
  subIdeas?: Idea[]
  canAddSub?: boolean
  canEdit?: boolean
  onUpdate?: (patch: Partial<Idea>) => void
}

export function IdeaDetailContent({
  idea,
  parent,
  subIdeas = [],
  canAddSub = false,
  canEdit = false,
  onUpdate,
}: IdeaDetailContentProps) {
  return (
    <div className="space-y-8 lg:col-span-8">
      <section className="glass-card p-6 md:p-8">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <Badge
            variant={priorityVariant[idea.priority]}
            icon={<AlertCircle className="h-3.5 w-3.5" />}
          >
            עדיפות {PRIORITY_LABELS[idea.priority]}
          </Badge>
          <Badge variant="success" icon={<CheckCircle className="h-3.5 w-3.5" />}>
            {WORKFLOW_LABELS[idea.workflowStatus]}
          </Badge>
          {isContainerIdea(idea) && (
            <ContainerBadge subCount={subIdeas.length} />
          )}
          {isSubIdea(idea) && (
            <Badge variant="surface">תת-בקשה/רעיון</Badge>
          )}
          {idea.sendToMaybeInbox && <InboxBadge />}
          <IdeaSourceBadge source={idea.ideaSource} />
          <IdeaVisibilityBadge visibility={idea.visibility ?? 'team'} />
          <TargetDateBadge targetStartDate={idea.targetStartDate} />
          <span className="mr-auto font-label-sm text-secondary">
            ID: #{idea.externalId}
          </span>
        </div>
        {parent && (
          <Link
            to={ROUTES.ideaDetail(parent.id)}
            className="mb-3 inline-flex font-label-md text-primary hover:underline"
          >
            ← חלק ממארז: {parent.title}
          </Link>
        )}
        <h1 className="mb-4 font-display text-headline-lg-mobile text-on-surface md:text-headline-lg">
          {idea.title}
        </h1>
        <p className="mb-8 font-body-lg leading-relaxed text-on-surface-variant">
          {idea.description}
        </p>
        <div className="grid grid-cols-1 gap-6 border border-border-light bg-surface-subtle p-6 md:grid-cols-2">
          <div>
            <h3 className="mb-2 font-label-md uppercase tracking-wider text-secondary">
              יוצר הבקשה/רעיון
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
              מקור הבקשה/רעיון
            </h3>
            <IdeaSourceBadge source={idea.ideaSource} />
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
          <div className="md:col-span-2">
            <h3 className="mb-2 font-label-md uppercase tracking-wider text-secondary">
              תאריך יעד להתחלה
            </h3>
            <TargetDateBadge targetStartDate={idea.targetStartDate} />
          </div>
        </div>
      </section>

      {isContainerIdea(idea) && (
        <SubIdeasSection parent={idea} subIdeas={subIdeas} canAdd={canAddSub} />
      )}

      <section className="glass-card-hover p-6">
        <GoalsTagsEditor
          goals={idea.goals}
          tags={idea.tags}
          disabled={!canEdit}
          onChange={(patch) => onUpdate?.(patch)}
        />
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="glass-card-hover p-6 md:col-span-2">
          <div className="mb-4 flex items-center gap-3 text-primary">
            <FileText className="h-6 w-6" />
            <h2 className="font-display text-headline-md text-on-surface">קבצים מצורפים</h2>
          </div>
          <div className="space-y-3">
            {idea.attachments.length > 0 ? (
              idea.attachments.map((file) => (
                file.url ? (
                  <a
                    key={file.id}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex w-full items-center justify-between border border-border-light bg-surface-subtle p-3 transition-colors hover:bg-surface-container-low"
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
                  </a>
                ) : (
                  <div
                    key={file.id}
                    className="flex w-full items-center justify-between border border-border-light bg-surface-subtle p-3"
                  >
                    <div className="flex items-center gap-3">
                      {file.type === 'pdf' ? (
                        <FileText className="h-5 w-5 text-primary" />
                      ) : (
                        <Image className="h-5 w-5 text-primary" />
                      )}
                      <span className="font-label-md text-on-surface">{file.name}</span>
                    </div>
                  </div>
                )
              ))
            ) : (
              <p className="font-body-md text-secondary">אין קבצים מצורפים</p>
            )}
            {canEdit && onUpdate && (
              <AttachmentUpload
                ideaId={idea.id}
                disabled={!canEdit}
                onUploaded={(att) =>
                  onUpdate({ attachments: [...idea.attachments, att] })
                }
              />
            )}
          </div>
        </div>
      </section>

      <IdeaChatSection idea={idea} />
      <AuditLogSection entityType="idea" entityId={idea.id} />
    </div>
  )
}
