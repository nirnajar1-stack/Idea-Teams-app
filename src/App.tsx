import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { PreferencesProvider } from './context/PreferencesContext'
import { ChatNotificationsProvider } from './context/ChatNotificationsContext'
import { IdeasProvider } from './context/IdeasContext'
import { UsersProvider } from './context/UsersContext'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { ManagerRoute } from './components/layout/ManagerRoute'
import { ROUTES } from './constants/app'
import { HomePage } from './pages/HomePage'
import { IdeasListPage } from './pages/IdeasListPage'
import { IdeaDetailPage } from './pages/IdeaDetailPage'
import { EditIdeaPage } from './pages/EditIdeaPage'
import { AddIdeaPage } from './pages/AddIdeaPage'
import { ProfilePage } from './pages/ProfilePage'
import { InboxPage } from './pages/InboxPage'
import { LoginPage } from './pages/LoginPage'
import { UserManagementPage } from './pages/UserManagementPage'
import { AddSubIdeaPage } from './pages/AddSubIdeaPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
    <ThemeProvider>
    <BrowserRouter>
      <UsersProvider>
        <AuthProvider>
          <PreferencesProvider>
          <IdeasProvider>
            <ChatNotificationsProvider>
            <Toaster position="top-center" richColors dir="rtl" />
            <Routes>
              <Route path={ROUTES.login} element={<LoginPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path={ROUTES.home} element={<HomePage />} />
                <Route path={ROUTES.ideas} element={<IdeasListPage />} />
                <Route path={ROUTES.inbox} element={<InboxPage />} />
                <Route path="/ideas/:parentId/sub/new" element={<AddSubIdeaPage />} />
                <Route path="/ideas/:id/edit" element={<EditIdeaPage />} />
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
          </PreferencesProvider>
        </AuthProvider>
      </UsersProvider>
    </BrowserRouter>
    </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
