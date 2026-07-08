import type {
  ApiFilterAction,
  ApiFilterRuleNode,
} from './mail-filters-api-types'

export type FilterField =
  | 'from'
  | 'to'
  | 'cc'
  | 'to or cc'
  | 'subject'
  | 'header'
  | 'body'
  | 'size'

export type FilterOperator = 'AND' | 'OR' | 'ALL'

export type FilterCondition =
  | 'IS'
  | 'IS_NOT'
  | 'CONTAINS'
  | 'NOT_CONTAIN'
  | 'MATCH'
  | 'NOT_MATCH'
  | 'MATCH_REGEX'
  | 'NOT_REGEX'
  | 'EXISTS'
  | 'NOT_EXISTS'
  | 'SIZE_OVER'
  | 'SIZE_UNDER'

export type FilterActionType =
  | 'move'
  | 'copy'
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
  /** Original API rules preserved for advanced/read-only filters */
  rawRules?: ApiFilterRuleNode
}
