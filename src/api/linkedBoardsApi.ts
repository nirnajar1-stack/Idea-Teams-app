import { getSupabase, isSupabaseEnabled } from '../lib/supabaseClient'
import {
  LINKED_BOARDS_STORAGE_KEY,
  detectBoardProvider,
  normalizeBoardUrl,
  resolveViewMode,
  type LinkedBoard,
  type LinkedBoardInput,
  type LinkedBoardProvider,
  type LinkedBoardViewMode,
} from '../types/linkedBoard'

interface LinkedBoardRow {
  id: string
  title: string
  url: string
  provider: string
  view_mode: string
  description: string | null
  sort_order: number
  active: boolean
  created_at: string
  created_by_user_id: string | null
}

function rowToBoard(row: LinkedBoardRow): LinkedBoard {
  return {
    id: row.id,
    title: row.title,
    url: row.url,
    provider: row.provider as LinkedBoardProvider,
    viewMode: row.view_mode as LinkedBoardViewMode,
    description: row.description ?? undefined,
    sortOrder: row.sort_order,
    active: row.active,
    createdAt: row.created_at.slice(0, 10),
    createdByUserId: row.created_by_user_id ?? undefined,
  }
}

function readLocalBoards(): LinkedBoard[] {
  try {
    const raw = localStorage.getItem(LINKED_BOARDS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as LinkedBoard[]
    return Array.isArray(parsed) ? parsed.filter((b) => b.active !== false) : []
  } catch {
    return []
  }
}

function writeLocalBoards(boards: LinkedBoard[]): void {
  localStorage.setItem(LINKED_BOARDS_STORAGE_KEY, JSON.stringify(boards))
}

function sortBoards(boards: LinkedBoard[]): LinkedBoard[] {
  return [...boards].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title, 'he'),
  )
}

export async function fetchLinkedBoards(): Promise<LinkedBoard[]> {
  if (!isSupabaseEnabled()) return sortBoards(readLocalBoards())

  try {
    const { data, error } = await getSupabase()
      .from('app_linked_boards')
      .select('*')
      .eq('active', true)
      .order('sort_order')
      .order('title')

    if (error) throw error
    const boards = (data as LinkedBoardRow[]).map(rowToBoard)
    writeLocalBoards(boards)
    return sortBoards(boards)
  } catch (err) {
    console.warn('fetchLinkedBoards cloud failed, using local cache', err)
    return sortBoards(readLocalBoards())
  }
}

export async function createLinkedBoard(
  input: LinkedBoardInput,
  actorUserId: string,
): Promise<LinkedBoard> {
  const url = normalizeBoardUrl(input.url)
  const provider = input.provider ?? detectBoardProvider(url)
  const viewMode = resolveViewMode(provider, input.viewMode)
  const existing = readLocalBoards()
  const maxOrder = existing.reduce((m, b) => Math.max(m, b.sortOrder), -1)

  const board: LinkedBoard = {
    id: `board-${Date.now().toString(36)}`,
    title: input.title.trim(),
    url,
    provider,
    viewMode,
    description: input.description?.trim() || undefined,
    sortOrder: maxOrder + 1,
    active: true,
    createdAt: new Date().toISOString().slice(0, 10),
    createdByUserId: actorUserId,
  }

  if (isSupabaseEnabled()) {
    const { error } = await getSupabase().from('app_linked_boards').insert({
      id: board.id,
      title: board.title,
      url: board.url,
      provider: board.provider,
      view_mode: board.viewMode,
      description: board.description ?? null,
      sort_order: board.sortOrder,
      active: true,
      created_by_user_id: actorUserId,
    })
    if (error) throw error
  }

  const all = sortBoards([...existing, board])
  writeLocalBoards(all)
  return board
}

export async function updateLinkedBoard(
  id: string,
  patch: Partial<
    Pick<LinkedBoard, 'title' | 'url' | 'provider' | 'viewMode' | 'description' | 'sortOrder' | 'active'>
  >,
): Promise<void> {
  const local = readLocalBoards()
  const next = local.map((b) => {
    if (b.id !== id) return b
    const url = patch.url !== undefined ? normalizeBoardUrl(patch.url) : b.url
    const provider = patch.provider ?? (patch.url ? detectBoardProvider(url) : b.provider)
    const viewMode = resolveViewMode(
      provider,
      patch.viewMode ?? (patch.url || patch.provider ? undefined : b.viewMode),
    )
    return {
      ...b,
      ...patch,
      url,
      provider,
      viewMode,
    }
  })
  writeLocalBoards(sortBoards(next.filter((b) => b.active !== false)))

  if (isSupabaseEnabled()) {
    const payload: Record<string, unknown> = {}
    if (patch.title !== undefined) payload.title = patch.title.trim()
    if (patch.url !== undefined) payload.url = normalizeBoardUrl(patch.url)
    if (patch.provider !== undefined || patch.url !== undefined) {
      const url = patch.url !== undefined ? normalizeBoardUrl(patch.url) : undefined
      const provider =
        patch.provider ??
        (url ? detectBoardProvider(url) : undefined) ??
        local.find((b) => b.id === id)?.provider ??
        'generic'
      payload.provider = provider
      payload.view_mode = resolveViewMode(
        provider,
        patch.viewMode ?? (patch.url || patch.provider ? undefined : undefined),
      )
    } else if (patch.viewMode !== undefined) {
      const provider = local.find((b) => b.id === id)?.provider ?? 'generic'
      payload.view_mode = resolveViewMode(provider, patch.viewMode)
    }
    if (patch.description !== undefined) payload.description = patch.description?.trim() || null
    if (patch.sortOrder !== undefined) payload.sort_order = patch.sortOrder
    if (patch.active !== undefined) payload.active = patch.active

    const { error } = await getSupabase().from('app_linked_boards').update(payload).eq('id', id)
    if (error) throw error
  }
}

export async function deleteLinkedBoard(id: string): Promise<void> {
  const next = readLocalBoards().filter((b) => b.id !== id)
  writeLocalBoards(next)

  if (isSupabaseEnabled()) {
    const { error } = await getSupabase()
      .from('app_linked_boards')
      .update({ active: false })
      .eq('id', id)
    if (error) throw error
  }
}
