import { Shield } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { AppShell } from '../components/layout/AppShell'
import { useGroups } from '../context/GroupsContext'
import { usePermissions } from '../context/PermissionsContext'
import { cn } from '../lib/cn'
import {
  PERMISSION_CATALOG,
  PERMISSION_MODE_LABELS,
  defaultRule,
  type PermissionCatalogItem,
  type PermissionKey,
  type PermissionMode,
  type PermissionRule,
} from '../types/permission'

type SectionTab = 'pages' | 'actions'

const MODE_OPTIONS: { mode: PermissionMode; short: string }[] = [
  { mode: 'default', short: 'לפי תפקיד' },
  { mode: 'groups', short: 'קבוצות' },
  { mode: 'disabled', short: 'חסום' },
]

function RuleRowEditor({
  itemKey,
  draft,
  groups,
  onChange,
}: {
  itemKey: PermissionKey
  draft: PermissionRule
  groups: { id: string; name: string }[]
  onChange: (next: PermissionRule) => void
}) {
  const locked = itemKey === 'page.permissions'

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-2 font-label-sm text-secondary">מי יכול?</p>
        <div
          className="grid grid-cols-3 gap-1.5 rounded-2xl bg-surface-container p-1"
          role="group"
          aria-label="מצב הרשאה"
        >
          {MODE_OPTIONS.map(({ mode, short }) => {
            const selected = (locked ? 'default' : draft.mode) === mode
            return (
              <button
                key={mode}
                type="button"
                disabled={locked}
                title={PERMISSION_MODE_LABELS[mode]}
                onClick={() =>
                  onChange({
                    ...draft,
                    mode,
                    groupIds: mode === 'groups' ? draft.groupIds : [],
                  })
                }
                className={cn(
                  'min-h-10 rounded-xl px-1.5 py-2 text-center text-[0.7rem] font-label-sm leading-tight transition-colors sm:text-label-sm',
                  selected
                    ? 'bg-primary text-on-primary shadow-soft'
                    : 'text-secondary hover:text-on-surface',
                  locked && 'opacity-60',
                )}
              >
                {short}
              </button>
            )
          })}
        </div>
      </div>

      {draft.mode === 'groups' && !locked && (
        <div>
          <p className="mb-2 font-label-sm text-secondary">קבוצות מורשות</p>
          {groups.length === 0 ? (
            <p className="text-body-sm text-secondary">
              אין קבוצות פעילות — צרו קבוצות במסך הקבוצות תחילה.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {groups.map((g) => {
                const selected = draft.groupIds.includes(g.id)
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() =>
                      onChange({
                        ...draft,
                        groupIds: selected
                          ? draft.groupIds.filter((id) => id !== g.id)
                          : [...draft.groupIds, g.id],
                      })
                    }
                    className={cn(
                      'min-h-10 rounded-full px-3.5 py-2 text-label-sm transition-colors',
                      selected
                        ? 'bg-primary text-on-primary shadow-boutique'
                        : 'bg-surface-container text-secondary hover:text-on-surface',
                    )}
                  >
                    {g.name}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {locked && (
        <p className="text-body-sm text-secondary">
          מסך זה נשאר תמיד למאסטר בלבד ולא ניתן להגביל אותו.
        </p>
      )}
    </div>
  )
}

function PermissionCard({
  item,
  draft,
  groups,
  onChange,
}: {
  item: PermissionCatalogItem
  draft: PermissionRule
  groups: { id: string; name: string }[]
  onChange: (next: PermissionRule) => void
}) {
  return (
    <article className="rounded-[1.35rem] bg-surface-container-lowest p-4 shadow-soft sm:p-5">
      <div className="mb-3 text-right">
        <h3 className="font-label-md text-on-surface">{item.label}</h3>
        <p className="mt-1 text-body-sm leading-snug text-secondary">{item.description}</p>
      </div>
      <RuleRowEditor
        itemKey={item.key}
        draft={draft}
        groups={groups}
        onChange={onChange}
      />
    </article>
  )
}

export function PermissionsManagementPage() {
  const { groups } = useGroups()
  const { rulesByKey, saveRules, isReady } = usePermissions()
  const [drafts, setDrafts] = useState<Map<PermissionKey, PermissionRule>>(new Map())
  const [saving, setSaving] = useState(false)
  const [section, setSection] = useState<SectionTab>('pages')

  useEffect(() => {
    if (!isReady) return
    setDrafts(new Map(rulesByKey))
  }, [isReady, rulesByKey])

  const pages = useMemo(
    () => PERMISSION_CATALOG.filter((i) => i.kind === 'page'),
    [],
  )
  const actions = useMemo(
    () => PERMISSION_CATALOG.filter((i) => i.kind === 'action'),
    [],
  )

  const activeItems = section === 'pages' ? pages : actions

  const updateDraft = (key: PermissionKey, next: PermissionRule) => {
    setDrafts((prev) => {
      const map = new Map(prev)
      map.set(key, next)
      return map
    })
  }

  const dirtyRules = useMemo(() => {
    const changed: PermissionRule[] = []
    for (const item of PERMISSION_CATALOG) {
      if (item.key === 'page.permissions') continue
      const draft = drafts.get(item.key) ?? defaultRule(item.key)
      const saved = rulesByKey.get(item.key) ?? defaultRule(item.key)
      const sameMode = draft.mode === saved.mode
      const sameGroups =
        draft.groupIds.length === saved.groupIds.length &&
        draft.groupIds.every((id) => saved.groupIds.includes(id))
      if (!sameMode || !sameGroups) {
        changed.push({
          key: item.key,
          mode: draft.mode,
          groupIds: draft.mode === 'groups' ? draft.groupIds : [],
        })
      }
    }
    return changed
  }, [drafts, rulesByKey])

  const dirtyInSection = useMemo(() => {
    const keys = new Set(activeItems.map((i) => i.key))
    return dirtyRules.filter((r) => keys.has(r.key)).length
  }, [activeItems, dirtyRules])

  const handleSave = async () => {
    if (dirtyRules.length === 0) {
      toast.message('אין שינויים לשמירה')
      return
    }
    for (const rule of dirtyRules) {
      if (rule.mode === 'groups' && rule.groupIds.length === 0) {
        toast.error('יש לבחור לפחות קבוצה אחת בכל הרשאה במצב «קבוצות»')
        return
      }
    }
    setSaving(true)
    try {
      await saveRules(dirtyRules)
      toast.success('ההרשאות נשמרו')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'שמירה נכשלה')
    } finally {
      setSaving(false)
    }
  }

  const saveLabel = saving
    ? 'שומר…'
    : dirtyRules.length
      ? `שמור (${dirtyRules.length})`
      : 'שמור'

  return (
    <AppShell variant="main">
      <div className="pb-24 md:pb-8">
        <header className="mb-5 text-right md:mb-6">
          <span className="section-eyebrow">ניהול מאסטר</span>
          <h1 className="mt-1 flex items-center justify-end gap-2 font-display text-headline-lg text-on-surface">
            <Shield className="h-6 w-6 shrink-0 text-primary" aria-hidden />
            הרשאות מערכת
          </h1>
          <p className="mt-1 text-body-sm text-secondary">
            בחרו קטגוריה, ואז הגדירו לכל פריט מי מורשה.
          </p>
        </header>

        {/* מעבר ברור בין תצוגות ↔ פעולות */}
        <div
          className="sticky top-[7.5rem] z-30 -mx-4 mb-5 border-b border-border-light bg-background/95 px-4 py-2 backdrop-blur-md md:top-16 md:mx-0 md:mb-6 md:rounded-2xl md:border md:bg-surface-container-lowest md:px-2 md:py-2 md:shadow-soft md:backdrop-blur-none"
          role="tablist"
          aria-label="קטגוריית הרשאות"
        >
          <div className="grid grid-cols-2 gap-1 rounded-2xl bg-surface-container p-1 md:bg-transparent">
            {(
              [
                {
                  id: 'pages' as const,
                  label: 'תצוגות דפים',
                  hint: `${pages.length} מסכים`,
                },
                {
                  id: 'actions' as const,
                  label: 'פעולות',
                  hint: `${actions.length} פעולות`,
                },
              ] as const
            ).map((tab) => {
              const active = section === tab.id
              const dirty =
                tab.id === 'pages'
                  ? dirtyRules.filter((r) => r.key.startsWith('page.')).length
                  : dirtyRules.filter((r) => r.key.startsWith('action.')).length
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSection(tab.id)}
                  className={cn(
                    'relative flex min-h-12 flex-col items-center justify-center rounded-xl px-2 py-2 transition-colors md:min-h-14',
                    active
                      ? 'bg-primary text-on-primary shadow-soft'
                      : 'text-secondary hover:text-on-surface',
                  )}
                >
                  <span className="font-label-md">{tab.label}</span>
                  <span
                    className={cn(
                      'mt-0.5 text-micro',
                      active ? 'text-on-primary/80' : 'text-secondary',
                    )}
                  >
                    {tab.hint}
                    {dirty > 0 ? ` · ${dirty} שינויים` : ''}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {!isReady ? (
          <p className="text-secondary">טוען הרשאות…</p>
        ) : (
          <section aria-labelledby="permissions-section-title">
            <div className="mb-4 text-right md:mb-5">
              <h2
                id="permissions-section-title"
                className="font-display text-headline-md text-on-surface"
              >
                {section === 'pages' ? 'תצוגות דפים' : 'פעולות'}
              </h2>
              <p className="mt-1 text-body-sm text-secondary">
                {section === 'pages'
                  ? 'מי רואה כל מסך בניווט ובקישורים ישירים.'
                  : 'מי יכול לבצע כל פעולה באפליקציה — למשל סגירת בקשה.'}
                {dirtyInSection > 0 && (
                  <span className="text-primary"> · {dirtyInSection} שינויים בקטגוריה</span>
                )}
              </p>
            </div>

            <div className="space-y-3 md:space-y-4">
              {activeItems.map((item) => {
                const draft = drafts.get(item.key) ?? defaultRule(item.key)
                return (
                  <PermissionCard
                    key={item.key}
                    item={item}
                    draft={draft}
                    groups={groups}
                    onChange={(next) => updateDraft(item.key, next)}
                  />
                )
              })}
            </div>
          </section>
        )}
      </div>

      {/* שמירה קבועה במובייל מעל הניווט התחתון */}
      <div className="fixed inset-x-0 z-40 border-t border-border-light bg-background/95 px-4 py-3 backdrop-blur-md bottom-mobile-nav md:static md:inset-auto md:z-auto md:mt-8 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
        <div className="mx-auto flex max-w-container-max items-center justify-between gap-3 md:justify-end">
          <p className="text-body-sm text-secondary md:hidden">
            {dirtyRules.length === 0
              ? 'אין שינויים'
              : `${dirtyRules.length} שינויים שלא נשמרו`}
          </p>
          <button
            type="button"
            disabled={saving || dirtyRules.length === 0}
            onClick={() => void handleSave()}
            className="btn-boutique min-h-12 shrink-0 px-6 disabled:opacity-40"
          >
            {saveLabel}
          </button>
        </div>
      </div>
    </AppShell>
  )
}
