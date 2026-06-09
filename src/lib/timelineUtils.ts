const DRAG_MIME = 'application/x-ogen-idea-id'

export type TimelineViewMode = 'week' | 'month'

export const TIMELINE_WEEKDAY_HEADERS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'] as const

export function timelineDragMime(): string {
  return DRAG_MIME
}

export function toDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayDateKey(): string {
  return toDateKey(new Date())
}

/** יום ראשון של השבוע (לוח עברי/ישראלי) */
export function startOfWeek(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - d.getDay())
  return d
}

export function buildWeekDays(weekOffset: number): string[] {
  const start = startOfWeek(new Date())
  start.setDate(start.getDate() + weekOffset * 7)
  const days: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    days.push(toDateKey(d))
  }
  return days
}

export function weekRangeLabel(weekOffset: number): string {
  const days = buildWeekDays(weekOffset)
  const first = new Date(`${days[0]}T12:00:00`)
  const last = new Date(`${days[6]}T12:00:00`)
  const fmt = (d: Date) =>
    d.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })
  return `${fmt(first)} – ${fmt(last)}`
}

export interface MonthGrid {
  weeks: (string | null)[][]
  label: string
  daysInMonth: string[]
}

export function buildMonthGrid(monthOffset: number): MonthGrid {
  const anchor = new Date()
  anchor.setDate(1)
  anchor.setMonth(anchor.getMonth() + monthOffset)

  const year = anchor.getFullYear()
  const month = anchor.getMonth()
  const label = anchor.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })
  const lastDay = new Date(year, month + 1, 0).getDate()

  const weeks: (string | null)[][] = []
  let currentWeek: (string | null)[] = []

  for (let i = 0; i < anchor.getDay(); i++) {
    currentWeek.push(null)
  }

  const daysInMonth: string[] = []
  for (let day = 1; day <= lastDay; day++) {
    const key = toDateKey(new Date(year, month, day))
    daysInMonth.push(key)
    currentWeek.push(key)
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null)
    weeks.push(currentWeek)
  }

  return { weeks, label, daysInMonth }
}

/** @deprecated השתמשו ב-buildWeekDays */
export function buildTimelineDays(startOffset: number, count: number): string[] {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() + startOffset)
  const days: string[] = []
  for (let i = 0; i < count; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    days.push(toDateKey(d))
  }
  return days
}

export interface TimelineDayLabel {
  weekday: string
  dayMonth: string
  isToday: boolean
  isTomorrow: boolean
}

export function formatTimelineDayLabel(dateKey: string): TimelineDayLabel {
  const d = new Date(`${dateKey}T12:00:00`)
  const today = todayDateKey()
  const tomorrow = toDateKey(new Date(Date.now() + 86_400_000))
  return {
    weekday: d.toLocaleDateString('he-IL', { weekday: 'long' }),
    dayMonth: d.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' }),
    isToday: dateKey === today,
    isTomorrow: dateKey === tomorrow,
  }
}

export function timelineDayHeading(dateKey: string, compact = false): string {
  const { weekday, dayMonth, isToday, isTomorrow } = formatTimelineDayLabel(dateKey)
  if (compact) {
    const dayNum = new Date(`${dateKey}T12:00:00`).getDate()
    if (isToday) return `היום (${dayNum})`
    return String(dayNum)
  }
  if (isToday) return `היום · ${dayMonth}`
  if (isTomorrow) return `מחר · ${dayMonth}`
  return `${weekday} · ${dayMonth}`
}

export function dayOfMonth(dateKey: string): number {
  return new Date(`${dateKey}T12:00:00`).getDate()
}
