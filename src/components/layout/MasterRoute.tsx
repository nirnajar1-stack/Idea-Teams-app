import { Navigate, Outlet } from 'react-router-dom'
import { useAppRoutes } from '../../context/EmbedModeContext'
import { useAuth } from '../../context/AuthContext'
import { isMaster } from '../../lib/permissions'

export function MasterRoute() {
  const { user } = useAuth()
  const routes = useAppRoutes()

  if (!isMaster(user)) {
    return <Navigate to={routes.home} replace />
  }

  return <Outlet />
}
