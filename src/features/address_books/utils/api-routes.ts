import { isUsingFakeApi } from '@/lib/env-service'

export function isLegacyAddressBooksApi(): boolean {
  return isUsingFakeApi()
}

export const addressBooksCollectionPath = () =>
  isUsingFakeApi() ? 'address_books' : 'addressbooks'

export const addressBookPath = (key: string) =>
  `${addressBooksCollectionPath()}/${encodeURIComponent(key)}`

export const addressBookContactsPath = (key: string) =>
  `${addressBookPath(key)}/contacts`

export const addressBookContactPath = (bookKey: string, contactKey: string) =>
  `${addressBookContactsPath(bookKey)}/${encodeURIComponent(contactKey)}`

export const addressBookShareUrl = (key: string) =>
  `${addressBookPath(key)}/share`

export const addressBookShareSubscribeUrl = (key: string, uid: string) =>
  `${addressBookShareUrl(key)}/${encodeURIComponent(uid)}/subscribe`

export const addressBookListsPath = (key: string) =>
  `${addressBookPath(key)}/lists`

export const addressBookListPath = (bookKey: string, listKey: string) =>
  `${addressBookListsPath(bookKey)}/${encodeURIComponent(listKey)}`

export const contactsAutocompletePath = () => 'contacts/autocomplete'

export const allContactsPath = () => 'contacts'

export const addressBookImportPath = () => `${addressBooksCollectionPath()}/import`

export const addressBookExportPath = (key: string) =>
  `${addressBookPath(key)}/export`

export const addressBookContactsImportPath = (key: string) =>
  `${addressBookContactsPath(key)}/import`

export const addressBookListsImportPath = (key: string) =>
  `${addressBookListsPath(key)}/import`

export const addressBookContactExportPath = (
  bookKey: string,
  contactKey: string
) => `${addressBookContactPath(bookKey, contactKey)}/export`

export const addressBookListExportPath = (bookKey: string, listKey: string) =>
  `${addressBookListPath(bookKey, listKey)}/export`

export const legacyAddressBookEntriesPath = (bookId: string) =>
  `address_books/${encodeURIComponent(bookId)}`

export const legacyVCardPath = (bookId: string, entryId: string) =>
  `address_books/${encodeURIComponent(bookId)}/${encodeURIComponent(entryId)}`

import type { ContactSortField, ListSortField } from '../address-books-api-types'

export function mapContactSortToListSort(
  sortBy?: ContactSortField | string
): ListSortField {
  if (sortBy === 'created_at' || sortBy === 'updated_at') return sortBy
  return 'name'
}

export function buildListQueryParams(
  params?: {
    search?: string
    page?: number
    page_size?: number
    sort_by?: string
    sort_order?: 'asc' | 'desc'
  },
  options?: { omitShortSearch?: boolean; minSearchLength?: number }
): Record<string, string | number> | undefined {
  if (!params) return undefined

  const query: Record<string, string | number> = {}
  const search = params.search?.trim()
  const minSearchLength = options?.minSearchLength ?? 2

  if (
    search &&
    (!options?.omitShortSearch || search.length >= minSearchLength)
  ) {
    query.search = search
  }
  if (params.page !== undefined) query.page = params.page
  if (params.page_size !== undefined) query.page_size = params.page_size
  if (params.sort_by) query.sort_by = params.sort_by
  if (params.sort_order) query.sort_order = params.sort_order

  return Object.keys(query).length ? query : undefined
}
