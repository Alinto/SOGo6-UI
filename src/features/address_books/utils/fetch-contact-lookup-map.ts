import type {
  ApiContactsListData,
  ApiDistributionList,
  ApiListsCollectionData,
} from '../address-books-api-types'
import {
  ALL_CONTACTS_BOOK_ID,
  CONTACT_LOOKUP_MAX,
  CONTACT_LOOKUP_PAGE_SIZE,
} from '../address-books-constants'
import type { VCard } from '../address-books-types'
import {
  addressBookContactPath,
  addressBookContactsPath,
  addressBookListsPath,
  allContactsPath,
} from './api-routes'
import { normalizeContact, normalizeContactsList } from './normalize-contact'
import { buildContactsByKey } from './normalize-list'
import { parseXPaginationFromMeta } from './parse-x-pagination'
import { unwrapApiData } from './unwrap-api-data'

export {
  CONTACT_LOOKUP_MAX,
  CONTACT_LOOKUP_PAGE_SIZE,
} from '../address-books-constants'

type BaseQueryResult = {
  data?: unknown
  error?: unknown
  meta?: { response?: Response }
}

export type FetchLoopOptions = {
  signal?: AbortSignal
}

type BaseQueryArg = {
  url: string
  params?: Record<string, string | number>
  signal?: AbortSignal
}

type BaseQueryFn = (arg: BaseQueryArg) => Promise<BaseQueryResult>

function parseContactsPayload(payload: unknown): VCard[] {
  const data = unwrapApiData(payload as ApiContactsListData)
  if (Array.isArray(data)) {
    return normalizeContactsList(data)
  }
  return normalizeContactsList((data as ApiContactsListData).contacts ?? [])
}

function contactCollectionPath(bookId: string): string {
  return bookId === ALL_CONTACTS_BOOK_ID
    ? allContactsPath()
    : addressBookContactsPath(bookId)
}

export async function fetchContactLookupMap(
  bookId: string,
  baseQuery: BaseQueryFn,
  options?: FetchLoopOptions
): Promise<Map<string, VCard>> {
  const map = new Map<string, VCard>()
  let page = 1
  let totalPages = 1

  while (page <= totalPages && map.size < CONTACT_LOOKUP_MAX) {
    if (options?.signal?.aborted) break

    const result = await baseQuery({
      url: contactCollectionPath(bookId),
      params: {
        page,
        page_size: CONTACT_LOOKUP_PAGE_SIZE,
        sort_by: 'display_name',
        sort_order: 'asc',
      },
      signal: options?.signal,
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

export async function fetchContactsByKeys(
  bookId: string,
  contactKeys: string[],
  baseQuery: BaseQueryFn,
  options?: FetchLoopOptions
): Promise<Map<string, VCard>> {
  const map = new Map<string, VCard>()
  const uniqueKeys = [...new Set(contactKeys.filter(Boolean))]

  await Promise.all(
    uniqueKeys.map(async (contactKey) => {
      if (options?.signal?.aborted) return

      const result = await baseQuery({
        url: addressBookContactPath(bookId, contactKey),
        signal: options?.signal,
      })
      if (result.error) return

      const contact = normalizeContact(unwrapApiData(result.data))
      for (const [key, value] of buildContactsByKey([contact])) {
        map.set(key, value)
      }
    })
  )

  return map
}

export type FetchAllDistributionListsResult = {
  lists: ApiDistributionList[]
  total: number
  error?: unknown
}

export async function fetchAllDistributionLists(
  bookId: string,
  baseQuery: BaseQueryFn,
  options?: { sort_by?: string; sort_order?: string; signal?: AbortSignal }
): Promise<FetchAllDistributionListsResult> {
  const lists: ApiDistributionList[] = []
  let page = 1
  let totalPages = 1
  let total = 0

  while (page <= totalPages) {
    if (options?.signal?.aborted) break

    const result = await baseQuery({
      url: addressBookListsPath(bookId),
      params: {
        page,
        page_size: CONTACT_LOOKUP_PAGE_SIZE,
        ...(options?.sort_by ? { sort_by: options.sort_by } : {}),
        ...(options?.sort_order ? { sort_order: options.sort_order } : {}),
      },
      signal: options?.signal,
    })

    if (result.error) {
      return { lists, total, error: result.error }
    }

    const data = unwrapApiData(result.data as ApiListsCollectionData)
    const pageLists = Array.isArray(data)
      ? (data as ApiDistributionList[])
      : ((data as ApiListsCollectionData).lists ?? [])

    lists.push(...pageLists)

    const pagination = parseXPaginationFromMeta(result.meta)
    totalPages = pagination?.totalPages ?? 1
    total = pagination?.total ?? lists.length
    page += 1

    if (pageLists.length === 0) break
  }

  return { lists, total }
}
