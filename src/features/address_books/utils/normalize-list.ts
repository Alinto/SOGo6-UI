import type { ApiDistributionList } from '../address-books-api-types'
import type { ContactMember, VCard } from '../address-books-types'
import { getContactDisplayName } from './contact-list'
import { normalizeContact } from './normalize-contact'

export function resolveListMembers(
  memberKeys: string[],
  contactsByKey: Map<string, VCard>
): ContactMember[] {
  return memberKeys.map((contactKey) => {
    const contact = contactsByKey.get(contactKey)
    if (!contact) {
      return { contactId: contactKey, email: '' }
    }
    return {
      contactId: contact.id,
      email: contact.emails?.[0]?.trim() ?? '',
      displayName: getContactDisplayName(contact) || undefined,
    }
  })
}

export function normalizeDistributionList(
  raw: ApiDistributionList | VCard,
  contactsByKey: Map<string, VCard> = new Map()
): VCard {
  if ('kind' in raw && raw.kind === 'group') {
    return raw as VCard
  }

  const api = raw as ApiDistributionList
  const id = api.key
  const members = resolveListMembers(api.members ?? [], contactsByKey)

  return {
    id,
    key: id,
    uid: api.uid ?? undefined,
    version: '4.0',
    kind: 'group',
    firstName: api.name,
    lastName: '',
    note: api.description ?? undefined,
    members,
    emails: [],
    phoneNumbers: [],
    addresses: [],
    urls: [],
    photos: [],
    impp: [],
    categories: [],
    created_at: api.created_at ?? undefined,
    updated_at: api.updated_at ?? undefined,
  }
}

export function buildContactsByKey(contacts: VCard[]): Map<string, VCard> {
  const map = new Map<string, VCard>()
  for (const contact of contacts) {
    map.set(contact.id, contact)
    if (contact.key) map.set(contact.key, contact)
  }
  return map
}

export function normalizeListsCollection(
  lists: ApiDistributionList[] | VCard[],
  contacts: VCard[]
): VCard[] {
  const contactsByKey = buildContactsByKey(contacts)
  return lists.map((list) =>
    'kind' in list && list.kind === 'group'
      ? (list as VCard)
      : normalizeDistributionList(list as ApiDistributionList, contactsByKey)
  )
}

export function normalizeListFromVCard(vcard: VCard): VCard {
  if (vcard.kind === 'group') return vcard
  return normalizeContact(vcard)
}
