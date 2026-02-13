export interface GeneralSettings {
  language: string
  timezone: string
  shortDateStyle: string
  longDateStyle: string
  timeStyle: string
  defaultView: string
  enableNotifications: boolean
  avatarEnabled: boolean
}

export interface ContactCategory {
  name: string
  color: string
  canBeTranslated: boolean
}

export type ContactGeneralSettings = {
  categories: ContactCategory[]
  creationNotification: boolean
}
