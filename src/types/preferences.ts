export interface UserPreferences {
  userId: string
  notifyIdeaChat: boolean
  notifyGeneralMentions: boolean
  notifyReplies: boolean
  notifyTargetDate: boolean
  notifyWhatsappCompleted: boolean
  emailNotifications: boolean
}

export const DEFAULT_USER_PREFERENCES: Omit<UserPreferences, 'userId'> = {
  notifyIdeaChat: true,
  notifyGeneralMentions: true,
  notifyReplies: true,
  notifyTargetDate: true,
  notifyWhatsappCompleted: true,
  emailNotifications: false,
}
