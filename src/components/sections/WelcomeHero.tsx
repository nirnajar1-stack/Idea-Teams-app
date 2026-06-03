import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/app'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../ui/Button'

export function WelcomeHero() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <header className="mb-10">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="mb-2 font-display text-headline-lg-mobile text-on-surface md:text-headline-lg">
            שלום, {user?.name}
          </h1>
          <p className="max-w-lg font-body-md text-secondary">
            ברוכים הבאים ללוח הבקרה של IdeaFlow. רעיונות שתוסיפו יירשמו תחת שמך (
            {user?.name}).
          </p>
        </div>
        <Button
          icon={<Plus className="h-5 w-5" aria-hidden />}
          onClick={() => navigate(ROUTES.addIdea)}
        >
          רעיון חדש
        </Button>
      </div>
    </header>
  )
}
