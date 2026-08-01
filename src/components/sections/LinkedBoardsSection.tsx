import { AppWindow, ExternalLink, LayoutGrid, Settings2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ROUTES } from '../../constants/app'
import { useLinkedBoards } from '../../context/LinkedBoardsContext'
import { openBoardPopup } from '../../lib/openBoardPopup'
import {
  LINKED_BOARD_PROVIDER_LABELS,
  resolveViewMode,
} from '../../types/linkedBoard'
import { cn } from '../../lib/cn'

const PROVIDER_ACCENT: Record<string, string> = {
  notion: 'bg-[#000000]/8 text-on-surface',
  powerbi: 'bg-amber-500/15 text-amber-700',
  excel: 'bg-emerald-500/15 text-emerald-700',
  generic: 'bg-primary/10 text-primary',
}

/** רצועת לוחות מקושרים בלוח הבקרה */
export function LinkedBoardsSection() {
  const { boards, canManage, isReady } = useLinkedBoards()

  if (!isReady) return null
  if (boards.length === 0 && !canManage) return null

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
    <section className="mb-5 md:mb-6" aria-label="לוחות מקושרים">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-display text-headline-md text-on-surface">לוחות מקושרים</h2>
        <div className="flex items-center gap-2">
          {canManage && (
            <Link
              to={ROUTES.boardsManage}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-label-sm text-secondary transition-colors hover:bg-surface-container hover:text-on-surface"
            >
              <Settings2 className="h-3.5 w-3.5" aria-hidden />
              ניהול
            </Link>
          )}
          <Link to={ROUTES.boards} className="font-label-md text-primary hover:underline">
            הכל
          </Link>
        </div>
      </div>

      {boards.length === 0 ? (
        <div className="rounded-[1.35rem] bg-surface-container-lowest px-4 py-5 text-center shadow-soft">
          <p className="text-body-sm text-secondary">
            אין לוחות עדיין. הוסיפו קישור ל-Notion / Power BI.
          </p>
          {canManage && (
            <Link to={ROUTES.boardsManage} className="btn-boutique mt-3 inline-flex min-h-10">
              הוסף לוח
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {boards.slice(0, 6).map((board) => {
            const mode = resolveViewMode(board.provider, board.viewMode)
            return (
              <div
                key={board.id}
                className="glass-card-hover flex items-center gap-3 p-3.5"
              >
                <button
                  type="button"
                  onClick={() => openBoard(board.id, board.url, board.title, mode)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-right"
                >
                  <span
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                      PROVIDER_ACCENT[board.provider] ?? PROVIDER_ACCENT.generic,
                    )}
                  >
                    <LayoutGrid className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-label-md text-on-surface">
                      {board.title}
                    </span>
                    <span className="mt-0.5 block text-micro text-secondary">
                      {LINKED_BOARD_PROVIDER_LABELS[board.provider]}
                      {mode === 'popup' ? ' · חלון קופץ' : mode === 'link' ? ' · טאב' : ''}
                    </span>
                  </span>
                  {mode === 'popup' ? (
                    <AppWindow className="h-4 w-4 shrink-0 text-secondary" aria-hidden />
                  ) : mode === 'link' ? (
                    <ExternalLink className="h-4 w-4 shrink-0 text-secondary" aria-hidden />
                  ) : null}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
