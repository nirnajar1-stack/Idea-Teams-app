import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { IdeasProvider } from './context/IdeasContext'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { ROUTES } from './constants/app'
import { HomePage } from './pages/HomePage'
import { IdeasListPage } from './pages/IdeasListPage'
import { IdeaDetailPage } from './pages/IdeaDetailPage'
import { AddIdeaPage } from './pages/AddIdeaPage'
import { ProfilePage } from './pages/ProfilePage'
import { LoginPage } from './pages/LoginPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <IdeasProvider>
          <Routes>
            <Route path={ROUTES.login} element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path={ROUTES.home} element={<HomePage />} />
              <Route path={ROUTES.ideas} element={<IdeasListPage />} />
              <Route path="/ideas/:id" element={<IdeaDetailPage />} />
              <Route path={ROUTES.addIdea} element={<AddIdeaPage />} />
              <Route path={ROUTES.profile} element={<ProfilePage />} />
              <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
            </Route>
            <Route path="*" element={<Navigate to={ROUTES.login} replace />} />
          </Routes>
        </IdeasProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
