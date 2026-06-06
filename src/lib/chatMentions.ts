import type { StoredUser } from '../types/user'

const MENTION_RE = /@([\w\u0590-\u05FF.-]+)/g
const MENTION_CARET_RE = /@([\w\u0590-\u05FF.-]*)$/

export interface MentionCaretState {
  query: string
  startIndex: number
}

/** מצב תיוג פעיל לפי מיקום הסמן בשדה הקלט */
export function getMentionCaretState(
  text: string,
  caretIndex: number,
): MentionCaretState | null {
  const before = text.slice(0, caretIndex)
  const match = before.match(MENTION_CARET_RE)
  if (!match || match.index === undefined) return null
  return {
    query: match[1] ?? '',
    startIndex: match.index,
  }
}

/** משתמשים פעילים לתיוג (ללא אורח וללא השולח) */
export function listMentionableUsers(
  users: StoredUser[],
  senderId: string,
): StoredUser[] {
  return users.filter((u) => u.active && u.id !== 'guest' && u.id !== senderId)
}

/** סינון לפי מה שהוקלד אחרי @ */
export function filterMentionCandidates(
  users: StoredUser[],
  senderId: string,
  query: string,
): StoredUser[] {
  const q = query.trim().toLowerCase()
  const base = listMentionableUsers(users, senderId)
  if (!q) return base
  return base.filter(
    (u) =>
      u.username.toLowerCase().includes(q) ||
      u.name.toLowerCase().includes(q) ||
      u.name.split(/\s+/).some((part) => part.toLowerCase().startsWith(q)),
  )
}

export function mentionDisplayLabel(user: StoredUser): string {
  return user.name
}

export function mentionInsertToken(user: StoredUser): string {
  return `@${user.name} `
}

/** מזהה משתמשים לפי @username או @שם (עברית) */
export function parseMentionedUserIds(
  body: string,
  users: StoredUser[],
  senderId: string,
): string[] {
  const found = new Set<string>()
  const lowerBody = body.toLowerCase()

  for (const match of body.matchAll(MENTION_RE)) {
    const token = match[1]?.trim()
    if (!token) continue
    const tokenLower = token.toLowerCase()

    for (const u of users) {
      if (u.id === senderId || u.id === 'guest') continue
      if (
        u.username.toLowerCase() === tokenLower ||
        u.name.toLowerCase() === tokenLower ||
        u.name.split(/\s+/).some((part) => part.toLowerCase() === tokenLower)
      ) {
        found.add(u.id)
      }
    }
  }

  // גיבוי: התאמה חלקית לשם בעברית
  for (const u of users) {
    if (u.id === senderId || u.id === 'guest') continue
    if (lowerBody.includes(`@${u.username.toLowerCase()}`)) found.add(u.id)
    if (lowerBody.includes(`@${u.name.toLowerCase()}`)) found.add(u.id)
  }

  return [...found]
}

export function splitBodyMentions(body: string): { text: string; mention: boolean }[] {
  const segments: { text: string; mention: boolean }[] = []
  let last = 0
  for (const match of body.matchAll(MENTION_RE)) {
    const idx = match.index ?? 0
    if (idx > last) segments.push({ text: body.slice(last, idx), mention: false })
    segments.push({ text: match[0], mention: true })
    last = idx + match[0].length
  }
  if (last < body.length) segments.push({ text: body.slice(last), mention: false })
  return segments.length > 0 ? segments : [{ text: body, mention: false }]
}
