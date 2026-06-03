import { LogOut, Mail, Lightbulb, RefreshCw, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { ROUTES } from '../constants/app'
import { useAuth } from '../context/AuthContext'
import { useIdeas } from '../context/IdeasContext'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'

export function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { stats, getIdeasByUser } = useIdeas()

  if (!user) return null

  const myIdeas = getIdeasByUser(user.id)
  const myInProgress = myIdeas.filter((i) => i.workflowStatus === 'in_progress')

  const handleLogout = () => {
    logout()
    navigate(ROUTES.login)
  }

  const handleSwitchUser = () => {
    logout()
    navigate(ROUTES.login)
  }

  return (
    <AppShell variant="main">
      <div className="mb-10 flex flex-col items-center gap-6 rounded-xl border border-border-light bg-surface-container-lowest p-8 shadow-card md:flex-row md:items-start md:text-right">
        <Avatar alt={user.name} size="md" />
        <div className="flex-1 text-center md:text-right">
          <h1 className="mb-2 font-display text-headline-lg text-on-surface">
            {user.name}
          </h1>
          <p className="mb-4 font-body-md text-secondary">{user.role}</p>
          <div className="flex flex-wrap justify-center gap-4 md:justify-start">
            <span className="flex items-center gap-2 font-label-md text-secondary">
              <Mail className="h-4 w-4" />
              {user.email}
            </span>
            <span className="flex items-center gap-2 font-label-md text-secondary">
              <Users className="h-4 w-4" />
              צוות FacilPay
            </span>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
            <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={handleSwitchUser}>
              החלפת משתמש
            </Button>
            <Button variant="ghost" icon={<LogOut className="h-4 w-4" />} onClick={handleLogout}>
              יציאה
            </Button>
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
          <p className="font-label-md text-secondary">בביצוע (שלי)</p>
          <p className="font-display text-display-lg text-primary">
            {myInProgress.length}
          </p>
        </div>
      </div>

      {myIdeas.length > 0 && (
        <section className="mb-10 rounded-xl border border-border-light bg-surface-container-lowest p-6 shadow-card">
          <h2 className="mb-4 font-display text-headline-md text-on-surface">
            רעיונות שפתחתי
          </h2>
          <ul className="space-y-3">
            {myIdeas.map((idea) => (
              <li key={idea.id}>
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.ideaDetail(idea.id))}
                  className="w-full rounded-lg border border-border-light bg-surface-subtle p-4 text-right transition-colors hover:bg-surface-container-low"
                >
                  <span className="font-label-md text-on-surface">{idea.title}</span>
                  <span className="mt-1 block font-label-sm text-secondary">
                    #{idea.externalId}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

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
