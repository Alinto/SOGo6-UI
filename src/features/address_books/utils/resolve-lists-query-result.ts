import type { ParsedPagination } from './parse-x-pagination'
import { parseXPaginationFromMeta } from './parse-x-pagination'

export type ListsQueryResult = {
  data?: unknown
  error?: unknown
  meta?: { response?: Response }
}

const EMPTY_LISTS_PAYLOAD = { data: { lists: [] } }

/** Lists are optional. A failed lists request still leaves contacts visible. */
export function resolveListsQueryResult(listsResult: ListsQueryResult): {
  payload: unknown
  pagination: ParsedPagination | null
} {
  if (listsResult.error) {
    return { payload: EMPTY_LISTS_PAYLOAD, pagination: null }
  }

  return {
    payload: listsResult.data,
    pagination: parseXPaginationFromMeta(listsResult.meta),
  }
}
