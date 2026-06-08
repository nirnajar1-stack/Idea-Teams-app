export interface UserPreferences {
  userId: string
  notifyIdeaChat: boolean
  notifyGeneralMentions: boolean
  notifyReplies: boolean
  notifyTargetDate: boolean
  notifyEmailCompleted: boolean
  emailNotifications: boolean
}

export const DEFAULT_USER_PREFERENCES: Omit<UserPreferences, 'userId'> = {
  notifyIdeaChat: true,
  notifyGeneralMentions: true,
  notifyReplies: true,
  notifyTargetDate: true,
  notifyEmailCompleted: true,
  emailNotifications: false,
}
