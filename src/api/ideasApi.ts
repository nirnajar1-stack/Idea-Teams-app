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

function isRpcMissing(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false
  return (
    error.code === 'PGRST202' ||
    (error.message ?? '').includes('insert_idea_for_session') ||
    (error.message ?? '').includes('update_idea_for_session') ||
    (error.message ?? '').includes('delete_idea_for_session')
  )
}

export async function insertIdeaToDb(idea: Idea, appUserId?: string): Promise<void> {
  const row = ideaToRow(idea)
  const userId = appUserId ?? idea.createdByUserId

  const { error: rpcError } = await getSupabase().rpc('insert_idea_for_session', {
    p_user_id: userId,
    p_idea: row,
  })

  if (!rpcError) return
  if (!isRpcMissing(rpcError)) throw rpcError

  const { error } = await getSupabase().from('ideas').insert(row)
  if (error) throw error
}

export async function updateIdeaInDb(
  id: string,
  patch: Partial<Idea>,
  appUserId?: string,
): Promise<void> {
  const row = ideaPatchToRow(patch)
  if (Object.keys(row).length === 0) return

  if (appUserId) {
    const { error: rpcError } = await getSupabase().rpc('update_idea_for_session', {
      p_user_id: appUserId,
      p_idea_id: id,
      p_patch: row,
    })
    if (!rpcError) return
    if (!isRpcMissing(rpcError)) throw rpcError
  }

  const { error } = await getSupabase().from('ideas').update(row).eq('id', id)
  if (error) throw error
}

export async function deleteIdeaFromDb(id: string, appUserId?: string): Promise<void> {
  if (appUserId) {
    const { error: rpcError } = await getSupabase().rpc('delete_idea_for_session', {
      p_user_id: appUserId,
      p_idea_id: id,
    })
    if (!rpcError) return
    if (!isRpcMissing(rpcError)) throw rpcError
  }

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
