export type FilterField = 'from' | 'to' | 'subject' | 'header'

export type FilterOperator = 'AND' | 'OR' | 'ALL'

export type FilterCondition =
  | 'IS'
  | 'CONTAINS'
  | 'NOT_CONTAIN'
  | 'MATCH'
  | 'MATCH_REGEX'

export type FilterActionType =
  | 'move'
  | 'forward'
  | 'stop'
  | 'keep'
  | 'discard'
  | 'flag'
  | 'reject'

export interface MailFilterRule {
  id: string
  field: FilterField | string
  field_value?: string
  condition: FilterCondition | string
  value: string
}

export interface MailFilterAction {
  id: string
  action: FilterActionType | string
  value: string
  createIfNotExist?: boolean
}

export interface MailFilter {
  id: string
  name: string
  operator: FilterOperator
  enabled: boolean
  rules: MailFilterRule[]
  actions: MailFilterAction[]
  /** True when API rule tree cannot be edited safely in flat UI */
  advancedStructure?: boolean
  readOnly?: boolean
}
