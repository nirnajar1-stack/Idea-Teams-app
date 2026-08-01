import { ExternalLink, LayoutGrid, Settings2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/app'
import { useLinkedBoards } from '../../context/LinkedBoardsContext'
import { LINKED_BOARD_PROVIDER_LABELS } from '../../types/linkedBoard'

/** רצועת לוחות מקושרים בלוח הבקרה */
export function LinkedBoardsSection() {
  const { boards, canManage, isReady } = useLinkedBoards()

  if (!isReady) return null
  if (boards.length === 0 && !canManage) return null

  return (
    <section className="mb-5 md:mb-6" aria-label="לוחות מקושרים">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-display text-label-md text-on-surface md:text-headline-md">
          לוחות מקושרים
        </h2>
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
          <Link
            to={ROUTES.boards}
            className="font-label-md text-primary hover:underline"
          >
            הכל
          </Link>
        </div>
      </div>

      {boards.length === 0 ? (
        <div className="rounded-[1.35rem] bg-surface-container-lowest px-4 py-5 text-center shadow-soft">
          <p className="text-body-sm text-secondary">
            אין לוחות עדיין. הוסיפו קישור ל-Notion / Power BI / אתר אחר.
          </p>
          {canManage && (
            <Link to={ROUTES.boardsManage} className="btn-boutique mt-3 inline-flex min-h-10">
              הוסף לוח
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {boards.slice(0, 6).map((board) => (
            <Link
              key={board.id}
              to={ROUTES.boardDetail(board.id)}
              className="glass-card-hover flex items-center gap-3 p-3.5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <LayoutGrid className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1 text-right">
                <span className="block truncate font-label-md text-on-surface">
                  {board.title}
                </span>
                <span className="mt-0.5 block text-micro text-secondary">
                  {LINKED_BOARD_PROVIDER_LABELS[board.provider]}
                </span>
              </span>
              {board.viewMode === 'link' && (
                <ExternalLink className="h-4 w-4 shrink-0 text-secondary" aria-hidden />
              )}
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
