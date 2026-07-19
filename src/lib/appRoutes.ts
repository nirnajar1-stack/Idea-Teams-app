import { EMBED_ROUTES, ROUTES } from '../constants/app'

function embedPath(path: string): string {
  if (path.startsWith('/embed')) return path
  return `/embed${path}`
}

export type AppRoutes = {
  login: string
  home: string
  ideas: string
  inbox: string
  ideaDetail: (id: string) => string
  editIdea: (id: string) => string
  addIdea: string
  addSubIdea: (parentId: string) => string
  profile: string
  users: string
  timeline: string
}

export function getAppRoutes(isEmbed: boolean): AppRoutes {
  if (!isEmbed) return ROUTES

  return {
    login: EMBED_ROUTES.login,
    home: EMBED_ROUTES.home,
    ideas: EMBED_ROUTES.ideas,
    inbox: embedPath(ROUTES.inbox),
    ideaDetail: (id: string) => embedPath(ROUTES.ideaDetail(id)),
    editIdea: (id: string) => embedPath(ROUTES.editIdea(id)),
    addIdea: embedPath(ROUTES.addIdea),
    addSubIdea: (parentId: string) => embedPath(ROUTES.addSubIdea(parentId)),
    profile: embedPath(ROUTES.profile),
    users: embedPath(ROUTES.users),
    timeline: EMBED_ROUTES.timeline,
  }
}
