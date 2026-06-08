import { Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from '../../constants/app'
import { useAuth } from '../../context/AuthContext'
import { isMaster } from '../../lib/permissions'

export function MasterRoute() {
  const { user } = useAuth()

  if (!isMaster(user)) {
    return <Navigate to={ROUTES.home} replace />
  }

  return <Outlet />
}
