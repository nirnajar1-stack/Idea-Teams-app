import type { BreakdownItem } from '../../lib/openTasksAnalytics'

export const OPEN_TASKS_BAR_COLORS = [
  'bg-primary',
  'bg-tertiary-fixed',
  'bg-teal-action',
  'bg-surface-container-high',
  'bg-secondary-container',
  'bg-primary-container',
] as const

export const PRIORITY_BAR_COLORS: Record<string, string> = {
  high: 'bg-error',
  medium: 'bg-tertiary-fixed',
  low: 'bg-surface-container-high',
}

export const CATEGORY_BAR_COLORS: Record<string, string> = {
  development: 'bg-primary',
  monitoring: 'bg-tertiary-fixed',
  technical: 'bg-teal-action',
}

export const AGE_BAR_COLORS: Record<string, string> = {
  '0-7': 'bg-teal-action',
  '8-30': 'bg-primary',
  '31-90': 'bg-tertiary-fixed',
  '90+': 'bg-error',
}

export function barColorForItem(
  item: BreakdownItem,
  index: number,
  palette: 'default' | 'priority' | 'category' | 'age' = 'default',
): string {
  if (palette === 'priority') return PRIORITY_BAR_COLORS[item.key] ?? OPEN_TASKS_BAR_COLORS[index % OPEN_TASKS_BAR_COLORS.length]
  if (palette === 'category') return CATEGORY_BAR_COLORS[item.key] ?? OPEN_TASKS_BAR_COLORS[index % OPEN_TASKS_BAR_COLORS.length]
  if (palette === 'age') return AGE_BAR_COLORS[item.key] ?? OPEN_TASKS_BAR_COLORS[index % OPEN_TASKS_BAR_COLORS.length]
  return OPEN_TASKS_BAR_COLORS[index % OPEN_TASKS_BAR_COLORS.length]
}

export function relativeBarWidth(count: number, maxCount: number): number {
  if (!maxCount) return 0
  return Math.max(8, Math.round((count / maxCount) * 100))
}
