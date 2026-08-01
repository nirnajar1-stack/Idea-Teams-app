export const LINKED_BOARDS_STORAGE_KEY = 'ogen-linked-boards-v1'

export type LinkedBoardProvider = 'notion' | 'powerbi' | 'excel' | 'generic'
export type LinkedBoardViewMode = 'iframe' | 'link' | 'popup'

export interface LinkedBoard {
  id: string
  title: string
  url: string
  provider: LinkedBoardProvider
  viewMode: LinkedBoardViewMode
  description?: string
  sortOrder: number
  active: boolean
  createdAt: string
  createdByUserId?: string
}

export interface LinkedBoardInput {
  title: string
  url: string
  provider?: LinkedBoardProvider
  viewMode?: LinkedBoardViewMode
  description?: string
}

export const LINKED_BOARD_PROVIDER_LABELS: Record<LinkedBoardProvider, string> = {
  notion: 'Notion',
  powerbi: 'Power BI',
  excel: 'Excel / Sheets',
  generic: 'אתר אחר',
}

/** מזהה ספק לפי כתובת */
export function detectBoardProvider(url: string): LinkedBoardProvider {
  const lower = url.toLowerCase()
  if (
    lower.includes('notion.so') ||
    lower.includes('notion.site') ||
    lower.includes('notion.com')
  ) {
    return 'notion'
  }
  if (lower.includes('powerbi.com') || lower.includes('app.powerbi.com')) return 'powerbi'
  if (
    lower.includes('docs.google.com/spreadsheets') ||
    lower.includes('office.com') ||
    lower.includes('excel.office') ||
    lower.includes('onedrive')
  ) {
    return 'excel'
  }
  return 'generic'
}

/**
 * Notion חוסם iframe — ברירת מחדל: חלון קופץ.
 * Power BI תומך בהטמעה; שאר האתרים — קישור חיצוני.
 */
export function defaultViewModeForProvider(
  provider: LinkedBoardProvider,
): LinkedBoardViewMode {
  if (provider === 'powerbi') return 'iframe'
  if (provider === 'notion') return 'popup'
  return 'link'
}

/** Notion: רק popup או link (לא iframe) */
export function resolveViewMode(
  provider: LinkedBoardProvider,
  requested?: LinkedBoardViewMode,
): LinkedBoardViewMode {
  if (provider === 'notion') {
    if (requested === 'link') return 'link'
    return 'popup'
  }
  return requested ?? defaultViewModeForProvider(provider)
}

export function providerBlocksIframe(provider: LinkedBoardProvider): boolean {
  return provider === 'notion'
}

export const LINKED_BOARD_VIEW_MODE_LABELS: Record<LinkedBoardViewMode, string> = {
  iframe: 'הטמעה באפליקציה',
  popup: 'חלון קופץ',
  link: 'טאב חדש',
}

export function normalizeBoardUrl(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

export function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}
