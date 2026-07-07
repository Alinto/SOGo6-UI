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

const ruleFields: FilterOption[] = V1_FILTER_FIELDS.map((field, index) => ({
  id: `field-${index}`,
  value: field,
  translateKey: `rules.${field === 'header' ? 'header' : field}.string`,
}))

const ruleConditions: FilterOption[] = V1_FILTER_CONDITIONS.map(
  (condition, index) => {
    const translateMap: Record<string, string> = {
      IS: 'conditions.is.string',
      CONTAINS: 'conditions.contains.string',
      NOT_CONTAIN: 'conditions.not_contain.string',
      MATCH: 'conditions.match.string',
      MATCH_REGEX: 'conditions.match_regex.string',
      STARTS_WITH: 'conditions.starts_with.string',
      ENDS_WITH: 'conditions.ends_with.string',
      EXISTS: 'conditions.exists.string',
      SIZE_OVER: 'conditions.size_over.string',
    }
    const useOnlyWithMap: Record<string, string[]> = {
      EXISTS: ['header'],
      SIZE_OVER: ['size'],
    }
    const excludeForFieldsMap: Record<string, string[]> = {
      IS: ['size'],
      CONTAINS: ['size'],
      NOT_CONTAIN: ['size'],
      MATCH: ['size'],
      MATCH_REGEX: ['size'],
      STARTS_WITH: ['size'],
      ENDS_WITH: ['size'],
      EXISTS: ['size'],
    }
    return {
      id: `cond-${index}`,
      value: condition,
      translateKey: translateMap[condition] ?? `conditions.${condition.toLowerCase()}.string`,
      useOnlyWith: useOnlyWithMap[condition],
      excludeForFields: excludeForFieldsMap[condition],
    }
  }
)

const actions: FilterOption[] = [
  { id: 'act-move', value: 'move', translateKey: 'actions.move.string' },
  { id: 'act-copy', value: 'copy', translateKey: 'actions.copy.string' },
  { id: 'act-stop', value: 'stop', translateKey: 'actions.stop.string' },
  {
    id: 'act-flag',
    value: 'flag',
    translateKey: 'actions.flag.string',
    disabled: true,
    disabledReasonKey: 'actions.flag.disabled_tooltip.string',
  },
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
    id: 'act-removeheader',
    value: 'removeheader',
    translateKey: 'actions.removeheader.string',
  },
  {
    id: 'act-reject',
    value: 'reject',
    translateKey: 'actions.reject.string',
    disabled: true,
    disabledReasonKey: 'actions.reject.disabled_tooltip.string',
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
