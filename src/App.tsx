import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { PreferencesProvider } from './context/PreferencesContext'
import { ChatNotificationsProvider } from './context/ChatNotificationsContext'
import { EmbedModeProvider } from './context/EmbedModeContext'
import { LabelsProvider } from './context/LabelsContext'
import { GroupsProvider } from './context/GroupsContext'
import { IdeasProvider } from './context/IdeasContext'
import { UsersProvider } from './context/UsersContext'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { ManagerRoute } from './components/layout/ManagerRoute'
import { MasterRoute } from './components/layout/MasterRoute'
import {
  DefaultHomeRedirect,
  PublicLoginRedirect,
} from './components/layout/EmbedRedirects'
import { EMBED_ROUTES, ROUTES } from './constants/app'
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
import { LabelsManagementPage } from './pages/LabelsManagementPage'
import { GroupsManagementPage } from './pages/GroupsManagementPage'
import { EmailLogPage } from './pages/EmailLogPage'
import { OpenTasksDashboardPage } from './pages/OpenTasksDashboardPage'
import { TimelinePage } from './pages/TimelinePage'

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
          <EmbedModeProvider>
          <LabelsProvider>
          <GroupsProvider>
          <IdeasProvider>
            <ChatNotificationsProvider>
            <Toaster
              position="top-center"
              dir="rtl"
              toastOptions={{
                className: 'lambo-toast',
                style: {
                  background: 'var(--color-surface-container-lowest)',
                  border: '1px solid var(--color-border-light)',
                  color: 'var(--color-on-surface)',
                  borderRadius: '0',
                },
              }}
            />
            <Routes>
              <Route path={ROUTES.login} element={<LoginPage />} />
              <Route path={EMBED_ROUTES.login} element={<LoginPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path={ROUTES.home} element={<HomePage />} />
                <Route path={ROUTES.ideas} element={<IdeasListPage />} />
                <Route path={EMBED_ROUTES.home} element={<HomePage />} />
                <Route path={EMBED_ROUTES.ideas} element={<IdeasListPage />} />
                <Route path={ROUTES.inbox} element={<InboxPage />} />
                <Route path="/ideas/:parentId/sub/new" element={<AddSubIdeaPage />} />
                <Route path="/ideas/:id/edit" element={<EditIdeaPage />} />
                <Route path="/ideas/:id" element={<IdeaDetailPage />} />
                <Route path="/embed/ideas/:id" element={<IdeaDetailPage />} />
                <Route path={ROUTES.addIdea} element={<AddIdeaPage />} />
                <Route path={ROUTES.profile} element={<ProfilePage />} />
                <Route element={<ManagerRoute />}>
                  <Route path={ROUTES.users} element={<UserManagementPage />} />
                  <Route path={ROUTES.groups} element={<GroupsManagementPage />} />
                  <Route path={ROUTES.emailLog} element={<EmailLogPage />} />
                </Route>
                <Route path={ROUTES.openTasksDashboard} element={<OpenTasksDashboardPage />} />
                <Route element={<MasterRoute />}>
                  <Route path={ROUTES.timeline} element={<TimelinePage />} />
                  <Route path={ROUTES.labels} element={<LabelsManagementPage />} />
                  <Route path={EMBED_ROUTES.timeline} element={<TimelinePage />} />
                </Route>
                <Route path="*" element={<DefaultHomeRedirect />} />
              </Route>
              <Route path="*" element={<PublicLoginRedirect />} />
            </Routes>
            </ChatNotificationsProvider>
          </IdeasProvider>
          </GroupsProvider>
          </LabelsProvider>
          </EmbedModeProvider>
          </PreferencesProvider>
        </AuthProvider>
      </UsersProvider>
    </BrowserRouter>
    </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
