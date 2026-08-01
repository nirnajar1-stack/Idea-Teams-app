import { CalendarRange, LogOut, Mail, Lightbulb, RefreshCw, UserCog, Bell, Users, Tag, BarChart3 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { AppShell } from '../components/layout/AppShell'
import { APP_NAME_FULL, ROUTES } from '../constants/app'
import { useAuth } from '../context/AuthContext'
import { useIdeas } from '../context/IdeasContext'
import { usePreferences } from '../context/PreferencesContext'
import { canManageUsers, isMaster } from '../lib/permissions'
import { ACCESS_LEVEL_LABELS } from '../types/user'
import { DEFAULT_USER_PREFERENCES, type UserPreferences } from '../types/preferences'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'

export function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { stats, getIdeasByUser } = useIdeas()
  const { prefs, updatePrefs, ready: prefsReady } = usePreferences()
  const [savingPrefs, setSavingPrefs] = useState(false)

  if (!user) return null

  const myIdeas = getIdeasByUser(user.id)
  const myInProgress = myIdeas.filter((i) => i.workflowStatus === 'in_progress')
  const isGuest = user.accessLevel === 'guest'

  const handleLogout = () => {
    logout()
    navigate(ROUTES.login)
  }

  const togglePref = async (key: keyof Omit<UserPreferences, 'userId'>) => {
    if (!prefs) return
    setSavingPrefs(true)
    try {
      await updatePrefs({ [key]: !prefs[key] })
      toast.success('העדפות נשמרו')
    } catch {
      toast.error('שמירת העדפות נכשלה')
    } finally {
      setSavingPrefs(false)
    }
  }

  const currentPrefs = prefs ?? { userId: user.id, ...DEFAULT_USER_PREFERENCES }

  const handleSwitchUser = () => {
    logout()
    navigate(ROUTES.login)
  }

  return (
    <AppShell variant="main">
      <div className="mb-10 flex flex-col items-center gap-6 border border-border-light bg-surface-container-lowest p-8 md:flex-row md:items-start md:text-right">
        <Avatar alt={user.name} size="md" />
        <div className="flex-1 text-center md:text-right">
          <h1 className="mb-2 font-display text-headline-lg text-on-surface">
            {user.name}
          </h1>
          <p className="mb-1 font-body-md text-secondary">{user.jobTitle}</p>
          <p className="mb-4 font-label-sm text-primary">
            רמת גישה: {ACCESS_LEVEL_LABELS[user.accessLevel]}
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:justify-start">
            <span className="flex items-center gap-2 font-label-md text-secondary">
              <Mail className="h-4 w-4" />
              {user.email}
            </span>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
            {canManageUsers(user) && (
              <Button
                icon={<UserCog className="h-4 w-4" />}
                onClick={() => navigate(ROUTES.users)}
              >
                משתמשים
              </Button>
            )}
            {canManageUsers(user) && (
              <Button
                variant="secondary"
                icon={<Users className="h-4 w-4" />}
                onClick={() => navigate(ROUTES.groups)}
              >
                קבוצות
              </Button>
            )}
            {canManageUsers(user) && (
              <Button
                variant="secondary"
                icon={<Mail className="h-4 w-4" />}
                onClick={() => navigate(ROUTES.emailLog)}
              >
                יומן מיילים
              </Button>
            )}
            {isMaster(user) && (
              <Button
                variant="secondary"
                icon={<Tag className="h-4 w-4" />}
                onClick={() => navigate(ROUTES.labels)}
              >
                לייבלים
              </Button>
            )}
            {isMaster(user) && (
              <Button
                variant="secondary"
                icon={<CalendarRange className="h-4 w-4" />}
                onClick={() => navigate(ROUTES.timeline)}
              >
                טיימליין
              </Button>
            )}
            <Button
              variant="secondary"
              icon={<BarChart3 className="h-4 w-4" />}
              onClick={() => navigate(ROUTES.openTasksDashboard)}
            >
              משימות פתוחות
            </Button>
            <Button
              variant="secondary"
              icon={<RefreshCw className="h-4 w-4" />}
              onClick={handleSwitchUser}
            >
              החלפת משתמש
            </Button>
            <Button
              variant="ghost"
              icon={<LogOut className="h-4 w-4" />}
              onClick={handleLogout}
            >
              יציאה
            </Button>
          </div>
        </div>
      </div>

      {isGuest && (
        <p className="mb-8 border border-inbox/20 bg-inbox-soft/50 p-4 font-body-md text-on-surface-variant">
          כ{ACCESS_LEVEL_LABELS.guest} אתם רואים רק בקשות/רעיונות שנוצרו בכניסה הנוכחית. לאחר
          יציאה הסשן מתאפס.
        </p>
      )}

      <div className="mb-10 grid grid-cols-1 gap-gutter sm:grid-cols-3">
        <div className="border border-border-light bg-surface-container-lowest p-6">
          <Lightbulb className="mb-2 h-8 w-8 text-primary" />
          <p className="font-label-md text-secondary">הבקשות/רעיונות שלי</p>
          <p className="font-display text-display-lg text-primary">{myIdeas.length}</p>
        </div>
        <div className="border border-border-light bg-surface-container-lowest p-6">
          <p className="font-label-md text-secondary">בקשות/רעיונות גלויים לי</p>
          <p className="font-display text-display-lg text-primary">{stats.total}</p>
        </div>
        <div className="border border-border-light bg-surface-container-lowest p-6">
          <p className="font-label-md text-secondary">בביצוע (שלי)</p>
          <p className="font-display text-display-lg text-primary">
            {myInProgress.length}
          </p>
        </div>
      </div>

      <section className="mb-10 border border-border-light bg-surface-container-lowest p-6">
        <div className="mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h2 className="font-display text-headline-md text-on-surface">העדפות התראות</h2>
        </div>
        {!prefsReady ? (
          <p className="font-body-md text-secondary">טוען העדפות...</p>
        ) : (
          <ul className="space-y-3">
            {(
              [
                ['notifyIdeaChat', 'התראות צ\'אט בקשה/רעיון'],
                ['notifyGeneralMentions', 'תיוגים בצ\'אט כללי'],
                ['notifyReplies', 'תגובות ישירות'],
                ['notifyTargetDate', 'תזכורות תאריך יעד'],
                ['notifyEmailCompleted', 'מייל כשבקשה/רעיון הושלם'],
              ] as const
            ).map(([key, label]) => (
              <li key={key} className="flex items-center justify-between gap-4">
                <span className="font-body-md text-on-surface">{label}</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={currentPrefs[key]}
                  disabled={savingPrefs}
                  onClick={() => void togglePref(key)}
                  className={`relative h-7 w-12 rounded-full transition-colors ${currentPrefs[key] ? 'bg-primary' : 'bg-surface-container-high'}`}
                >
                  <span
                    className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${currentPrefs[key] ? 'right-0.5' : 'right-5'}`}
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {myIdeas.length > 0 && (
        <section className="mb-10 border border-border-light bg-surface-container-lowest p-6">
          <h2 className="mb-4 font-display text-headline-md text-on-surface">
            בקשות/רעיונות שפתחתי
          </h2>
          <ul className="space-y-3">
            {myIdeas.map((idea) => (
              <li key={idea.id}>
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.ideaDetail(idea.id))}
                  className="w-full border border-border-light bg-surface-subtle p-4 text-right transition-colors hover:bg-surface-container-low"
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

      <section className="border border-border-light bg-surface-container-low p-6">
        <h2 className="mb-4 font-display text-headline-md text-on-surface">קהילת {APP_NAME_FULL}</h2>
        <p className="font-body-md text-on-surface-variant">
          שתפו משוב, הצביעו על בקשות/רעיונות חדשים והשפיעו על מפת הדרכים. ערוץ Slack ייעודי
          פעיל לשאלות מוצר ותיאום עם צוותי הפיתוח והבקרה.
        </p>
      </section>
    </AppShell>
  )
}
