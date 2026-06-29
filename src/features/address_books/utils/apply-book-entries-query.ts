import type {
  BookEntriesQueryParams,
  BookEntriesResponse,
  ContactSortField,
} from '../address-books-api-types'
import type { VCard } from '../address-books-types'
import {
  getContactDisplayName,
  matchesSearchQuery,
} from './contact-list'
import { isDistributionList, getDistributionListName } from './distribution-list'
import { mergeBookEntries } from './merge-book-entries'

const DEFAULT_PAGE_SIZE = 50

function compareValues(a: string, b: string, sortOrder: 'asc' | 'desc'): number {
  const cmp = a.localeCompare(b, undefined, { sensitivity: 'base' })
  return sortOrder === 'asc' ? cmp : -cmp
}

function contactSortValue(contact: VCard, sortBy: ContactSortField): string {
  switch (sortBy) {
    case 'display_name':
      return getContactDisplayName(contact)
    case 'last_name':
      return contact.lastName ?? ''
    case 'first_name':
      return contact.firstName ?? ''
    case 'organization':
      return contact.organization ?? ''
    case 'created_at':
      return contact.created_at ?? ''
    case 'updated_at':
      return contact.updated_at ?? ''
    default:
      return getContactDisplayName(contact)
  }
}

function listSortValue(list: VCard, sortBy: ContactSortField): string {
  if (sortBy === 'created_at' || sortBy === 'updated_at') {
    return list[sortBy] ?? ''
  }
  return getDistributionListName(list)
}

function sortGroup(
  items: VCard[],
  sortBy: ContactSortField,
  sortOrder: 'asc' | 'desc',
  kind: 'contact' | 'list'
): VCard[] {
  return [...items].sort((a, b) => {
    const valueA =
      kind === 'list' ? listSortValue(a, sortBy) : contactSortValue(a, sortBy)
    const valueB =
      kind === 'list' ? listSortValue(b, sortBy) : contactSortValue(b, sortBy)
    return compareValues(valueA, valueB, sortOrder)
  })
}

function paginateSlice<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize
  return items.slice(start, start + pageSize)
}

/**
 * Applies list query parameters (search, sort, pagination) to a full in-memory
 * entry set. Used for legacy fakeApi responses so the UI can stay in serverSide
 * mode with the same contract as the real backend.
 */
export function applyBookEntriesQuery(
  items: VCard[],
  params?: BookEntriesQueryParams
): BookEntriesResponse {
  const page = Math.max(1, params?.page ?? 1)
  const pageSize = Math.max(1, params?.page_size ?? DEFAULT_PAGE_SIZE)
  const sortOrder = params?.sort_order ?? 'asc'
  const sortBy = (params?.sort_by ?? 'display_name') as ContactSortField
  const search = params?.search?.trim()

  const filtered = search
    ? items.filter((item) => matchesSearchQuery(item, search))
    : items

  const lists = sortGroup(
    filtered.filter(isDistributionList),
    sortBy,
    sortOrder,
    'list'
  )
  const contacts = sortGroup(
    filtered.filter((item) => !isDistributionList(item)),
    sortBy,
    sortOrder,
    'contact'
  )

  const listTotal = lists.length
  const contactTotal = contacts.length
  const totalPages = Math.max(1, Math.ceil(contactTotal / pageSize))

  const pageItems = mergeBookEntries(
    paginateSlice(contacts, page, pageSize),
    paginateSlice(lists, page, pageSize)
  )

  return {
    items: pageItems,
    total: contactTotal,
    contactTotal,
    listTotal,
    page,
    totalPages,
  }
}

export function parseBookEntriesQueryFromSearchParams(
  searchParams: URLSearchParams
): BookEntriesQueryParams {
  const params: BookEntriesQueryParams = {}

  const search = searchParams.get('search')?.trim()
  if (search) params.search = search

  const page = Number(searchParams.get('page'))
  if (Number.isFinite(page) && page > 0) params.page = page

  const pageSize = Number(searchParams.get('page_size'))
  if (Number.isFinite(pageSize) && pageSize > 0) params.page_size = pageSize

  const sortBy = searchParams.get('sort_by')
  if (sortBy) params.sort_by = sortBy as ContactSortField

  const sortOrder = searchParams.get('sort_order')
  if (sortOrder === 'asc' || sortOrder === 'desc') {
    params.sort_order = sortOrder
  }

  return params
}
