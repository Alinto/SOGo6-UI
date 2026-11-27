import type { MailSearchParams } from '../mails-types'
import type { MailListFilter } from './client-mail-list-filter'

const QUICK_FILTER_CRITERIA: Record<MailListFilter, MailSearchParams> = {
  read: { is_read: true },
  unread: { is_read: false },
  flagged: { is_flagged: true },
  attachments: { has_attachment: true },
}

/** Quick filter state of the mail list, as kept in the URL. */
export interface MailListQuickFilter {
  filter?: MailListFilter
  labels: string[]
}

/**
 * Search criteria of the active quick filters, shown in the search bar as
 * `is:read label:Work` tokens (`null` without quick filter). The quick
 * filters are a `match:all` search: a mail needs every chosen label.
 */
export function quickFilterToSearchParams(
  filter: MailListFilter | undefined,
  labels: string[]
): MailSearchParams | null {
  if (!filter && labels.length === 0) return null
  return {
    ...(filter ? QUICK_FILTER_CRITERIA[filter] : {}),
    ...(labels.length > 0 ? { labels } : {}),
  }
}

/**
 * Reverse of `quickFilterToSearchParams`: the quick filter expressing a
 * search typed in the bar, or `null` when it needs a real search (text
 * criteria, dates, another folder, several status filters, several labels
 * to match any of…). A search with no criteria at all gives an empty quick
 * filter.
 */
export function searchParamsToQuickFilter(
  params: MailSearchParams,
  folder: string
): MailListQuickFilter | null {
  const hasOtherCriteria = Boolean(
    hasMatchCriteria(params) ||
    params.attachment_type?.length ||
    params.date_range?.start ||
    params.date_range?.end ||
    params.size ||
    params.include_subfolders
  )
  if (hasOtherCriteria) return null
  if (params.folders?.length !== 1 || params.folders[0] !== folder) return null

  const statusFilters = getStatusFilters(params)
  if (statusFilters.length > 1) return null

  const labels = params.labels ?? []
  if (labels.length > 1 && params.operator === 'OR') return null

  return { filter: statusFilters[0], labels }
}

/** Status quick filters a search asks for (`is:read`, `has:attachment`…). */
function getStatusFilters(params: MailSearchParams): MailListFilter[] {
  const statusFilters: MailListFilter[] = []
  if (params.is_read !== undefined) {
    statusFilters.push(params.is_read ? 'read' : 'unread')
  }
  if (params.is_flagged) statusFilters.push('flagged')
  if (params.has_attachment) statusFilters.push('attachments')
  return statusFilters
}

/**
 * Status quick filter button matching a `match:all` search (`is:read
 * subject:invoice` selects "Read"). `undefined` for a `match:any` search, or
 * when the search asks for no status or for several of them, since only one
 * button can be selected.
 */
export function searchToStatusFilter(
  params: MailSearchParams
): MailListFilter | undefined {
  if (params.operator === 'OR') return undefined
  const statusFilters = getStatusFilters(params)
  return statusFilters.length === 1 ? statusFilters[0] : undefined
}

/**
 * Labels of the quick label filter matching a `match:all` search, where
 * every label is required (none for a `match:any` search).
 */
export function searchToLabelFilter(params: MailSearchParams): string[] {
  return params.operator === 'OR' ? [] : (params.labels ?? [])
}

/**
 * The search as a `match:all` one (no operator: the API defaults to AND).
 * A quick filter chosen during a `match:any` search turns it into this one
 * for good, so its criteria and labels all become required.
 */
export function toMatchAll(params: MailSearchParams): MailSearchParams {
  if (params.operator !== 'OR') return params
  const rest = { ...params }
  delete rest.operator
  return rest
}

/** Whether the search asks for a read, important or attachment status. */
export function hasStatusFilters(params: MailSearchParams): boolean {
  return getStatusFilters(params).length > 0
}

/**
 * The search without its status criteria: a status quick filter button
 * replaces them, only one status being chosen at a time.
 */
export function withoutStatusFilters(
  params: MailSearchParams
): MailSearchParams {
  const rest = { ...params }
  delete rest.is_read
  delete rest.is_flagged
  delete rest.has_attachment
  return rest
}

/** Search with the quick filters applied, see `applyQuickFilterToSearch`. */
export interface QuickFilteredSearch {
  params: MailSearchParams
  /** Labels the search cannot express: still filtered on the client. */
  clientLabels: string[]
  /** Whether the quick filters changed the search params. */
  applied: boolean
}

function hasMatchCriteria(params: MailSearchParams): boolean {
  return Boolean(
    params.text ||
    params.subject ||
    params.from?.length ||
    params.to?.length ||
    params.bcc?.length
  )
}

/**
 * Applies the quick filters of the list to an active search, so they filter
 * every page of its results on the server. The quick filters are `match:all`
 * and take priority over the search: with any of them, a `match:any` search
 * becomes a `match:all` one, then the status filter and every chosen label
 * are required. Choosing a quick filter already turns the stored search into
 * a `match:all` one (see `toMatchAll`); this also covers a URL combining
 * both, such as a shared link.
 */
export function applyQuickFilterToSearch(
  search: MailSearchParams,
  filter: MailListFilter | undefined,
  labels: string[]
): QuickFilteredSearch {
  if (!filter && labels.length === 0) {
    return { params: search, clientLabels: [], applied: false }
  }

  let params: MailSearchParams = {
    ...search,
    ...(filter ? QUICK_FILTER_CRITERIA[filter] : {}),
    ...(search.operator === 'OR' ? { operator: 'AND' as const } : {}),
  }

  // Labels the search already has are required by now.
  const searchLabels = search.labels ?? []
  const present = new Set(searchLabels.map((label) => label.toLowerCase()))
  const missing = labels.filter((label) => !present.has(label.toLowerCase()))
  if (missing.length > 0) {
    params = { ...params, labels: [...searchLabels, ...missing] }
  }

  const applied = JSON.stringify(params) !== JSON.stringify(search)
  return { params, clientLabels: [], applied }
}

/**
 * The folder list route has no quick filter, so a filtered list is a search
 * restricted to the current folder (subfolders excluded). It is a `match:all`
 * search: the status filter and every chosen label are required.
 */
export function toQuickFilterSearchBody(
  filter: MailListFilter | undefined,
  folder: string,
  labels: string[] = []
): MailSearchParams {
  return {
    ...(filter ? QUICK_FILTER_CRITERIA[filter] : {}),
    ...(labels.length > 0 ? { labels } : {}),
    folders: [folder],
    include_subfolders: false,
  }
}

/**
 * Query params of the filtered search: same page, page size, sort and light
 * fields as the folder list. Without a chosen sort the folder list shows the
 * newest mails first, while the search defaults to oldest first, so the date
 * order is sent explicitly.
 */
export function toQuickFilterSearchParams(
  listParams: Record<string, string>,
  page: number
): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page,
    sort_by: listParams.sort_by ?? 'date',
    sort_order: listParams.sort_order ?? 'desc',
  }
  for (const key of ['page_size', 'fields', 'fields_action']) {
    if (listParams[key] !== undefined) params[key] = listParams[key]
  }
  return params
}
