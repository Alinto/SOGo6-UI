import type {
  ApiFilterAction,
  ApiFilterItem,
  ApiFilterRuleGroup,
  ApiFilterRuleLeaf,
  ApiFilterRuleNode,
  BackendResponse,
} from './mail-filters-api-types'
import {
  API_CONDITION_TO_UI,
  API_METHOD_TO_UI_ACTION,
  DEFAULT_CREATE_IF_NO_EXIST,
  UI_ACTION_TO_API_METHOD,
  UI_CONDITION_TO_API,
} from './mail-filters-constants'
import type {
  FilterCondition,
  FilterOperator,
  MailFilter,
  MailFilterAction,
  MailFilterRule,
} from './mail-filters-types'

let filterIdCounter = 0

export function generateFilterId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  filterIdCounter += 1
  return `filter-${filterIdCounter}`
}

export function unwrapBackendResponse<T>(raw: T | BackendResponse<T>): T {
  if (raw && typeof raw === 'object' && 'data' in raw) {
    return (raw as BackendResponse<T>).data
  }
  return raw as T
}

function isApiRuleGroup(node: ApiFilterRuleNode): node is ApiFilterRuleGroup {
  return 'op' in node && Array.isArray(node.rules)
}

function isApiRuleLeaf(node: ApiFilterRuleNode): node is ApiFilterRuleLeaf {
  return 'field' in node && !('op' in node)
}

function mapApiLeafToUiRule(leaf: ApiFilterRuleLeaf): MailFilterRule {
  const condition =
    API_CONDITION_TO_UI[leaf.operator.toLowerCase()] ?? leaf.operator

  return {
    id: generateFilterId(),
    field: leaf.field,
    field_value: leaf.custom_header,
    condition,
    value: leaf.value ?? '',
  }
}

function hasNestedGroups(node: ApiFilterRuleNode): boolean {
  if (!isApiRuleGroup(node)) return false
  return node.rules.some((child) => isApiRuleGroup(child))
}

export function mapApiRuleTreeToFlatRules(node: ApiFilterRuleNode): {
  operator: FilterOperator
  rules: MailFilterRule[]
  advancedStructure: boolean
} {
  if (!isApiRuleGroup(node)) {
    if (isApiRuleLeaf(node)) {
      return {
        operator: 'AND',
        rules: [mapApiLeafToUiRule(node)],
        advancedStructure: false,
      }
    }
    return { operator: 'AND', rules: [], advancedStructure: true }
  }

  if (hasNestedGroups(node)) {
    return { operator: 'AND', rules: [], advancedStructure: true }
  }

  if (node.rules.length === 0) {
    return { operator: 'ALL', rules: [], advancedStructure: false }
  }

  const operator: FilterOperator =
    node.op === 'or' ? 'OR' : node.op === 'and' ? 'AND' : 'AND'

  const rules = node.rules
    .filter(isApiRuleLeaf)
    .map((leaf) => mapApiLeafToUiRule(leaf))

  return { operator, rules, advancedStructure: false }
}

function mapUiRuleToApiLeaf(rule: MailFilterRule): ApiFilterRuleLeaf {
  const condition = rule.condition as FilterCondition
  const operator =
    UI_CONDITION_TO_API[condition] ?? String(rule.condition).toLowerCase()

  const leaf: ApiFilterRuleLeaf = {
    field: rule.field,
    operator,
    value: rule.value,
  }

  if (rule.field === 'header' && rule.field_value) {
    leaf.custom_header = rule.field_value
  }

  return leaf
}

export function mapFlatRulesToApiTree(
  operator: FilterOperator,
  rules: MailFilterRule[]
): ApiFilterRuleNode {
  if (operator === 'ALL') {
    return { op: 'and', rules: [] }
  }

  const leaves = rules.map(mapUiRuleToApiLeaf)
  return {
    op: operator === 'OR' ? 'or' : 'and',
    rules: leaves,
  }
}

function mapApiActionToUi(action: ApiFilterAction): MailFilterAction {
  const uiAction = API_METHOD_TO_UI_ACTION[action.method.toLowerCase()]

  if (!uiAction) {
    return {
      id: generateFilterId(),
      action: action.method,
      value: '',
    }
  }

  if (uiAction === 'move') {
    const folder = String(action.arguments.folder ?? '')
    return {
      id: generateFilterId(),
      action: 'move',
      value: folder,
      createIfNotExist:
        action.arguments.create_if_no_exist !== undefined
          ? Boolean(action.arguments.create_if_no_exist)
          : DEFAULT_CREATE_IF_NO_EXIST,
    }
  }

  if (uiAction === 'forward') {
    return {
      id: generateFilterId(),
      action: 'forward',
      value: String(action.arguments.address ?? ''),
    }
  }

  return {
    id: generateFilterId(),
    action: uiAction,
    value: '',
  }
}

function mapUiActionToApi(action: MailFilterAction): ApiFilterAction | null {
  if (action.action === 'flag' || action.action === 'reject') {
    return null
  }

  const method =
    UI_ACTION_TO_API_METHOD[
      action.action as keyof typeof UI_ACTION_TO_API_METHOD
    ]

  if (!method) {
    return null
  }

  if (action.action === 'move') {
    return {
      method: 'fileinto',
      arguments: {
        folder: action.value,
        create_if_no_exist:
          action.createIfNotExist ?? DEFAULT_CREATE_IF_NO_EXIST,
      },
    }
  }

  if (action.action === 'forward') {
    return {
      method: 'redirect',
      arguments: { address: action.value },
    }
  }

  return { method, arguments: {} }
}

export function mapApiFilterToUi(item: ApiFilterItem): MailFilter {
  const { operator, rules, advancedStructure } = mapApiRuleTreeToFlatRules(
    item.rules
  )

  return {
    id: generateFilterId(),
    name: item.name,
    operator,
    enabled: Boolean(item.enabled),
    rules,
    actions: item.actions.map(mapApiActionToUi),
    advancedStructure,
    readOnly: advancedStructure,
  }
}

export function mapUiFilterToApi(filter: MailFilter): ApiFilterItem {
  const supportedActions = filter.actions
    .map(mapUiActionToApi)
    .filter((action): action is ApiFilterAction => action !== null)

  return {
    name: filter.name,
    enabled: filter.enabled ? 1 : 0,
    rules: mapFlatRulesToApiTree(filter.operator, filter.rules),
    actions: supportedActions,
  }
}

export function mapApiFiltersToUi(apiItems: ApiFilterItem[]): MailFilter[] {
  return apiItems.map(mapApiFilterToUi)
}

export function mapUiFiltersToApi(uiFilters: MailFilter[]): ApiFilterItem[] {
  return uiFilters.map(mapUiFilterToApi)
}

export function createEmptyFilter(): MailFilter {
  return {
    id: generateFilterId(),
    name: '',
    operator: 'AND',
    enabled: true,
    rules: [
      {
        id: generateFilterId(),
        field: 'from',
        condition: 'CONTAINS',
        value: '',
      },
    ],
    actions: [
      {
        id: generateFilterId(),
        action: 'move',
        value: '',
        createIfNotExist: DEFAULT_CREATE_IF_NO_EXIST,
      },
    ],
  }
}
