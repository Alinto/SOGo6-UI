import type {
  ApiContactsListData,
  ApiDistributionList,
  ApiListsCollectionData,
  BookEntriesResponse,
} from '../address-books-api-types'
import type { VCard } from '../address-books-types'
import { normalizeContact, normalizeContactsList } from './normalize-contact'
import {
  normalizeDistributionList,
  normalizeListsCollection,
} from './normalize-list'
import type { ParsedPagination } from './parse-x-pagination'
import { unwrapApiData } from './unwrap-api-data'

export function mergeBookEntries(
  contacts: VCard[],
  lists: VCard[]
): VCard[] {
  return [...lists, ...contacts]
}

export function buildBookEntriesResponse(
  contacts: VCard[],
  lists: VCard[],
  pagination?: ParsedPagination | null,
  fallbackCount?: number
): BookEntriesResponse {
  const items = mergeBookEntries(contacts, lists)
  const total =
    pagination?.total ??
    fallbackCount ??
    contacts.length + lists.length
  const page = pagination?.page ?? 1
  const totalPages = pagination?.totalPages ?? 1

  return { items, total, page, totalPages }
}

export function parseContactsAndListsFromBackend(
  contactsPayload: unknown,
  listsPayload: unknown,
  contactsPagination?: ParsedPagination | null,
  listsPagination?: ParsedPagination | null
): BookEntriesResponse {
  const contactsData = unwrapApiData(contactsPayload as ApiContactsListData)
  const listsData = unwrapApiData(listsPayload as ApiListsCollectionData)

  const rawContacts = Array.isArray(contactsData)
    ? contactsData
    : ((contactsData as ApiContactsListData).contacts ?? [])
  const rawLists = Array.isArray(listsData)
    ? listsData
    : ((listsData as ApiListsCollectionData).lists ?? [])

  const contacts = normalizeContactsList(rawContacts as ApiContactsListData['contacts'])
  const lists = normalizeListsCollection(
    rawLists as ApiDistributionList[],
    contacts
  )

  const contactTotal = contactsPagination?.total ?? contacts.length
  const listTotal = listsPagination?.total ?? rawLists.length
  const total = contactTotal + listTotal
  const page = contactsPagination?.page ?? listsPagination?.page ?? 1
  const totalPages = Math.max(
    contactsPagination?.totalPages ?? 1,
    listsPagination?.totalPages ?? 1
  )

  return {
    items: mergeBookEntries(contacts, lists),
    total,
    page,
    totalPages,
  }
}

export function parseFakeBookEntries(payload: unknown): BookEntriesResponse {
  const items = normalizeContactsList(payload as VCard[])
  return {
    items,
    total: items.length,
    page: 1,
    totalPages: 1,
  }
}

export function isDistributionListEntry(entry: VCard): boolean {
  return entry.kind === 'group'
}

export function listTagId(id: string): string {
  return `list:${id}`
}

export function parseListTagId(tagId: string): string | null {
  return tagId.startsWith('list:') ? tagId.slice(5) : null
}

export function normalizeSingleEntry(raw: unknown): VCard {
  const value = unwrapApiData(raw)
  if (value && typeof value === 'object' && 'members' in value && 'name' in value && !('first_name' in value)) {
    return normalizeDistributionList(value as ApiDistributionList)
  }
  return normalizeContact(value as Parameters<typeof normalizeContact>[0])
}
