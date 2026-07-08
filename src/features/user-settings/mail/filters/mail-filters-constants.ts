import type {
  FilterActionType,
  FilterCondition,
  FilterField,
  FilterOperator,
} from './mail-filters-types'

export const V1_FILTER_FIELDS: FilterField[] = [
  'from',
  'to',
  'cc',
  'to or cc',
  'subject',
  'header',
  'body',
  'size',
]

export const V1_FILTER_CONDITIONS: FilterCondition[] = [
  'IS',
  'IS_NOT',
  'CONTAINS',
  'NOT_CONTAIN',
  'MATCH',
  'NOT_MATCH',
  'MATCH_REGEX',
  'NOT_REGEX',
  'EXISTS',
  'NOT_EXISTS',
  'SIZE_OVER',
  'SIZE_UNDER',
]

export const UI_CONDITION_TO_API: Record<FilterCondition, string> = {
  IS: 'is',
  IS_NOT: 'notis',
  CONTAINS: 'contains',
  NOT_CONTAIN: 'notcontains',
  MATCH: 'matches',
  NOT_MATCH: 'notmatches',
  MATCH_REGEX: 'regex',
  NOT_REGEX: 'notregex',
  EXISTS: 'exists',
  NOT_EXISTS: 'notexists',
  SIZE_OVER: 'over',
  SIZE_UNDER: 'under',
}

export const API_CONDITION_TO_UI: Record<string, FilterCondition> = {
  is: 'IS',
  notis: 'IS_NOT',
  contains: 'CONTAINS',
  notcontains: 'NOT_CONTAIN',
  'not-contains': 'NOT_CONTAIN',
  not_contains: 'NOT_CONTAIN',
  matches: 'MATCH',
  notmatches: 'NOT_MATCH',
  regex: 'MATCH_REGEX',
  notregex: 'NOT_REGEX',
  exists: 'EXISTS',
  notexists: 'NOT_EXISTS',
  over: 'SIZE_OVER',
  under: 'SIZE_UNDER',
  size: 'SIZE_OVER',
}

export const UI_ACTION_TO_API_METHOD: Record<FilterActionType, string> = {
  move: 'fileinto',
  copy: 'fileinto',
  forward: 'redirect',
  stop: 'stop',
  keep: 'keep',
  discard: 'discard',
  flag: 'addflag',
  reject: 'reject',
}

export const API_METHOD_TO_UI_ACTION: Record<string, FilterActionType> = {
  fileinto: 'move',
  redirect: 'forward',
  stop: 'stop',
  keep: 'keep',
  discard: 'discard',
  addflag: 'flag',
  reject: 'reject',
}

export const FILTER_OPERATORS: FilterOperator[] = ['AND', 'OR', 'ALL']

export const DEFAULT_CREATE_IF_NO_EXIST = true

export const FILTER_NAME_MAX_LENGTH = 128

export const DEFAULT_IMAP_FLAG = '\\Flagged'

export const ADVANCED_FILTER_FIELDS = new Set<string>(['cc', 'to or cc', 'body'])
