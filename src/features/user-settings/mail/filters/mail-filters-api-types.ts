export type ApiFilterField = 'from' | 'to' | 'subject' | 'header'

export interface ApiFilterRuleLeaf {
  field: ApiFilterField | string
  operator: string
  value: string
  custom_header?: string
  case_sensitive?: boolean
}

export interface ApiFilterRuleGroup {
  op: 'and' | 'or'
  rules: ApiFilterRuleNode[]
}

export type ApiFilterRuleNode = ApiFilterRuleLeaf | ApiFilterRuleGroup

export type ApiFilterActionMethod =
  | 'fileinto'
  | 'redirect'
  | 'keep'
  | 'discard'
  | 'stop'
  | 'copy'
  | 'removeheader'

export interface ApiFilterAction {
  method: ApiFilterActionMethod | string
  arguments: Record<string, unknown>
}

export interface ApiFilterItem {
  name: string
  enabled: 0 | 1
  rules: ApiFilterRuleNode
  actions: ApiFilterAction[]
}

export interface ApiFiltersResponse {
  filters: ApiFilterItem[]
}

export type { BackendResponse } from '@/lib/api/backend-response'
