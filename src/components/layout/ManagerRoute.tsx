import { Navigate, Outlet } from 'react-router-dom'
import { useAppRoutes } from '../../context/EmbedModeContext'
import { useAuth } from '../../context/AuthContext'
import { canManageUsers } from '../../lib/permissions'

/** מנהל או מאסטר — גישה למרכז הניהול */
export function ManagerRoute() {
  const { user } = useAuth()
  const routes = useAppRoutes()

  if (!canManageUsers(user)) {
    return <Navigate to={routes.home} replace />
  }

  return <Outlet />
}
