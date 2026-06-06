import type { StoredUser } from '../types/user'

const MENTION_RE = /@([\w\u0590-\u05FF.-]+)/g

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
