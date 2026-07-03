export interface MailForward {
  enabled: boolean
  addresses: string[]
  alwaysSend: boolean
  keepCopy: boolean
}

export interface ForwardFormValues {
  enabled: boolean
  emails: { value: string }[]
  email: string
  alwaysSend: boolean
  keepCopy: boolean
}
