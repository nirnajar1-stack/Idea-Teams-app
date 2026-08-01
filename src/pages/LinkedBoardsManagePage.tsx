import { ExternalLink, LayoutGrid, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { AppShell } from '../components/layout/AppShell'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { Input } from '../components/ui/Input'
import { useLinkedBoards } from '../context/LinkedBoardsContext'
import { ROUTES } from '../constants/app'
import { cn } from '../lib/cn'
import {
  LINKED_BOARD_PROVIDER_LABELS,
  defaultViewModeForProvider,
  detectBoardProvider,
  isValidHttpUrl,
  normalizeBoardUrl,
  providerBlocksIframe,
  resolveViewMode,
  type LinkedBoardProvider,
  type LinkedBoardViewMode,
} from '../types/linkedBoard'

const PROVIDERS = Object.keys(LINKED_BOARD_PROVIDER_LABELS) as LinkedBoardProvider[]

export function LinkedBoardsManagePage() {
  const { boards, createBoard, updateBoard, deleteBoard, canManage } = useLinkedBoards()
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [provider, setProvider] = useState<LinkedBoardProvider | 'auto'>('auto')
  const [viewMode, setViewMode] = useState<LinkedBoardViewMode | 'auto'>('auto')
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const previewProvider = useMemo(() => {
    if (provider !== 'auto') return provider
    const normalized = normalizeBoardUrl(url)
    return normalized ? detectBoardProvider(normalized) : 'generic'
  }, [provider, url])

  const previewMode = useMemo(() => {
    if (viewMode !== 'auto') {
      return resolveViewMode(previewProvider, viewMode)
    }
    return defaultViewModeForProvider(previewProvider)
  }, [viewMode, previewProvider])

  if (!canManage) {
    return (
      <AppShell variant="main">
        <p className="text-secondary">רק מאסטר יכול לנהל לוחות מקושרים.</p>
        <Link to={ROUTES.boards} className="mt-3 inline-block text-primary hover:underline">
          חזרה ללוחות
        </Link>
      </AppShell>
    )
  }

  const handleCreate = async () => {
    const trimmedTitle = title.trim()
    const normalized = normalizeBoardUrl(url)
    if (!trimmedTitle) {
      toast.error('יש להזין שם ללוח')
      return
    }
    if (!isValidHttpUrl(normalized)) {
      toast.error('יש להזין כתובת תקינה (https://...)')
      return
    }

    setSaving(true)
    try {
      await createBoard({
        title: trimmedTitle,
        url: normalized,
        provider: provider === 'auto' ? undefined : provider,
        viewMode: viewMode === 'auto' ? undefined : viewMode,
        description: description.trim() || undefined,
      })
      setTitle('')
      setUrl('')
      setDescription('')
      setProvider('auto')
      setViewMode('auto')
      toast.success('הלוח נוסף')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'הוספה נכשלה')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteBoard(deleteTarget)
      toast.success('הלוח הוסר')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'מחיקה נכשלה')
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <AppShell variant="main">
      <div className="mb-5 text-right md:mb-6">
        <span className="section-eyebrow">ניהול מאסטר</span>
        <h1 className="mb-1 font-display text-headline-lg text-on-surface">ניהול לוחות מקושרים</h1>
        <p className="text-body-sm text-secondary">
          הוסיפו קישורים ל-Notion, Power BI או אתרים אחרים. Notion לרוב נפתח בטאב חיצוני
          כי הוא חוסם הטמעה.
        </p>
        <Link to={ROUTES.boards} className="mt-2 inline-block text-label-md text-primary hover:underline">
          צפייה בלוחות ←
        </Link>
      </div>

      <div className="mb-6 rounded-[1.35rem] bg-surface-container-lowest p-4 shadow-soft md:p-5">
        <h2 className="mb-4 flex items-center gap-2 font-label-md text-on-surface">
          <Plus className="h-5 w-5 text-primary" aria-hidden />
          לוח חדש
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            label="שם הלוח"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="למשל: לוח סטטוס ב-Notion"
          />
          <Input
            label="כתובת URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.notion.so/..."
            dir="ltr"
            className="text-left"
          />
          <label className="block font-label-sm text-secondary">
            סוג
            <select
              className="boutique-input mt-1.5"
              value={provider}
              onChange={(e) =>
                setProvider(e.target.value as LinkedBoardProvider | 'auto')
              }
            >
              <option value="auto">זיהוי אוטומטי ({LINKED_BOARD_PROVIDER_LABELS[previewProvider]})</option>
              {PROVIDERS.map((p) => (
                <option key={p} value={p}>
                  {LINKED_BOARD_PROVIDER_LABELS[p]}
                </option>
              ))}
            </select>
          </label>
          <label className="block font-label-sm text-secondary">
            אופן פתיחה
            <select
              className="boutique-input mt-1.5"
              value={viewMode}
              onChange={(e) =>
                setViewMode(e.target.value as LinkedBoardViewMode | 'auto')
              }
            >
              <option value="auto">
                ברירת מחדל (
                {previewMode === 'iframe'
                  ? 'הטמעה'
                  : previewMode === 'popup'
                    ? 'חלון קופץ'
                    : 'טאב חדש'}
                )
              </option>
              {!providerBlocksIframe(previewProvider) && (
                <option value="iframe">הטמעה בתוך האפליקציה</option>
              )}
              <option value="popup">חלון קופץ גדול</option>
              <option value="link">טאב חדש</option>
            </select>
            {providerBlocksIframe(previewProvider) && (
              <span className="mt-1.5 block text-body-sm text-secondary">
                Notion חוסם הטמעה — מומלץ חלון קופץ.
              </span>
            )}
          </label>
          <div className="md:col-span-2">
            <Input
              label="תיאור (אופציונלי)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="מה רואים בלוח הזה"
            />
          </div>
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={() => void handleCreate()}
          className="btn-boutique mt-4 min-h-11"
        >
          {saving ? 'שומר…' : 'הוסף לוח'}
        </button>
      </div>

      <div className="space-y-2">
        {boards.length === 0 ? (
          <p className="text-body-sm text-secondary">אין לוחות עדיין.</p>
        ) : (
          boards.map((board) => (
            <article
              key={board.id}
              className="flex flex-wrap items-center gap-3 rounded-[1.25rem] bg-surface-container-lowest px-4 py-3 shadow-soft"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <LayoutGrid className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1 text-right">
                <h3 className="truncate font-label-md text-on-surface">{board.title}</h3>
                <p className="truncate text-label-sm text-secondary" dir="ltr">
                  {LINKED_BOARD_PROVIDER_LABELS[board.provider]} · {board.url}
                </p>
              </div>
              <select
                className="boutique-input h-10 w-auto min-w-[9rem] py-1 text-sm"
                value={resolveViewMode(board.provider, board.viewMode)}
                onChange={(e) =>
                  void updateBoard(board.id, {
                    viewMode: e.target.value as LinkedBoardViewMode,
                  }).catch((err) =>
                    toast.error(err instanceof Error ? err.message : 'עדכון נכשל'),
                  )
                }
                aria-label="אופן פתיחה"
              >
                {!providerBlocksIframe(board.provider) && (
                  <option value="iframe">הטמעה</option>
                )}
                <option value="popup">חלון קופץ</option>
                <option value="link">טאב חדש</option>
              </select>
              <Link
                to={ROUTES.boardDetail(board.id)}
                className={cn(
                  'inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-label-sm',
                  'bg-surface-container text-secondary hover:text-on-surface',
                )}
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                פתח
              </Link>
              <button
                type="button"
                className="icon-chip text-error"
                aria-label={`מחק ${board.title}`}
                onClick={() => setDeleteTarget(board.id)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </article>
          ))
        )}
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="מחיקת לוח"
        message="להסיר את הלוח מהאפליקציה? הקישור החיצוני עצמו לא יימחק."
        confirmLabel="מחק"
        variant="danger"
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppShell>
  )
}
