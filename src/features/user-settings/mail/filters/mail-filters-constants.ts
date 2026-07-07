import type {
  FilterActionType,
  FilterCondition,
  FilterField,
  FilterOperator,
} from './mail-filters-types'

export const V1_FILTER_FIELDS: FilterField[] = [
  'from',
  'to',
  'subject',
  'header',
  'size',
]

export const V1_FILTER_CONDITIONS: FilterCondition[] = [
  'IS',
  'CONTAINS',
  'NOT_CONTAIN',
  'MATCH',
  'MATCH_REGEX',
  'STARTS_WITH',
  'ENDS_WITH',
  'EXISTS',
  'SIZE_OVER',
]

export const UI_CONDITION_TO_API: Record<FilterCondition, string> = {
  IS: 'is',
  CONTAINS: 'contains',
  NOT_CONTAIN: 'not-contains',
  MATCH: 'matches',
  MATCH_REGEX: 'regex',
  STARTS_WITH: 'starts-with',
  ENDS_WITH: 'ends-with',
  EXISTS: 'exists',
  SIZE_OVER: 'size',
}

export const API_CONDITION_TO_UI: Record<string, FilterCondition> = {
  is: 'IS',
  contains: 'CONTAINS',
  'not-contains': 'NOT_CONTAIN',
  not_contains: 'NOT_CONTAIN',
  notcontains: 'NOT_CONTAIN',
  matches: 'MATCH',
  regex: 'MATCH_REGEX',
  'starts-with': 'STARTS_WITH',
  starts_with: 'STARTS_WITH',
  startswith: 'STARTS_WITH',
  'ends-with': 'ENDS_WITH',
  ends_with: 'ENDS_WITH',
  endswith: 'ENDS_WITH',
  exists: 'EXISTS',
  size: 'SIZE_OVER',
}

export const UI_ACTION_TO_API_METHOD: Record<
  Exclude<FilterActionType, 'flag' | 'reject'>,
  string
> = {
  move: 'fileinto',
  copy: 'copy',
  forward: 'redirect',
  stop: 'stop',
  keep: 'keep',
  discard: 'discard',
  removeheader: 'removeheader',
}

export const API_METHOD_TO_UI_ACTION: Record<string, FilterActionType> = {
  fileinto: 'move',
  copy: 'copy',
  redirect: 'forward',
  stop: 'stop',
  keep: 'keep',
  discard: 'discard',
  removeheader: 'removeheader',
}

export const FILTER_OPERATORS: FilterOperator[] = ['AND', 'OR', 'ALL']

export const DEFAULT_CREATE_IF_NO_EXIST = true

export const FILTER_NAME_MAX_LENGTH = 128
