import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { CURRENT_USER, ROUTES } from '../../constants/app'
import { Button } from '../ui/Button'

export interface WelcomeHeroProps {
  userName?: string
  description?: string
}

export function WelcomeHero({
  userName = CURRENT_USER.name,
  description = 'ברוכים הבאים ללוח הבקרה של IdeaFlow. כאן תוכלו לנהל את מאגר הרעיונות שלכם ולעקוב אחר התקדמות הפיתוח.',
}: WelcomeHeroProps) {
  const navigate = useNavigate()

  return (
    <header className="mb-10">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="mb-2 font-display text-headline-lg-mobile text-on-surface md:text-headline-lg">
            שלום, {userName}
          </h1>
          <p className="max-w-lg font-body-md text-secondary">{description}</p>
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
