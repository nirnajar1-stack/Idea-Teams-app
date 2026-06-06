import { getSupabase, isSupabaseEnabled } from '../lib/supabaseClient'
import {
  ideaPatchToRow,
  ideaRowToIdea,
  ideaToRow,
  type IdeaRow,
} from '../lib/dbMappers'
import type { Idea } from '../types/idea'

export async function fetchIdeasFromDb(appUserId?: string): Promise<Idea[]> {
  const supabase = getSupabase()

  const { data: rpcData, error: rpcError } = await supabase.rpc(
    'list_ideas_for_session',
    { p_user_id: appUserId ?? null },
  )

  if (!rpcError && rpcData) {
    return (rpcData as IdeaRow[]).map(ideaRowToIdea)
  }

  if (rpcError) {
    console.warn('list_ideas_for_session RPC failed, fallback to direct select', rpcError.message)
  }

  const { data, error } = await supabase
    .from('ideas')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data as IdeaRow[]).map(ideaRowToIdea)
}

export async function insertIdeaToDb(idea: Idea): Promise<void> {
  const { error } = await getSupabase().from('ideas').insert(ideaToRow(idea))
  if (error) throw error
}

export async function updateIdeaInDb(id: string, patch: Partial<Idea>): Promise<void> {
  const row = ideaPatchToRow(patch)
  if (Object.keys(row).length === 0) return
  const { error } = await getSupabase().from('ideas').update(row).eq('id', id)
  if (error) throw error
}

export async function deleteIdeaFromDb(id: string): Promise<void> {
  const { error } = await getSupabase().from('ideas').delete().eq('id', id)
  if (error) throw error
}

export async function upsertIdeasToDb(ideas: Idea[]): Promise<void> {
  if (ideas.length === 0) return
  const { error } = await getSupabase()
    .from('ideas')
    .upsert(ideas.map(ideaToRow), { onConflict: 'id' })
  if (error) throw error
}

export function ideasApiAvailable(): boolean {
  return isSupabaseEnabled()
}
