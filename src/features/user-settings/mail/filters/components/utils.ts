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
    const key = condition.toLowerCase().replace(/_/g, '_')
    const translateMap: Record<string, string> = {
      IS: 'conditions.is.string',
      CONTAINS: 'conditions.contains.string',
      NOT_CONTAIN: 'conditions.not_contain.string',
      MATCH: 'conditions.match.string',
      MATCH_REGEX: 'conditions.match_regex.string',
    }
    return {
      id: `cond-${index}`,
      value: condition,
      translateKey: translateMap[condition] ?? `conditions.${key}.string`,
    }
  }
)

const actions: FilterOption[] = [
  { id: 'act-move', value: 'move', translateKey: 'actions.move.string' },
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
      !condition.useOnlyWith || condition.useOnlyWith.includes(field)
  )
}

export function isActionDisabled(action: string): boolean {
  return actions.some((item) => item.value === action && item.disabled)
}

export function getActionOption(action: FilterActionType | string) {
  return actions.find((item) => item.value === action)
}

export { actions, operators, ruleConditions, ruleFields }
