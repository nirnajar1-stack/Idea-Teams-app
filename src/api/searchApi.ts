import { getSupabase, isSupabaseEnabled } from '../lib/supabaseClient'
import { chatRowToMessage, type ChatMessageRow } from '../lib/chatMappers'
import { ideaRowToIdea, type IdeaRow } from '../lib/dbMappers'
import type { GlobalSearchResults } from '../types/search'

export async function searchGlobal(query: string, limit = 20): Promise<GlobalSearchResults> {
  const q = query.trim()
  if (!q || !isSupabaseEnabled()) {
    return { ideas: [], chat: [] }
  }

  const pattern = `%${q}%`

  const [ideasRes, chatRes] = await Promise.all([
    getSupabase()
      .from('ideas')
      .select('*')
      .or(`title.ilike.${pattern},description.ilike.${pattern},external_id.ilike.${pattern}`)
      .limit(limit),
    getSupabase()
      .from('chat_messages')
      .select('*')
      .is('deleted_at', null)
      .ilike('body', pattern)
      .order('created_at', { ascending: false })
      .limit(limit),
  ])

  if (ideasRes.error) throw ideasRes.error
  if (chatRes.error) throw chatRes.error

  const ideas = (ideasRes.data as IdeaRow[]).map((row) => {
    const idea = ideaRowToIdea(row)
    const snippet =
      idea.description.length > 120
        ? `${idea.description.slice(0, 120)}…`
        : idea.description
    return { kind: 'idea' as const, idea, snippet }
  })

  const ideaIds = [...new Set((chatRes.data as ChatMessageRow[]).map((m) => m.idea_id).filter(Boolean))]
  let ideaTitles: Record<string, string> = {}
  if (ideaIds.length > 0) {
    const { data: ideaRows } = await getSupabase()
      .from('ideas')
      .select('id, title')
      .in('id', ideaIds as string[])
    if (ideaRows) {
      ideaTitles = Object.fromEntries(ideaRows.map((r: { id: string; title: string }) => [r.id, r.title]))
    }
  }

  const chat = (chatRes.data as ChatMessageRow[]).map((row) => ({
    kind: 'chat' as const,
    message: chatRowToMessage(row),
    ideaTitle: row.idea_id ? ideaTitles[row.idea_id] : undefined,
  }))

  return { ideas, chat }
}

export function searchIdeasLocal(
  ideas: import('../types/idea').Idea[],
  query: string,
): GlobalSearchResults['ideas'] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return ideas
    .filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.externalId.toLowerCase().includes(q),
    )
    .slice(0, 20)
    .map((idea) => ({
      kind: 'idea' as const,
      idea,
      snippet:
        idea.description.length > 120
          ? `${idea.description.slice(0, 120)}…`
          : idea.description,
    }))
}
