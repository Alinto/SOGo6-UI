export interface UserPreferences {
  theme: 'light' | 'dark'
  language: string
  notificationsEnabled: boolean
  itemsPerPage: number
  timezone?: string
  mailDisplayMode?: 'classic' | 'modern'
}
