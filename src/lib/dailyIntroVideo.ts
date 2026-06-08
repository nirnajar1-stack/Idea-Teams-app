import { DAILY_INTRO_VIDEO_KEY } from '../constants/app'
import type { AppUser } from '../types/user'

function todayLocal(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function dailyIntroUserKey(user: AppUser): string {
  if (user.guestSessionId) return `guest:${user.guestSessionId}`
  return user.id
}

function readShownMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem(DAILY_INTRO_VIDEO_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, string>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function shouldShowDailyIntroVideo(user: AppUser): boolean {
  const map = readShownMap()
  return map[dailyIntroUserKey(user)] !== todayLocal()
}

export function markDailyIntroVideoShown(user: AppUser): void {
  const map = readShownMap()
  map[dailyIntroUserKey(user)] = todayLocal()
  localStorage.setItem(DAILY_INTRO_VIDEO_KEY, JSON.stringify(map))
}
