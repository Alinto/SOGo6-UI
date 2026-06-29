import type { BookEntriesQueryParams, BookEntriesResponse } from '../address-books-api-types'
import type { VCard } from '../address-books-types'
import { applyBookEntriesQuery, parseBookEntriesQueryFromSearchParams } from './apply-book-entries-query'
import { isDistributionList } from './distribution-list'
import { normalizeContactsList } from './normalize-contact'
import { parseXPaginationFromMeta } from './parse-x-pagination'

export const BOOK_ENTRIES_LIST_QUERY_KEYS = [
  'search',
  'page',
  'page_size',
  'sort_by',
  'sort_order',
] as const

export function hasBookEntriesListQuery(searchParams: URLSearchParams): boolean {
  return BOOK_ENTRIES_LIST_QUERY_KEYS.some((key) => searchParams.has(key))
}

export function buildBookEntriesPaginationHeaders(
  result: BookEntriesResponse
): Record<string, string> {
  return {
    'X-Pagination': JSON.stringify({
      total: result.contactTotal,
      total_pages: result.totalPages,
      page: result.page,
      first_page: 1,
      last_page: result.totalPages,
    }),
    'X-List-Total': String(result.listTotal),
  }
}

export function applyBookEntriesQueryFromSearchParams(
  items: VCard[],
  searchParams: URLSearchParams
): BookEntriesResponse {
  return applyBookEntriesQuery(
    items,
    parseBookEntriesQueryFromSearchParams(searchParams)
  )
}

/**
 * Builds a BookEntriesResponse from a legacy fakeApi list response.
 * Uses X-Pagination / X-List-Total when present; otherwise applies query in-memory.
 */
export function parseLegacyBookEntriesListResponse(
  data: unknown,
  meta: { response?: Response } | undefined,
  params?: BookEntriesQueryParams
): BookEntriesResponse {
  const items = normalizeContactsList(data as VCard[])
  const pagination = parseXPaginationFromMeta(meta)

  if (pagination) {
    const listTotalHeader = meta?.response?.headers?.get('X-List-Total')
    const parsedListTotal =
      listTotalHeader != null ? Number(listTotalHeader) : Number.NaN

    return {
      items,
      total: pagination.total,
      contactTotal: pagination.total,
      listTotal: Number.isFinite(parsedListTotal)
        ? parsedListTotal
        : items.filter(isDistributionList).length,
      page: pagination.page,
      totalPages: pagination.totalPages,
    }
  }

  return applyBookEntriesQuery(items, params)
}
