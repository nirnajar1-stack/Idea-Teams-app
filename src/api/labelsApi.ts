import { getSupabase, isSupabaseEnabled } from '../lib/supabaseClient'
import { LABELS_STORAGE_KEY } from '../types/label'
import type { TaskLabel, TaskLabelInput } from '../types/label'

interface TaskLabelRow {
  id: string
  name: string
  color: string
  active: boolean
  created_at: string
  created_by_user_id: string | null
}

function rowToLabel(row: TaskLabelRow): TaskLabel {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    active: row.active,
    createdAt: row.created_at.slice(0, 10),
    createdByUserId: row.created_by_user_id ?? undefined,
  }
}

function readLocalLabels(): TaskLabel[] {
  try {
    const raw = localStorage.getItem(LABELS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as TaskLabel[]
    return Array.isArray(parsed) ? parsed.filter((l) => l.active !== false) : []
  } catch {
    return []
  }
}

function writeLocalLabels(labels: TaskLabel[]): void {
  localStorage.setItem(LABELS_STORAGE_KEY, JSON.stringify(labels))
}

export async function fetchTaskLabels(): Promise<TaskLabel[]> {
  if (!isSupabaseEnabled()) return readLocalLabels()

  try {
    const { data, error } = await getSupabase()
      .from('task_labels')
      .select('*')
      .eq('active', true)
      .order('name')

    if (error) throw error
    const labels = (data as TaskLabelRow[]).map(rowToLabel)
    writeLocalLabels(labels)
    return labels
  } catch (err) {
    console.warn('fetchTaskLabels cloud failed, using local cache', err)
    return readLocalLabels()
  }
}

export async function createTaskLabel(
  input: TaskLabelInput,
  actorUserId: string,
): Promise<TaskLabel> {
  const label: TaskLabel = {
    id: `lbl-${Date.now().toString(36)}`,
    name: input.name.trim(),
    color: input.color ?? '#4f5e7f',
    active: true,
    createdAt: new Date().toISOString().slice(0, 10),
    createdByUserId: actorUserId,
  }

  if (isSupabaseEnabled()) {
    const { error } = await getSupabase().from('task_labels').insert({
      id: label.id,
      name: label.name,
      color: label.color,
      active: true,
      created_by_user_id: actorUserId,
    })
    if (error) throw error
  }

  const all = [...readLocalLabels(), label]
  writeLocalLabels(all)
  return label
}

export async function updateTaskLabel(
  id: string,
  patch: Partial<Pick<TaskLabel, 'name' | 'color' | 'active'>>,
): Promise<void> {
  const local = readLocalLabels()
  const next = local.map((l) => (l.id === id ? { ...l, ...patch } : l))
  writeLocalLabels(next)

  if (isSupabaseEnabled()) {
    const { error } = await getSupabase()
      .from('task_labels')
      .update({
        ...(patch.name !== undefined ? { name: patch.name } : {}),
        ...(patch.color !== undefined ? { color: patch.color } : {}),
        ...(patch.active !== undefined ? { active: patch.active } : {}),
      })
      .eq('id', id)
    if (error) throw error
  }
}

export async function deleteTaskLabel(id: string): Promise<void> {
  await updateTaskLabel(id, { active: false })
}

export function resolveLabelNames(labelIds: string[], catalog: TaskLabel[]): string[] {
  const byId = new Map(catalog.map((l) => [l.id, l.name]))
  return labelIds.map((id) => byId.get(id) ?? id).filter(Boolean)
}

export function filterKnownLabelIds(labelIds: string[], catalog: TaskLabel[]): string[] {
  const known = new Set(catalog.map((l) => l.id))
  return labelIds.filter((id) => known.has(id))
}
