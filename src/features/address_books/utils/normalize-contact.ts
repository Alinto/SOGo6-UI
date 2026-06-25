import type { ApiContact, ApiContactsListData } from '../address-books-api-types'
import type { ContactKind, VCard } from '../address-books-types'
import { unwrapApiData } from './unwrap-api-data'

function formatAddressLine(
  address: NonNullable<ApiContact['addresses']>[number]
): string {
  const parts = [
    address.street,
    address.locality,
    address.region,
    address.postal_code,
    address.country,
  ].filter(Boolean)
  return parts.join(', ')
}

function normalizeKind(kind?: ApiContact['kind']): ContactKind | undefined {
  if (kind === 'group') return 'group'
  if (kind === 'org') return 'org'
  if (kind === 'individual' || !kind) return 'individual'
  return 'individual'
}

export function normalizeContact(raw: ApiContact | Partial<VCard>): VCard {
  if ('firstName' in raw && raw.firstName !== undefined) {
    return raw as VCard
  }

  const api = raw as ApiContact
  const id = api.key
  const emails = (api.emails ?? []).map((entry) => entry.value).filter(Boolean)
  const phoneNumbers = (api.phones ?? [])
    .map((entry) => entry.number)
    .filter(Boolean)
  const urls = (api.urls ?? []).map((entry) => entry.value).filter(Boolean)
  const impp = (api.impp ?? []).map((entry) => entry.uri).filter(Boolean)
  const addresses = (api.addresses ?? [])
    .map(formatAddressLine)
    .filter(Boolean)

  return {
    id,
    key: id,
    addressBookKey: api.addressbook_key ?? undefined,
    uid: api.uid ?? undefined,
    version: api.version ?? '4.0',
    kind: normalizeKind(api.kind),
    firstName: api.first_name ?? '',
    lastName: api.last_name ?? '',
    middleName: api.middle_name ?? undefined,
    prefix: api.prefix ?? undefined,
    suffix: api.suffix ?? undefined,
    nickname: api.nickname ?? undefined,
    organization: api.organization ?? undefined,
    department: api.department ?? undefined,
    jobTitle: api.job_title ?? undefined,
    title: api.role ?? undefined,
    note: api.note ?? undefined,
    categories: api.categories ?? undefined,
    urls: urls.length ? urls : undefined,
    photos: api.photos ?? undefined,
    photo: api.photos?.[0],
    emails: emails.length ? emails : undefined,
    structuredEmails:
      api.emails && api.emails.length > 0 ? api.emails : undefined,
    phoneNumbers: phoneNumbers.length ? phoneNumbers : undefined,
    structuredPhones: api.phones && api.phones.length > 0 ? api.phones : undefined,
    addresses: addresses.length ? addresses : undefined,
    structuredAddresses:
      api.addresses && api.addresses.length > 0 ? api.addresses : undefined,
    impp: impp.length ? impp : undefined,
    geo: api.geo ?? undefined,
    birthday: api.birthday ?? undefined,
    anniversary: api.anniversary ?? undefined,
    sound: api.sound ?? undefined,
    created_at: api.created_at ?? undefined,
    updated_at: api.updated_at ?? undefined,
  }
}

export function normalizeContactsList(
  response:
    | ApiContactsListData
    | { contacts: ApiContact[] }
    | ApiContact[]
    | VCard[]
): VCard[] {
  if (Array.isArray(response)) {
    return response.map((item) =>
      'firstName' in item ? (item as VCard) : normalizeContact(item as ApiContact)
    )
  }

  const data = unwrapApiData(response)
  if (Array.isArray(data)) {
    return normalizeContactsList(data)
  }

  const contacts = (data as ApiContactsListData).contacts ?? []
  return contacts.map(normalizeContact)
}
