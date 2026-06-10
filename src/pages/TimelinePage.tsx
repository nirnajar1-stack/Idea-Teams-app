import { CalendarRange } from 'lucide-react'
import { toast } from 'sonner'
import { AppShell } from '../components/layout/AppShell'
import { TimelineBoard } from '../components/timeline/TimelineBoard'
import { useIdeas } from '../context/IdeasContext'

export function TimelinePage() {
  const { visibleIdeas, scheduleIdeaOnTimeline, markRoutineCheckDone, setCheckCadence } =
    useIdeas()

  const handleSchedule = async (ideaId: string, plannedDate: string | null) => {
    const ok = await scheduleIdeaOnTimeline(ideaId, plannedDate)
    if (ok) {
      toast.success(plannedDate ? 'הבקשה/רעיון תוכנן ליום שנבחר' : 'הוסר מהתכנון')
    } else {
      toast.error('לא ניתן לעדכן את התאריך')
    }
  }

  return (
    <AppShell variant="main">
      <header className="mb-8 animate-fade-up">
        <span className="section-eyebrow mb-4 border-primary/20 bg-primary/5 text-primary">
          <CalendarRange className="h-3.5 w-3.5" />
          תכנון מאסטר
        </span>
        <h1 className="mb-2 font-display text-headline-lg text-on-surface">טיימליין</h1>
        <p className="max-w-xl font-body-md text-secondary">
          גרור משימות לימים בלוח, למשימות צפות, או החזר ללא מתוכנן.
        </p>
      </header>

      <TimelineBoard
        ideas={visibleIdeas}
        onSchedule={handleSchedule}
        onMarkRoutineCheck={async (ideaId) => {
          const ok = await markRoutineCheckDone(ideaId)
          if (ok) toast.success('סומן כנבדק היום')
          else toast.error('לא ניתן לעדכן')
        }}
        onAddToFloating={async (ideaId) => {
          const ok = await setCheckCadence(ideaId, 'daily')
          if (ok) toast.success('הועבר למשימות צפות (בדיקה יומית)')
          else toast.error('לא ניתן להעביר')
          return ok
        }}
        onRemoveFromFloating={async (ideaId) => {
          const ok = await setCheckCadence(ideaId, null)
          if (ok) toast.success('הוחזר ללא מתוכנן')
          else toast.error('לא ניתן להחזיר')
          return ok
        }}
      />
    </AppShell>
  )
}
