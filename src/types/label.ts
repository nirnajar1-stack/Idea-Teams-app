export interface TaskLabel {
  id: string
  name: string
  color: string
  active: boolean
  createdAt: string
  createdByUserId?: string
}

export interface TaskLabelInput {
  name: string
  color?: string
}

export const LABEL_COLORS = [
  '#4f5e7f',
  '#ca8a04',
  '#0d9488',
  '#7c3aed',
  '#dc2626',
  '#2563eb',
  '#64748b',
] as const

export const LABELS_STORAGE_KEY = 'ogen-task-labels-v1'
