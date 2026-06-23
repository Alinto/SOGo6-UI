import type { ApiContactsListData } from '../address-books-api-types'
import type { VCard } from '../address-books-types'
import { addressBookContactsPath } from './api-routes'
import { buildContactsByKey } from './normalize-list'
import { normalizeContactsList } from './normalize-contact'
import { parseXPaginationFromMeta } from './parse-x-pagination'
import { unwrapApiData } from './unwrap-api-data'

export const CONTACT_LOOKUP_PAGE_SIZE = 200
export const CONTACT_LOOKUP_MAX = 5000
export const FULL_LISTS_PAGE_SIZE = 500

type BaseQueryResult = {
  data?: unknown
  error?: unknown
  meta?: { response?: Response }
}

type BaseQueryFn = (arg: {
  url: string
  params?: Record<string, string | number>
}) => Promise<BaseQueryResult>

function parseContactsPayload(payload: unknown): VCard[] {
  const data = unwrapApiData(payload as ApiContactsListData)
  if (Array.isArray(data)) {
    return normalizeContactsList(data)
  }
  return normalizeContactsList(
    (data as ApiContactsListData).contacts ?? []
  )
}

export async function fetchContactLookupMap(
  bookId: string,
  baseQuery: BaseQueryFn
): Promise<Map<string, VCard>> {
  const map = new Map<string, VCard>()
  let page = 1
  let totalPages = 1

  while (page <= totalPages && map.size < CONTACT_LOOKUP_MAX) {
    const result = await baseQuery({
      url: addressBookContactsPath(bookId),
      params: {
        page,
        page_size: CONTACT_LOOKUP_PAGE_SIZE,
        sort_by: 'display_name',
        sort_order: 'asc',
      },
    })

    if (result.error) break

    const contacts = parseContactsPayload(result.data)
    for (const [key, contact] of buildContactsByKey(contacts)) {
      map.set(key, contact)
    }

    const pagination = parseXPaginationFromMeta(result.meta)
    totalPages = pagination?.totalPages ?? 1
    page += 1

    if (contacts.length === 0) break
  }

  return map
}
