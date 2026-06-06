import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { ChatNotificationsProvider } from './context/ChatNotificationsContext'
import { IdeasProvider } from './context/IdeasContext'
import { UsersProvider } from './context/UsersContext'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { ManagerRoute } from './components/layout/ManagerRoute'
import { ROUTES } from './constants/app'
import { HomePage } from './pages/HomePage'
import { IdeasListPage } from './pages/IdeasListPage'
import { IdeaDetailPage } from './pages/IdeaDetailPage'
import { AddIdeaPage } from './pages/AddIdeaPage'
import { ProfilePage } from './pages/ProfilePage'
import { InboxPage } from './pages/InboxPage'
import { LoginPage } from './pages/LoginPage'
import { UserManagementPage } from './pages/UserManagementPage'
import { AddSubIdeaPage } from './pages/AddSubIdeaPage'

function App() {
  return (
    <ThemeProvider>
    <BrowserRouter>
      <UsersProvider>
        <AuthProvider>
          <IdeasProvider>
            <ChatNotificationsProvider>
            <Routes>
              <Route path={ROUTES.login} element={<LoginPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path={ROUTES.home} element={<HomePage />} />
                <Route path={ROUTES.ideas} element={<IdeasListPage />} />
                <Route path={ROUTES.inbox} element={<InboxPage />} />
                <Route path="/ideas/:parentId/sub/new" element={<AddSubIdeaPage />} />
                <Route path="/ideas/:id" element={<IdeaDetailPage />} />
                <Route path={ROUTES.addIdea} element={<AddIdeaPage />} />
                <Route path={ROUTES.profile} element={<ProfilePage />} />
                <Route element={<ManagerRoute />}>
                  <Route path={ROUTES.users} element={<UserManagementPage />} />
                </Route>
                <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
              </Route>
              <Route path="*" element={<Navigate to={ROUTES.login} replace />} />
            </Routes>
            </ChatNotificationsProvider>
          </IdeasProvider>
        </AuthProvider>
      </UsersProvider>
    </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
