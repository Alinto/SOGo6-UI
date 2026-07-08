import type {
  ApiFilterAction,
  ApiFilterActionArguments,
  ApiFilterItem,
  ApiFilterRuleGroup,
  ApiFilterRuleLeaf,
  ApiFilterRuleNode,
} from './mail-filters-api-types'
import {
  ADVANCED_FILTER_FIELDS,
  API_CONDITION_TO_UI,
  API_METHOD_TO_UI_ACTION,
  DEFAULT_CREATE_IF_NO_EXIST,
  DEFAULT_IMAP_FLAG,
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

export function stableHashFromString(input: string): string {
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash).toString(36)
}

export function stableFilterIdFromApiItem(item: ApiFilterItem): string {
  const payload = `${item.name}|${JSON.stringify(item.rules)}|${JSON.stringify(item.actions)}`
  return `filter-${stableHashFromString(payload)}`
}

function stableRuleIdFromLeaf(leaf: ApiFilterRuleLeaf): string {
  const payload = `${leaf.field}|${leaf.operator}|${leaf.custom_header ?? ''}|${leaf.value ?? ''}|${leaf.case_sensitive ?? true}`
  return `rule-${stableHashFromString(payload)}`
}

function stableActionIdFromApi(action: ApiFilterAction): string {
  return `action-${stableHashFromString(`${action.method}|${JSON.stringify(action.arguments)}`)}`
}

function isApiRuleGroup(node: ApiFilterRuleNode): node is ApiFilterRuleGroup {
  return 'op' in node && Array.isArray(node.rules)
}

function isApiRuleLeaf(node: ApiFilterRuleNode): node is ApiFilterRuleLeaf {
  return 'field' in node && !('op' in node)
}

function getFolderFromArguments(args: ApiFilterActionArguments): string {
  if (args.folders?.length) {
    return String(args.folders[0])
  }
  return String(args.folder ?? '')
}

function hasMultipleFolders(args: ApiFilterActionArguments): boolean {
  return (args.folders?.length ?? 0) > 1
}

function hasMultipleAddresses(args: ApiFilterActionArguments): boolean {
  const addresses = args.addresses?.length
    ? args.addresses
    : args.address
      ? [args.address]
      : []
  return addresses.length > 1
}

function mapApiLeafToUiRule(leaf: ApiFilterRuleLeaf): MailFilterRule {
  let condition =
    API_CONDITION_TO_UI[leaf.operator.toLowerCase()] ?? leaf.operator

  if (leaf.field === 'size') {
    if (leaf.operator === 'over') condition = 'SIZE_OVER'
    if (leaf.operator === 'under') condition = 'SIZE_UNDER'
  }

  return {
    id: stableRuleIdFromLeaf(leaf),
    field: leaf.field,
    field_value: leaf.custom_header,
    condition,
    value: leaf.value ?? '',
    case_sensitive: leaf.case_sensitive,
  }
}

function hasNestedGroups(node: ApiFilterRuleNode): boolean {
  if (!isApiRuleGroup(node)) return false
  return node.rules.some((child) => isApiRuleGroup(child))
}

function hasAdvancedFieldsInLeaves(node: ApiFilterRuleNode): boolean {
  if (isApiRuleLeaf(node)) {
    return ADVANCED_FILTER_FIELDS.has(node.field)
  }
  if (isApiRuleGroup(node)) {
    return node.rules.some((child) => hasAdvancedFieldsInLeaves(child))
  }
  return false
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
        advancedStructure: ADVANCED_FILTER_FIELDS.has(node.field),
      }
    }
    return { operator: 'AND', rules: [], advancedStructure: true }
  }

  if (hasNestedGroups(node) || hasAdvancedFieldsInLeaves(node)) {
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

  if (rule.case_sensitive !== undefined) {
    leaf.case_sensitive = rule.case_sensitive
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
  const method = action.method.toLowerCase()
  const args = action.arguments ?? {}

  if (method === 'copy') {
    return {
      id: stableActionIdFromApi(action),
      action: 'copy',
      value: getFolderFromArguments(args),
      createIfNotExist:
        args.create_if_no_exist !== undefined
          ? Boolean(args.create_if_no_exist)
          : DEFAULT_CREATE_IF_NO_EXIST,
      unsupportedAction: hasMultipleFolders(args),
      rawAction: hasMultipleFolders(args) ? action : undefined,
    }
  }

  if (method === 'fileinto') {
    const isCopy = Boolean(args.keep_copy)
    return {
      id: stableActionIdFromApi(action),
      action: isCopy ? 'copy' : 'move',
      value: getFolderFromArguments(args),
      createIfNotExist:
        args.create_if_no_exist !== undefined
          ? Boolean(args.create_if_no_exist)
          : DEFAULT_CREATE_IF_NO_EXIST,
      unsupportedAction: hasMultipleFolders(args),
      rawAction: hasMultipleFolders(args) ? action : undefined,
    }
  }

  if (method === 'addflag' || method === 'imapflags') {
    const flags = args.flags ?? []
    return {
      id: stableActionIdFromApi(action),
      action: 'flag',
      value: flags.length > 0 ? String(flags[0]) : DEFAULT_IMAP_FLAG,
    }
  }

  if (method === 'reject') {
    return {
      id: stableActionIdFromApi(action),
      action: 'reject',
      value: String(args.message ?? ''),
    }
  }

  const uiAction = API_METHOD_TO_UI_ACTION[method]

  if (!uiAction) {
    return {
      id: stableActionIdFromApi(action),
      action: action.method,
      value: '',
      unsupportedAction: true,
      rawAction: action,
    }
  }

  if (uiAction === 'forward') {
    const address =
      args.addresses?.[0] ?? args.address ?? ''
    return {
      id: stableActionIdFromApi(action),
      action: 'forward',
      value: String(address),
      unsupportedAction: hasMultipleAddresses(args),
      rawAction: hasMultipleAddresses(args) ? action : undefined,
    }
  }

  return {
    id: stableActionIdFromApi(action),
    action: uiAction,
    value: '',
  }
}

function mapUiActionToApi(action: MailFilterAction): ApiFilterAction | null {
  if (action.unsupportedAction && action.rawAction) {
    return action.rawAction
  }

  if (action.action === 'flag') {
    const flag = action.value.trim() || DEFAULT_IMAP_FLAG
    return {
      method: 'addflag',
      arguments: { flags: [flag] },
    }
  }

  if (action.action === 'reject') {
    return {
      method: 'reject',
      arguments: action.value.trim()
        ? { message: action.value }
        : {},
    }
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
        folders: action.value ? [action.value] : [],
        create_if_no_exist:
          action.createIfNotExist ?? DEFAULT_CREATE_IF_NO_EXIST,
        keep_copy: false,
      },
    }
  }

  if (action.action === 'copy') {
    return {
      method: 'fileinto',
      arguments: {
        folders: action.value ? [action.value] : [],
        create_if_no_exist:
          action.createIfNotExist ?? DEFAULT_CREATE_IF_NO_EXIST,
        keep_copy: true,
      },
    }
  }

  if (action.action === 'forward') {
    return {
      method: 'redirect',
      arguments: { addresses: action.value ? [action.value] : [] },
    }
  }

  return { method, arguments: {} }
}

export function mapApiFilterToUi(item: ApiFilterItem): MailFilter {
  const { operator, rules, advancedStructure } = mapApiRuleTreeToFlatRules(
    item.rules
  )
  const actions = item.actions.map(mapApiActionToUi)
  const hasUnsupportedActions = actions.some(
    (action) => action.unsupportedAction
  )
  const isAdvanced = advancedStructure || hasUnsupportedActions

  return {
    id: stableFilterIdFromApiItem(item),
    name: item.name,
    operator,
    enabled: Boolean(item.enabled),
    rules,
    actions,
    advancedStructure: isAdvanced,
    readOnly: isAdvanced,
    rawRules: isAdvanced ? item.rules : undefined,
  }
}

export function mapUiFilterToApi(filter: MailFilter): ApiFilterItem {
  const supportedActions = filter.actions
    .map(mapUiActionToApi)
    .filter((action): action is ApiFilterAction => action !== null)

  const rules =
    filter.readOnly && filter.rawRules
      ? filter.rawRules
      : mapFlatRulesToApiTree(filter.operator, filter.rules)

  return {
    name: filter.name,
    enabled: filter.enabled,
    rules,
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
