export interface MailForward {
  enabled: boolean
  emails: { value: string }[]
  email: string
  alwaysForward: boolean
  keepCopy: boolean
}
