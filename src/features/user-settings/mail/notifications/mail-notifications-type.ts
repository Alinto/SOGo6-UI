export interface MailNotification {
  enabled: boolean
  addresses: string[]
  message: string
}

export interface NotificationFormValues {
  enabled: boolean
  emails: { value: string }[]
  email: string
  message: string
}
