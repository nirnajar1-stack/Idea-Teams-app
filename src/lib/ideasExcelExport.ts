import * as XLSX from 'xlsx'
import type { Idea, IdeaFilters, IdeaSortOption } from '../types/idea'
import { IDEA_SOURCES } from '../types/idea'
import {
  CATEGORY_LABELS,
  formatIdeaDate,
  IDEA_KIND_LABELS,
  IDEA_SOURCE_LABELS,
  IDEA_SORT_LABELS,
  PRIORITY_LABELS,
  sortIdeas,
  WORKFLOW_LABELS,
} from './ideaUtils'
import { IDEA_VISIBILITY_LABELS } from './ideaVisibility'

export type IdeasExportSlice =
  | 'active'
  | 'completed'
  | 'inbox'
  | 'development'
  | 'monitoring'
  | 'all'

export type IdeasExportLayout = 'single' | 'per_slice'

export interface IdeasExportConfig {
  filters: Omit<IdeaFilters, 'workflow' | 'pipeline'>
  slices: IdeasExportSlice[]
  layout: IdeasExportLayout
  sort: IdeaSortOption
  includeSubIdeas: boolean
  dateFrom?: string
  dateTo?: string
}

export const EXPORT_SLICE_LABELS: Record<IdeasExportSlice, string> = {
  active: 'פעילים',
  completed: 'הושלמו',
  inbox: 'Inbox',
  development: 'פיתוח',
  monitoring: 'בקרה',
  all: 'הכל',
}

const EXPORT_HEADERS = [
  'מזהה',
  'מזהה חיצוני',
  'כותרת',
  'תיאור',
  'קטגוריה',
  'מקור',
  'מחלקה',
  'חשיבות',
  'סטטוס',
  'תאריך פתיחה',
  'יעד התחלה',
  'תאריך תכנון',
  'פותח',
  'תפקיד פותח',
  'מוקצה',
  'נראות',
  'סוג',
  'התקדמות %',
  'שלב התקדמות',
  'Inbox',
  'תגיות',
  'יעדים',
  'מזהה אב',
] as const

function inDateRange(idea: Idea, from?: string, to?: string): boolean {
  const day = idea.createdAt.slice(0, 10)
  if (from && day < from) return false
  if (to && day > to) return false
  return true
}

function matchesBaseFilters(idea: Idea, filters: IdeasExportConfig['filters']): boolean {
  const query = filters.search.trim().toLowerCase()
  const sources = filters.sources ?? IDEA_SOURCES

  if (
    filters.categories.length > 0 &&
    filters.categories.length < 2 &&
    !filters.categories.includes(idea.category)
  ) {
    return false
  }
  if (
    sources.length > 0 &&
    sources.length < IDEA_SOURCES.length &&
    !sources.includes(idea.ideaSource)
  ) {
    return false
  }
  if (filters.priority && idea.priority !== filters.priority) return false
  if (
    filters.onlyMine &&
    filters.currentUserId &&
    idea.createdByUserId !== filters.currentUserId
  ) {
    return false
  }
  if (!query) return true

  return (
    idea.title.toLowerCase().includes(query) ||
    idea.description.toLowerCase().includes(query) ||
    idea.department.toLowerCase().includes(query) ||
    idea.authorName.toLowerCase().includes(query) ||
    IDEA_SOURCE_LABELS[idea.ideaSource].toLowerCase().includes(query) ||
    idea.externalId.toLowerCase().includes(query)
  )
}

function filterForExport(ideas: Idea[], config: IdeasExportConfig): Idea[] {
  const { filters, includeSubIdeas, dateFrom, dateTo } = config

  return ideas.filter((idea) => {
    if (!includeSubIdeas && idea.parentId) return false
    if (!inDateRange(idea, dateFrom, dateTo)) return false
    return matchesBaseFilters(idea, filters)
  })
}

function matchesSlice(idea: Idea, slice: IdeasExportSlice): boolean {
  switch (slice) {
    case 'active':
      return !idea.sendToMaybeInbox && idea.workflowStatus !== 'completed'
    case 'completed':
      return idea.workflowStatus === 'completed'
    case 'inbox':
      return idea.sendToMaybeInbox
    case 'development':
      return idea.category === 'development'
    case 'monitoring':
      return idea.category === 'monitoring'
    case 'all':
      return true
    default:
      return true
  }
}

function ideaToRow(idea: Idea, assigneeName?: string): (string | number)[] {
  const kind = idea.ideaKind ?? 'standard'
  return [
    idea.id,
    idea.externalId,
    idea.title,
    idea.description,
    CATEGORY_LABELS[idea.category],
    IDEA_SOURCE_LABELS[idea.ideaSource],
    idea.department,
    PRIORITY_LABELS[idea.priority],
    WORKFLOW_LABELS[idea.workflowStatus],
    formatIdeaDate(idea.createdAt),
    formatIdeaDate(idea.targetStartDate),
    idea.plannedDate ? formatIdeaDate(idea.plannedDate) : '',
    idea.authorName,
    idea.authorRole,
    assigneeName ?? '',
    IDEA_VISIBILITY_LABELS[idea.visibility ?? 'team'],
    IDEA_KIND_LABELS[kind],
    idea.progress,
    idea.progressStep,
    idea.sendToMaybeInbox ? 'כן' : 'לא',
    idea.tags.join('; '),
    idea.goals.join('; '),
    idea.parentId ?? '',
  ]
}

function buildRows(
  ideas: Idea[],
  assigneeNames: Map<string, string>,
  sort: IdeaSortOption,
): (string | number)[][] {
  const header = [...EXPORT_HEADERS]
  const rows = sortIdeas(ideas, sort).map((idea) =>
    ideaToRow(idea, idea.assigneeUserId ? assigneeNames.get(idea.assigneeUserId) : undefined),
  )
  return [header, ...rows]
}

function sheetName(label: string): string {
  return label.replace(/[\\/?*[\]]/g, '').slice(0, 31)
}

export function exportIdeasToExcel(
  ideas: Idea[],
  config: IdeasExportConfig,
  assigneeNames: Map<string, string>,
): void {
  const base = filterForExport(ideas, config)
  const workbook = XLSX.utils.book_new()
  const slices = config.slices.length > 0 ? config.slices : (['all'] as IdeasExportSlice[])

  if (config.layout === 'single') {
    const union = new Map<string, Idea>()
    for (const slice of slices) {
      for (const idea of base) {
        if (matchesSlice(idea, slice)) union.set(idea.id, idea)
      }
    }
    const list = sortIdeas([...union.values()], config.sort)
    const data = buildRows(list, assigneeNames, config.sort)
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(data), sheetName('בקשות-רעיונות'))
  } else {
    for (const slice of slices) {
      const list = sortIdeas(
        base.filter((idea) => matchesSlice(idea, slice)),
        config.sort,
      )
      if (list.length === 0) continue
      const data = buildRows(list, assigneeNames, config.sort)
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.aoa_to_sheet(data),
        sheetName(EXPORT_SLICE_LABELS[slice]),
      )
    }
  }

  if (workbook.SheetNames.length === 0) {
    const data = buildRows([], assigneeNames, config.sort)
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(data), sheetName('ריק'))
  }

  const stamp = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(workbook, `ogen-bakashot-reayonot-${stamp}.xlsx`)
}

export function describeExportConfig(config: IdeasExportConfig): string {
  const sliceLabels = config.slices.map((s) => EXPORT_SLICE_LABELS[s]).join(', ')
  const sortLabel = IDEA_SORT_LABELS[config.sort]
  const parts = [
    `חתכים: ${sliceLabels || 'הכל'}`,
    `מיון: ${sortLabel}`,
    config.layout === 'per_slice' ? 'גיליון לכל חתך' : 'גיליון אחד',
  ]
  if (config.includeSubIdeas) parts.push('כולל תת-בקשות/רעיונות')
  if (config.dateFrom || config.dateTo) {
    parts.push(`תאריכים: ${config.dateFrom ?? '…'} – ${config.dateTo ?? '…'}`)
  }
  return parts.join(' · ')
}

export function countExportRows(ideas: Idea[], config: IdeasExportConfig): number {
  const base = filterForExport(ideas, config)
  const slices = config.slices.length > 0 ? config.slices : (['all'] as IdeasExportSlice[])

  if (config.layout === 'single') {
    const union = new Set<string>()
    for (const slice of slices) {
      for (const idea of base) {
        if (matchesSlice(idea, slice)) union.add(idea.id)
      }
    }
    return union.size
  }

  let total = 0
  for (const slice of slices) {
    total += base.filter((idea) => matchesSlice(idea, slice)).length
  }
  return total
}
