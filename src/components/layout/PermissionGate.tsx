import { Navigate, Outlet } from 'react-router-dom'
import { useAppRoutes } from '../../context/EmbedModeContext'
import { useAuth } from '../../context/AuthContext'
import { usePermissions } from '../../context/PermissionsContext'
import type { PermissionKey } from '../../types/permission'

export interface PermissionGateProps {
  pageKey: PermissionKey
  /** ברירת מחדל כשאין override במטריצה */
  defaultAllowed?: boolean
}

/** חוסם גישה לדף לפי מטריצת ההרשאות של המאסטר */
export function PermissionGate({
  pageKey,
  defaultAllowed = true,
}: PermissionGateProps) {
  const { user } = useAuth()
  const routes = useAppRoutes()
  const { canViewPage, isReady } = usePermissions()

  if (!user) {
    return <Navigate to={routes.login} replace />
  }

  if (!isReady) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-secondary">
        טוען הרשאות…
      </div>
    )
  }

  if (!canViewPage(pageKey, defaultAllowed)) {
    const fallback =
      pageKey === 'page.home'
        ? canViewPage('page.ideas', true)
          ? routes.ideas
          : routes.profile
        : routes.home
    return <Navigate to={fallback} replace />
  }

  return <Outlet />
}
