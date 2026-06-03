export const APP_NAME = 'IdeaFlow'

export const CURRENT_USER = {
  name: 'רותם',
  displayName: 'אלכס',
  role: 'מנהל מוצר',
  avatarSrc:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDrSl7Hwy6X4u_FlFXQhMzglCRmE8VG9nyRtM6BwszewsCI1j5yy7fkefm98gdULFd6jj4Ncshjl0IhviwvW5mywyVPeQf7C0qiyysqVkmJ4wlgn5ZZp-5hGNjny-jmHGcaangKQEr5qOiyGsGZSTbQqL5ShiRvKS2n6Do46HDjgdeul9WfQhUFcAIstS8UKx2GY-yC_N0LXhZgS8zvMJ4Csem69To0bOhPBLAoQe90tySs6P_feko37PNZ7olLWiADZ2FYrOBiv_0',
} as const

export const ROUTES = {
  home: '/',
  ideas: '/ideas',
  ideaDetail: (id: string) => `/ideas/${id}`,
  addIdea: '/ideas/new',
  profile: '/profile',
} as const

export const STORAGE_KEY = 'ideaflow-ideas-v1'
