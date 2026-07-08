export type ApiFilterField =
  | 'from'
  | 'to'
  | 'cc'
  | 'to or cc'
  | 'subject'
  | 'header'
  | 'body'
  | 'size'

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
  | 'reject'
  | 'discard'
  | 'keep'
  | 'addflag'
  | 'notify'
  | 'stop'

export interface ApiFilterActionArguments {
  folders?: string[]
  folder?: string
  create_if_no_exist?: boolean
  keep_copy?: boolean
  addresses?: string[]
  address?: string
  message?: string
  flags?: string[]
  method?: string
  priority?: string
  message_text?: string
  header_name?: string
}

export interface ApiFilterAction {
  method: ApiFilterActionMethod | string
  arguments: ApiFilterActionArguments
}

export interface ApiFilterItem {
  name: string
  enabled: boolean | 0 | 1
  rules: ApiFilterRuleNode
  actions: ApiFilterAction[]
}

export interface ApiFiltersResponse {
  filters: ApiFilterItem[]
}

export type { BackendResponse } from '@/lib/api/backend-response'
