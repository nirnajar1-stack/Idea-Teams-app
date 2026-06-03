import { Mail, Lightbulb, Users } from 'lucide-react'
import { AppShell } from '../components/layout/AppShell'
import { CURRENT_USER } from '../constants/app'
import { useIdeas } from '../context/IdeasContext'
import { Avatar } from '../components/ui/Avatar'

export function ProfilePage() {
  const { ideas, stats } = useIdeas()
  const myIdeas = ideas.filter((i) => i.authorName === CURRENT_USER.name)

  return (
    <AppShell variant="main">
      <div className="mb-10 flex flex-col items-center gap-6 rounded-xl border border-border-light bg-surface-container-lowest p-8 shadow-card md:flex-row md:items-start md:text-right">
        <Avatar src={CURRENT_USER.avatarSrc} alt={CURRENT_USER.name} size="md" />
        <div className="flex-1 text-center md:text-right">
          <h1 className="mb-2 font-display text-headline-lg text-on-surface">
            {CURRENT_USER.name}
          </h1>
          <p className="mb-4 font-body-md text-secondary">{CURRENT_USER.role}</p>
          <div className="flex flex-wrap justify-center gap-4 md:justify-start">
            <span className="flex items-center gap-2 font-label-md text-secondary">
              <Mail className="h-4 w-4" />
              {CURRENT_USER.name.toLowerCase()}@ideaflow.io
            </span>
            <span className="flex items-center gap-2 font-label-md text-secondary">
              <Users className="h-4 w-4" />
              צוות FacilPay
            </span>
          </div>
        </div>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-gutter sm:grid-cols-3">
        <div className="rounded-xl border border-border-light bg-surface-container-lowest p-6 shadow-card">
          <Lightbulb className="mb-2 h-8 w-8 text-primary" />
          <p className="font-label-md text-secondary">הרעיונות שלי</p>
          <p className="font-display text-display-lg text-primary">{myIdeas.length}</p>
        </div>
        <div className="rounded-xl border border-border-light bg-surface-container-lowest p-6 shadow-card">
          <p className="font-label-md text-secondary">סך רעיונות במערכת</p>
          <p className="font-display text-display-lg text-primary">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-border-light bg-surface-container-lowest p-6 shadow-card">
          <p className="font-label-md text-secondary">בביצוע</p>
          <p className="font-display text-display-lg text-primary">
            {ideas.filter((i) => i.workflowStatus === 'in_progress').length}
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-border-light bg-surface-container-low p-6">
        <h2 className="mb-4 font-display text-headline-md text-on-surface">קהילת IdeaFlow</h2>
        <p className="font-body-md text-on-surface-variant">
          שתפו משוב, הצביעו על רעיונות חדשים והשפיעו על מפת הדרכים של FacilPay. ערוץ ה-Slack
          הייעודי פעיל 24/7 לשאלות מוצר ותיאום עם צוותי הפיתוח והבקרה.
        </p>
      </section>
    </AppShell>
  )
}
