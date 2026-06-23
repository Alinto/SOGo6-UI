import type {
  ApiContactsListData,
  ApiDistributionList,
  ApiListsCollectionData,
  BookEntriesResponse,
} from '../address-books-api-types'
import type { VCard } from '../address-books-types'
import { isDistributionList } from './distribution-list'
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
  contactsPagination?: ParsedPagination | null,
  options?: { listTotal?: number }
): BookEntriesResponse {
  const items = mergeBookEntries(contacts, lists)
  const contactTotal = contactsPagination?.total ?? contacts.length
  const listTotal = options?.listTotal ?? lists.length
  const page = contactsPagination?.page ?? 1
  const totalPages = contactsPagination?.totalPages ?? 1

  return {
    items,
    total: contactTotal,
    contactTotal,
    listTotal,
    page,
    totalPages,
  }
}

export function parseContactsAndListsFromBackend(
  contactsPayload: unknown,
  listsPayload: unknown,
  contactsPagination?: ParsedPagination | null,
  contactsByKey?: Map<string, VCard>,
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
  const lookupMap =
    contactsByKey instanceof Map
      ? contactsByKey
      : new Map(contacts.flatMap((contact) => [[contact.id, contact] as const]))
  const lists = normalizeListsCollection(
    rawLists as ApiDistributionList[],
    Array.from(new Map(lookupMap).values())
  )

  const listTotal = listsPagination?.total ?? rawLists.length

  return buildBookEntriesResponse(contacts, lists, contactsPagination, {
    listTotal,
  })
}

export function parseFakeBookEntries(payload: unknown): BookEntriesResponse {
  const items = normalizeContactsList(payload as VCard[])
  const lists = items.filter(isDistributionList)
  const contacts = items.filter((item) => !isDistributionList(item))

  return {
    items,
    total: contacts.length,
    contactTotal: contacts.length,
    listTotal: lists.length,
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
  if (
    value &&
    typeof value === 'object' &&
    'members' in value &&
    'name' in value &&
    !('first_name' in value)
  ) {
    return normalizeDistributionList(value as ApiDistributionList)
  }
  return normalizeContact(value as Parameters<typeof normalizeContact>[0])
}
