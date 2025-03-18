export interface MailFilterRule {
  id: string
  field: string
  field_value?: string
  condition: string
  value: string
}

export interface MailFilterAction {
  id: string
  action: string
  value: string
}

export interface MailFilter {
  id: string
  name: string
  operator: string
  enabled: boolean
  rules: MailFilterRule[]
  actions: MailFilterAction[]
}
