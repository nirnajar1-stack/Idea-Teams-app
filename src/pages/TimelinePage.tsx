import { CalendarRange } from 'lucide-react'
import { toast } from 'sonner'
import { AppShell } from '../components/layout/AppShell'
import { TimelineBoard } from '../components/timeline/TimelineBoard'
import { useIdeas } from '../context/IdeasContext'

export function TimelinePage() {
  const { visibleIdeas, scheduleIdeaOnTimeline } = useIdeas()

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
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <CalendarRange className="h-8 w-8 text-primary" />
          <h1 className="font-display text-headline-lg text-on-surface">טיימליין תכנון</h1>
        </div>
        <p className="max-w-2xl font-body-md text-secondary">
          תכנון שבועי או חודשי — גרור בקשות/רעיונות לימים הרצויים. רק משתמשי מאסטר רואים
          מסך זה.
        </p>
      </div>

      <TimelineBoard ideas={visibleIdeas} onSchedule={handleSchedule} />
    </AppShell>
  )
}
