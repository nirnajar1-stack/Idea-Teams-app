const DRAG_MIME = 'application/x-ogen-idea-id'

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

export function timelineDayHeading(dateKey: string): string {
  const { weekday, dayMonth, isToday, isTomorrow } = formatTimelineDayLabel(dateKey)
  if (isToday) return `היום · ${dayMonth}`
  if (isTomorrow) return `מחר · ${dayMonth}`
  return `${weekday} · ${dayMonth}`
}
