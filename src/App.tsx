import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { IdeasProvider } from './context/IdeasContext'
import { ROUTES } from './constants/app'
import { HomePage } from './pages/HomePage'
import { IdeasListPage } from './pages/IdeasListPage'
import { IdeaDetailPage } from './pages/IdeaDetailPage'
import { AddIdeaPage } from './pages/AddIdeaPage'
import { ProfilePage } from './pages/ProfilePage'

function App() {
  return (
    <BrowserRouter>
      <IdeasProvider>
        <Routes>
          <Route path={ROUTES.home} element={<HomePage />} />
          <Route path={ROUTES.ideas} element={<IdeasListPage />} />
          <Route path="/ideas/:id" element={<IdeaDetailPage />} />
          <Route path={ROUTES.addIdea} element={<AddIdeaPage />} />
          <Route path={ROUTES.profile} element={<ProfilePage />} />
          <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
        </Routes>
      </IdeasProvider>
    </BrowserRouter>
  )
}

export default App
