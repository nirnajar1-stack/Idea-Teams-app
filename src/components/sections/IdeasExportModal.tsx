import { Download, FileSpreadsheet, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { IDEA_TERM } from '../../constants/terminology'
import {
  countExportRows,
  describeExportConfig,
  exportIdeasToExcel,
  EXPORT_SLICE_LABELS,
  type IdeasExportConfig,
  type IdeasExportLayout,
  type IdeasExportSlice,
} from '../../lib/ideasExcelExport'
import { IDEA_SORT_LABELS, IDEA_SOURCE_LABELS } from '../../lib/ideaUtils'
import { cn } from '../../lib/cn'
import type { Idea, IdeaCategory, IdeaPriority, IdeaSortOption, IdeaSource } from '../../types/idea'
import { IDEA_SOURCES } from '../../types/idea'
import { Button } from '../ui/Button'

const ALL_SLICES: IdeasExportSlice[] = [
  'active',
  'completed',
  'inbox',
  'development',
  'monitoring',
  'all',
]

export interface IdeasExportModalProps {
  open: boolean
  onClose: () => void
  ideas: Idea[]
  assigneeNames: Map<string, string>
  initialSearch?: string
  initialCategories?: IdeaCategory[]
  initialSources?: IdeaSource[]
  initialPriority?: IdeaPriority | null
  initialOnlyMine?: boolean
  currentUserId?: string
  initialSort?: IdeaSortOption
}

export function IdeasExportModal({
  open,
  onClose,
  ideas,
  assigneeNames,
  initialSearch = '',
  initialCategories = ['development', 'monitoring'],
  initialSources = [...IDEA_SOURCES],
  initialPriority = null,
  initialOnlyMine = false,
  currentUserId,
  initialSort = 'date_desc',
}: IdeasExportModalProps) {
  const [search, setSearch] = useState(initialSearch)
  const [categories, setCategories] = useState<IdeaCategory[]>(initialCategories)
  const [sources, setSources] = useState<IdeaSource[]>(initialSources)
  const [priority, setPriority] = useState<IdeaPriority | null>(initialPriority)
  const [onlyMine, setOnlyMine] = useState(initialOnlyMine)
  const [sort, setSort] = useState<IdeaSortOption>(initialSort)
  const [slices, setSlices] = useState<IdeasExportSlice[]>(['active', 'completed'])
  const [layout, setLayout] = useState<IdeasExportLayout>('per_slice')
  const [includeSubIdeas, setIncludeSubIdeas] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const config = useMemo(
    (): IdeasExportConfig => ({
      filters: {
        search,
        categories,
        sources,
        priority,
        onlyMine,
        currentUserId,
      },
      slices,
      layout,
      sort,
      includeSubIdeas,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    }),
    [
      search,
      categories,
      sources,
      priority,
      onlyMine,
      currentUserId,
      slices,
      layout,
      sort,
      includeSubIdeas,
      dateFrom,
      dateTo,
    ],
  )

  const rowCount = useMemo(() => countExportRows(ideas, config), [ideas, config])

  const toggleSlice = (slice: IdeasExportSlice) => {
    setSlices((prev) =>
      prev.includes(slice) ? prev.filter((s) => s !== slice) : [...prev, slice],
    )
  }

  const toggleCategory = (cat: IdeaCategory) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    )
  }

  const toggleSource = (source: IdeaSource) => {
    setSources((prev) =>
      prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source],
    )
  }

  const handleExport = () => {
    if (slices.length === 0) {
      toast.error('בחרו לפחות חתך אחד לייצוא')
      return
    }
    if (rowCount === 0) {
      toast.error('אין שורות לייצוא לפי הפילטרים שנבחרו')
      return
    }
    exportIdeasToExcel(ideas, config, assigneeNames)
    toast.success(`יוצאו ${rowCount} רשומות לאקסל`)
    onClose()
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-border-light bg-surface-container-lowest shadow-boutique sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border-light px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 id="export-modal-title" className="font-display text-headline-md text-on-surface">
                ייצוא לאקסל
              </h2>
              <p className="mt-0.5 font-body-sm text-secondary">
                {IDEA_TERM.many} — חתכים ופילטרים (מאסטר)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-secondary hover:bg-surface-container-low"
            aria-label="סגור"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <section>
            <h3 className="mb-3 font-label-md text-on-surface">חתכים לייצוא</h3>
            <div className="flex flex-wrap gap-2">
              {ALL_SLICES.map((slice) => (
                <button
                  key={slice}
                  type="button"
                  onClick={() => toggleSlice(slice)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 font-label-sm transition-colors',
                    slices.includes(slice)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border-light text-secondary hover:border-primary/30',
                  )}
                  aria-pressed={slices.includes(slice)}
                >
                  {EXPORT_SLICE_LABELS[slice]}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 font-label-md text-on-surface">מבנה קובץ</h3>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label
                className={cn(
                  'flex flex-1 cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 font-label-sm',
                  layout === 'per_slice'
                    ? 'border-primary bg-primary/5 text-on-surface'
                    : 'border-border-light text-secondary',
                )}
              >
                <input
                  type="radio"
                  name="export-layout"
                  className="accent-primary"
                  checked={layout === 'per_slice'}
                  onChange={() => setLayout('per_slice')}
                />
                גיליון נפרד לכל חתך
              </label>
              <label
                className={cn(
                  'flex flex-1 cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 font-label-sm',
                  layout === 'single'
                    ? 'border-primary bg-primary/5 text-on-surface'
                    : 'border-border-light text-secondary',
                )}
              >
                <input
                  type="radio"
                  name="export-layout"
                  className="accent-primary"
                  checked={layout === 'single'}
                  onChange={() => setLayout('single')}
                />
                גיליון אחד — כל החתכים
              </label>
            </div>
          </section>

          <section>
            <h3 className="mb-3 font-label-md text-on-surface">פילטרים</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block font-label-sm text-secondary">חיפוש</label>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="boutique-input w-full py-2.5 text-label-sm"
                  placeholder="כותרת, תיאור, מחלקה..."
                />
              </div>

              <div>
                <span className="mb-1.5 block font-label-sm text-secondary">מקור</span>
                <div className="flex flex-wrap gap-2">
                  {IDEA_SOURCES.map((source) => (
                    <button
                      key={source}
                      type="button"
                      onClick={() => toggleSource(source)}
                      className={cn(
                        'rounded-lg border px-3 py-1.5 font-label-sm',
                        sources.includes(source)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border-light text-secondary',
                      )}
                    >
                      {IDEA_SOURCE_LABELS[source]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <span className="mb-1.5 block font-label-sm text-secondary">קטגוריה</span>
                  <div className="flex flex-wrap gap-2">
                    {(['development', 'monitoring'] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={cn(
                          'rounded-lg border px-3 py-1.5 font-label-sm',
                          categories.includes(cat)
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border-light text-secondary',
                        )}
                      >
                        {cat === 'development' ? 'פיתוח' : 'בקרה'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block font-label-sm text-secondary">חשיבות</label>
                  <select
                    value={priority ?? ''}
                    onChange={(e) =>
                      setPriority((e.target.value || null) as IdeaPriority | null)
                    }
                    className="boutique-input w-full py-2.5 text-label-sm"
                  >
                    <option value="">הכל</option>
                    <option value="high">גבוהה</option>
                    <option value="medium">בינונית</option>
                    <option value="low">נמוכה</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block font-label-sm text-secondary">מתאריך פתיחה</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="boutique-input w-full py-2.5 text-label-sm"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-label-sm text-secondary">עד תאריך פתיחה</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="boutique-input w-full py-2.5 text-label-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block font-label-sm text-secondary">מיון בייצוא</label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as IdeaSortOption)}
                  className="boutique-input w-full py-2.5 text-label-sm"
                >
                  {(Object.keys(IDEA_SORT_LABELS) as IdeaSortOption[]).map((key) => (
                    <option key={key} value={key}>
                      {IDEA_SORT_LABELS[key]}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 font-label-sm text-on-surface">
                <input
                  type="checkbox"
                  checked={onlyMine}
                  onChange={(e) => setOnlyMine(e.target.checked)}
                  className="h-4 w-4 rounded accent-primary"
                />
                רק בקשות/רעיונות שפתחתי
              </label>

              <label className="flex items-center gap-2 font-label-sm text-on-surface">
                <input
                  type="checkbox"
                  checked={includeSubIdeas}
                  onChange={(e) => setIncludeSubIdeas(e.target.checked)}
                  className="h-4 w-4 rounded accent-primary"
                />
                כולל תת-בקשות/רעיונות
              </label>
            </div>
          </section>

          <p className="rounded-xl bg-surface-container-low px-4 py-3 font-body-sm text-secondary">
            {describeExportConfig(config)}
            <span className="mt-1 block font-label-md text-primary">
              {rowCount} שורות לייצוא
            </span>
          </p>
        </div>

        <div className="flex gap-3 border-t border-border-light px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-border-light py-3 font-label-md text-on-surface hover:bg-surface-container-low"
          >
            ביטול
          </button>
          <Button
            className="flex-1"
            icon={<Download className="h-5 w-5" />}
            onClick={handleExport}
            disabled={rowCount === 0 || slices.length === 0}
          >
            הורד אקסל
          </Button>
        </div>
      </div>
    </div>
  )
}
