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
import { PermissionsProvider } from './context/PermissionsContext'
import { IdeasProvider } from './context/IdeasContext'
import { UsersProvider } from './context/UsersContext'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { MasterRoute } from './components/layout/MasterRoute'
import { ManagerRoute } from './components/layout/ManagerRoute'
import { PermissionGate } from './components/layout/PermissionGate'
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
import { PermissionsManagementPage } from './pages/PermissionsManagementPage'
import { ManageHubPage } from './pages/ManageHubPage'
import { LinkedBoardsPage } from './pages/LinkedBoardsPage'
import { LinkedBoardViewerPage } from './pages/LinkedBoardViewerPage'
import { LinkedBoardsManagePage } from './pages/LinkedBoardsManagePage'
import { LinkedBoardsProvider } from './context/LinkedBoardsContext'
import { useAuth } from './context/AuthContext'
import { canManageUsers, isMaster } from './lib/permissions'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
})

function RoleDefaultGates() {
  const { user } = useAuth()
  const master = isMaster(user)
  const manager = canManageUsers(user)

  return (
    <Routes>
      <Route path={ROUTES.login} element={<LoginPage />} />
      <Route path={EMBED_ROUTES.login} element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<PermissionGate pageKey="page.home" defaultAllowed />}>
          <Route path={ROUTES.home} element={<HomePage />} />
          <Route path={EMBED_ROUTES.home} element={<HomePage />} />
        </Route>
        <Route element={<PermissionGate pageKey="page.ideas" defaultAllowed />}>
          <Route path={ROUTES.ideas} element={<IdeasListPage />} />
          <Route path={EMBED_ROUTES.ideas} element={<IdeasListPage />} />
          <Route path="/ideas/:parentId/sub/new" element={<AddSubIdeaPage />} />
          <Route path="/ideas/:id/edit" element={<EditIdeaPage />} />
          <Route path="/ideas/:id" element={<IdeaDetailPage />} />
          <Route path="/embed/ideas/:id" element={<IdeaDetailPage />} />
        </Route>
        <Route element={<PermissionGate pageKey="page.inbox" defaultAllowed />}>
          <Route path={ROUTES.inbox} element={<InboxPage />} />
        </Route>
        <Route element={<PermissionGate pageKey="page.addIdea" defaultAllowed />}>
          <Route path={ROUTES.addIdea} element={<AddIdeaPage />} />
        </Route>
        <Route element={<PermissionGate pageKey="page.profile" defaultAllowed />}>
          <Route path={ROUTES.profile} element={<ProfilePage />} />
        </Route>
        <Route
          element={
            <PermissionGate pageKey="page.openTasks" defaultAllowed />
          }
        >
          <Route path={ROUTES.openTasksDashboard} element={<OpenTasksDashboardPage />} />
        </Route>

        <Route
          element={
            <PermissionGate pageKey="page.timeline" defaultAllowed={master} />
          }
        >
          <Route path={ROUTES.timeline} element={<TimelinePage />} />
          <Route path={EMBED_ROUTES.timeline} element={<TimelinePage />} />
        </Route>
        <Route
          element={
            <PermissionGate pageKey="page.labels" defaultAllowed={master} />
          }
        >
          <Route path={ROUTES.labels} element={<LabelsManagementPage />} />
        </Route>

        <Route
          element={
            <PermissionGate pageKey="page.users" defaultAllowed={manager} />
          }
        >
          <Route path={ROUTES.users} element={<UserManagementPage />} />
        </Route>
        <Route
          element={
            <PermissionGate pageKey="page.groups" defaultAllowed={manager} />
          }
        >
          <Route path={ROUTES.groups} element={<GroupsManagementPage />} />
        </Route>
        <Route
          element={
            <PermissionGate pageKey="page.emailLog" defaultAllowed={manager} />
          }
        >
          <Route path={ROUTES.emailLog} element={<EmailLogPage />} />
        </Route>

        <Route
          element={
            <PermissionGate pageKey="page.boards" defaultAllowed />
          }
        >
          <Route path={ROUTES.boards} element={<LinkedBoardsPage />} />
          <Route element={<MasterRoute />}>
            <Route path={ROUTES.boardsManage} element={<LinkedBoardsManagePage />} />
          </Route>
          <Route path="/boards/:id" element={<LinkedBoardViewerPage />} />
        </Route>

        <Route element={<MasterRoute />}>
          <Route path={ROUTES.permissions} element={<PermissionsManagementPage />} />
        </Route>

        <Route element={<ManagerRoute />}>
          <Route path={ROUTES.manage} element={<ManageHubPage />} />
        </Route>

        <Route path="*" element={<DefaultHomeRedirect />} />
      </Route>
      <Route path="*" element={<PublicLoginRedirect />} />
    </Routes>
  )
}

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
          <PermissionsProvider>
          <LinkedBoardsProvider>
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
                  borderRadius: '1.35rem',
                },
              }}
            />
            <RoleDefaultGates />
            </ChatNotificationsProvider>
          </IdeasProvider>
          </LinkedBoardsProvider>
          </PermissionsProvider>
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
