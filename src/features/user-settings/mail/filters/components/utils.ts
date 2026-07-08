import {
  V1_FILTER_CONDITIONS,
  V1_FILTER_FIELDS,
} from '../mail-filters-constants'
import type { FilterActionType } from '../mail-filters-types'

export interface FilterOption {
  id: string
  value: string
  translateKey: string
  disabled?: boolean
  disabledReasonKey?: string
  useOnlyWith?: string[]
  excludeForFields?: string[]
}

const operators: FilterOption[] = [
  { id: 'op-or', value: 'OR', translateKey: 'operators.or.string' },
  { id: 'op-and', value: 'AND', translateKey: 'operators.and.string' },
  { id: 'op-all', value: 'ALL', translateKey: 'operators.all.string' },
]

const ruleFields: FilterOption[] = V1_FILTER_FIELDS.map((field, index) => {
  const translateKey =
    field === 'header'
      ? 'rules.header.string'
      : field === 'to or cc'
        ? 'rules.to_or_cc.string'
        : `rules.${field}.string`
  return {
    id: `field-${index}`,
    value: field,
    translateKey,
  }
})

const ruleConditions: FilterOption[] = V1_FILTER_CONDITIONS.map(
  (condition, index) => {
    const translateMap: Record<string, string> = {
      IS: 'conditions.is.string',
      IS_NOT: 'conditions.is_not.string',
      CONTAINS: 'conditions.contains.string',
      NOT_CONTAIN: 'conditions.not_contain.string',
      MATCH: 'conditions.match.string',
      NOT_MATCH: 'conditions.not_match.string',
      MATCH_REGEX: 'conditions.match_regex.string',
      NOT_REGEX: 'conditions.not_match_regex.string',
      EXISTS: 'conditions.exists.string',
      NOT_EXISTS: 'conditions.not_exists.string',
      SIZE_OVER: 'conditions.size_over.string',
      SIZE_UNDER: 'conditions.size_under.string',
    }
    const useOnlyWithMap: Record<string, string[]> = {
      EXISTS: ['header'],
      NOT_EXISTS: ['header'],
      SIZE_OVER: ['size'],
      SIZE_UNDER: ['size'],
    }
    const excludeForFieldsMap: Record<string, string[]> = {
      IS: ['size'],
      IS_NOT: ['size'],
      CONTAINS: ['size'],
      NOT_CONTAIN: ['size'],
      MATCH: ['size'],
      NOT_MATCH: ['size'],
      MATCH_REGEX: ['size'],
      NOT_REGEX: ['size'],
      EXISTS: ['size'],
      NOT_EXISTS: ['size'],
      SIZE_OVER: ['from', 'to', 'cc', 'to or cc', 'subject', 'header', 'body'],
      SIZE_UNDER: ['from', 'to', 'cc', 'to or cc', 'subject', 'header', 'body'],
    }
    return {
      id: `cond-${index}`,
      value: condition,
      translateKey:
        translateMap[condition] ?? `conditions.${condition.toLowerCase()}.string`,
      useOnlyWith: useOnlyWithMap[condition],
      excludeForFields: excludeForFieldsMap[condition],
    }
  }
)

const actions: FilterOption[] = [
  { id: 'act-move', value: 'move', translateKey: 'actions.move.string' },
  { id: 'act-copy', value: 'copy', translateKey: 'actions.copy.string' },
  { id: 'act-stop', value: 'stop', translateKey: 'actions.stop.string' },
  { id: 'act-flag', value: 'flag', translateKey: 'actions.flag.string' },
  { id: 'act-keep', value: 'keep', translateKey: 'actions.keep.string' },
  {
    id: 'act-discard',
    value: 'discard',
    translateKey: 'actions.discard.string',
  },
  {
    id: 'act-forward',
    value: 'forward',
    translateKey: 'actions.forward.string',
  },
  {
    id: 'act-reject',
    value: 'reject',
    translateKey: 'actions.reject.string',
  },
]

export function getConditionsForField(field: string): FilterOption[] {
  return ruleConditions.filter(
    (condition) =>
      (!condition.useOnlyWith || condition.useOnlyWith.includes(field)) &&
      (!condition.excludeForFields ||
        !condition.excludeForFields.includes(field))
  )
}

export function getActionOption(action: string): FilterOption | undefined {
  return actions.find((item) => item.value === action)
}

export { actions, operators, ruleFields, ruleConditions }

export type { FilterActionType }
