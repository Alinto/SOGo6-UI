import type { ContactSortOrder } from '../store/address-books-ui-slice'
import type { VCard } from '../address-books-types'
import {
  getDistributionListMemberCount,
  getDistributionListName,
  isDistributionList,
} from './distribution-list'

export function getContactDisplayName(contact: VCard): string {
  if (isDistributionList(contact)) {
    return getDistributionListName(contact)
  }
  return `${contact.firstName} ${contact.lastName}`.trim()
}

export function getListItemSortName(contact: VCard): string {
  if (isDistributionList(contact)) {
    return getDistributionListName(contact).toLowerCase()
  }
  return `${contact.lastName} ${contact.firstName}`.toLowerCase()
}

function matchesSearchQuery(item: VCard, query: string): boolean {
  if (!query) return true

  const name = getContactDisplayName(item).toLowerCase()
  const emails = (item.emails ?? []).join(' ').toLowerCase()
  const memberEmails = (item.members ?? [])
    .map((member) => member.email)
    .join(' ')
    .toLowerCase()
  const phones = (item.phoneNumbers ?? []).join(' ').toLowerCase()
  const organization = (item.organization ?? '').toLowerCase()
  const memberCount = String(getDistributionListMemberCount(item))

  return (
    name.includes(query) ||
    emails.includes(query) ||
    memberEmails.includes(query) ||
    phones.includes(query) ||
    organization.includes(query) ||
    memberCount.includes(query)
  )
}

function sortByName(items: VCard[], sortOrder: ContactSortOrder): VCard[] {
  return [...items].sort((a, b) => {
    const nameA = getListItemSortName(a)
    const nameB = getListItemSortName(b)
    const cmp = nameA.localeCompare(nameB)
    return sortOrder === 'asc' ? cmp : -cmp
  })
}

export function partitionAddressBookEntries(
  items: VCard[],
  searchQuery: string,
  sortOrder: ContactSortOrder,
  options?: { serverSide?: boolean }
): { distributionLists: VCard[]; contacts: VCard[] } {
  if (options?.serverSide) {
    return {
      distributionLists: items.filter(isDistributionList),
      contacts: items.filter((item) => !isDistributionList(item)),
    }
  }

  const query = searchQuery.trim().toLowerCase()
  const filtered = query
    ? items.filter((item) => matchesSearchQuery(item, query))
    : items

  return {
    distributionLists: sortByName(
      filtered.filter(isDistributionList),
      sortOrder
    ),
    contacts: sortByName(
      filtered.filter((item) => !isDistributionList(item)),
      sortOrder
    ),
  }
}

export function filterAndSortContacts(
  items: VCard[],
  searchQuery: string,
  sortOrder: ContactSortOrder
): VCard[] {
  const { distributionLists, contacts } = partitionAddressBookEntries(
    items,
    searchQuery,
    sortOrder
  )
  return [...distributionLists, ...contacts]
}

export function parseContactName(name?: string): {
  firstName: string
  lastName: string
} {
  if (!name?.trim()) {
    return { firstName: '', lastName: '' }
  }

  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' }
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  }
}
