import type { ApiFilterAction } from './mail-filters-api-types'

export type FilterField = 'from' | 'to' | 'subject' | 'header' | 'size'

export type FilterOperator = 'AND' | 'OR' | 'ALL'

export type FilterCondition =
  | 'IS'
  | 'CONTAINS'
  | 'NOT_CONTAIN'
  | 'MATCH'
  | 'MATCH_REGEX'
  | 'STARTS_WITH'
  | 'ENDS_WITH'
  | 'EXISTS'
  | 'SIZE_OVER'

export type FilterActionType =
  | 'move'
  | 'copy'
  | 'forward'
  | 'stop'
  | 'keep'
  | 'discard'
  | 'removeheader'
  | 'flag'
  | 'reject'

export interface MailFilterRule {
  id: string
  field: FilterField | string
  field_value?: string
  condition: FilterCondition | string
  value: string
  case_sensitive?: boolean
}

export interface MailFilterAction {
  id: string
  action: FilterActionType | string
  value: string
  createIfNotExist?: boolean
  unsupportedAction?: boolean
  rawAction?: ApiFilterAction
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
