import { MONTHLY_INTRO_VIDEO_KEY } from '../constants/app'
import type { AppUser } from '../types/user'

interface IntroVideoRecord {
  /** חודש אחרון שבו הוצג הסרטון — YYYY-MM */
  lastShownMonth: string
  /** האם המשתמש צפה לפחות פעם אחת */
  hasEverSeen: boolean
}

function currentMonthLocal(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function introVideoUserKey(user: AppUser): string {
  if (user.guestSessionId) return `guest:${user.guestSessionId}`
  return user.id
}

function readShownMap(): Record<string, IntroVideoRecord | string> {
  try {
    const raw = localStorage.getItem(MONTHLY_INTRO_VIDEO_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, IntroVideoRecord | string>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function normalizeRecord(value: IntroVideoRecord | string | undefined): IntroVideoRecord {
  if (!value) return { lastShownMonth: '', hasEverSeen: false }
  if (typeof value === 'string') {
    // תאימות לאחור — פורמט יומי ישן (YYYY-MM-DD)
    const month = value.slice(0, 7)
    return { lastShownMonth: month, hasEverSeen: true }
  }
  return {
    lastShownMonth: value.lastShownMonth ?? '',
    hasEverSeen: value.hasEverSeen ?? false,
  }
}

/** מציג סרטון פתיחה למשתמש חדש או פעם בחודש לכל משתמש */
export function shouldShowMonthlyIntroVideo(user: AppUser): boolean {
  const map = readShownMap()
  const record = normalizeRecord(map[introVideoUserKey(user)])
  const month = currentMonthLocal()

  if (!record.hasEverSeen) return true
  return record.lastShownMonth !== month
}

export function markMonthlyIntroVideoShown(user: AppUser): void {
  const map = readShownMap()
  map[introVideoUserKey(user)] = {
    lastShownMonth: currentMonthLocal(),
    hasEverSeen: true,
  }
  localStorage.setItem(MONTHLY_INTRO_VIDEO_KEY, JSON.stringify(map))
}

/** @deprecated use shouldShowMonthlyIntroVideo */
export const shouldShowDailyIntroVideo = shouldShowMonthlyIntroVideo

/** @deprecated use markMonthlyIntroVideoShown */
export const markDailyIntroVideoShown = markMonthlyIntroVideoShown

/** @deprecated use introVideoUserKey */
export const dailyIntroUserKey = introVideoUserKey
