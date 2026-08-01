import { AppWindow, ExternalLink, LayoutGrid } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { AppShell } from '../components/layout/AppShell'
import { EmptyState } from '../components/ui/EmptyState'
import { useLinkedBoards } from '../context/LinkedBoardsContext'
import { ROUTES } from '../constants/app'
import { openBoardPopup } from '../lib/openBoardPopup'
import { cn } from '../lib/cn'
import {
  LINKED_BOARD_PROVIDER_LABELS,
  resolveViewMode,
} from '../types/linkedBoard'

const PROVIDER_ACCENT: Record<string, string> = {
  notion: 'bg-[#000000]/8 text-on-surface',
  powerbi: 'bg-amber-500/15 text-amber-700',
  excel: 'bg-emerald-500/15 text-emerald-700',
  generic: 'bg-primary/10 text-primary',
}

export function LinkedBoardsPage() {
  const { boards, canManage, isReady } = useLinkedBoards()

  const openBoard = (boardId: string, url: string, title: string, mode: string) => {
    if (mode === 'popup') {
      const win = openBoardPopup(url, title)
      if (!win) {
        toast.error('החלון נחסם — נפתח במסך הלוח')
        window.location.assign(ROUTES.boardDetail(boardId))
      }
      return
    }
    if (mode === 'link') {
      window.open(url, '_blank', 'noopener,noreferrer')
      return
    }
    window.location.assign(ROUTES.boardDetail(boardId))
  }

  return (
    <AppShell variant="main">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3 md:mb-6">
        <div className="text-right">
          <span className="section-eyebrow">גישה מהירה</span>
          <h1 className="font-display text-headline-lg text-on-surface">לוחות מקושרים</h1>
          <p className="mt-1 text-body-sm text-secondary">
            Notion, Power BI ואתרים חיצוניים — לחיצה פותחת ישירות.
          </p>
        </div>
        {canManage && (
          <Link to={ROUTES.boardsManage} className="btn-secondary-light min-h-11">
            ניהול לוחות
          </Link>
        )}
      </div>

      {!isReady ? (
        <p className="text-secondary">טוען…</p>
      ) : boards.length === 0 ? (
        <EmptyState
          title="אין לוחות מקושרים"
          description={
            canManage
              ? 'הוסיפו קישור ללוח Notion או דוח חיצוני.'
              : 'כשיוגדר לוח על ידי מאסטר — הוא יופיע כאן.'
          }
          action={
            canManage ? (
              <Link to={ROUTES.boardsManage} className="btn-boutique">
                הוסף לוח
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="list-stagger grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => {
            const mode = resolveViewMode(board.provider, board.viewMode)
            return (
              <button
                key={board.id}
                type="button"
                onClick={() => openBoard(board.id, board.url, board.title, mode)}
                className="glass-card-hover flex flex-col gap-3 p-4 text-right active:scale-[0.98]"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                      PROVIDER_ACCENT[board.provider] ?? PROVIDER_ACCENT.generic,
                    )}
                  >
                    <LayoutGrid className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-label-md text-on-surface">{board.title}</h2>
                    <p className="mt-0.5 text-label-sm text-secondary">
                      {LINKED_BOARD_PROVIDER_LABELS[board.provider]}
                      {mode === 'iframe'
                        ? ' · מוטמע'
                        : mode === 'popup'
                          ? ' · חלון קופץ'
                          : ' · טאב'}
                    </p>
                  </div>
                  {mode === 'popup' ? (
                    <AppWindow className="mt-1 h-4 w-4 shrink-0 text-secondary" aria-hidden />
                  ) : (
                    <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-secondary" aria-hidden />
                  )}
                </div>
                {board.description && (
                  <p className="line-clamp-2 text-body-sm text-secondary">{board.description}</p>
                )}
              </button>
            )
          })}
        </div>
      )}
    </AppShell>
  )
}
