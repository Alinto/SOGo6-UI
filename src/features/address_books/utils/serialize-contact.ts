import type {
  ApiContactAddress,
  ApiContactEmail,
  ApiContactPhone,
  ContactCreateBody,
  ContactPatchBody,
} from '../address-books-api-types'
import type { VCard } from '../address-books-types'
import type { ContactFormValues } from '../components/contact-form'

export const CONTACT_PHOTO_MAX_BYTES = 2048 * 1024

/** Types the email select offers (besides '_none'). */
export const CONTACT_EMAIL_TYPES = ['work', 'home', 'other'] as const
/** Types the phone select offers (besides '_none'). */
export const CONTACT_PHONE_TYPES = ['work', 'home', 'mobile', 'other'] as const

/** Select value for stored vCard types: '_none' when the form has no match. */
export function toFormFieldType<T extends string>(
  types: string[] | undefined,
  allowed: readonly T[]
): T | '_none' {
  const first = types?.[0]?.trim().toLowerCase()
  return first && (allowed as readonly string[]).includes(first)
    ? (first as T)
    : '_none'
}

/** "www.x.fr" → "https://www.x.fr"; values with a scheme are kept. */
export function normalizeContactUrl(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  return /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`
}

export function isValidContactUrl(value: string): boolean {
  if (!value.trim()) return true
  try {
    return Boolean(new URL(normalizeContactUrl(value)).hostname)
  } catch {
    return false
  }
}

type TypedEmailEntry = { value: string; type?: string; pref?: boolean }
type TypedPhoneEntry = { value: string; type?: string; pref?: boolean }

function toEmailObjects(
  values?: TypedEmailEntry[] | string[] | { value: string }[]
) {
  if (!values?.length) return undefined
  const emails = values
    .map((entry) => {
      if (typeof entry === 'string') {
        const value = entry.trim()
        return value ? { value } : null
      }
      const value = entry.value.trim()
      if (!value) return null
      const type = entry.type?.trim()
      return {
        value,
        types: type && type !== '_none' ? [type] : undefined,
        pref: entry.pref ? 1 : undefined,
      }
    })
    .filter(Boolean)
  return emails.length ? emails : undefined
}

function toPhoneObjects(
  values?: TypedPhoneEntry[] | string[] | { value: string }[]
) {
  if (!values?.length) return undefined
  const phones = values
    .map((entry) => {
      if (typeof entry === 'string') {
        const number = entry.trim()
        return number ? { number } : null
      }
      const number = entry.value.trim()
      if (!number) return null
      const type = entry.type?.trim()
      return {
        number,
        types: type && type !== '_none' ? [type] : undefined,
        pref: entry.pref ? 1 : undefined,
      }
    })
    .filter(Boolean)
  return phones.length ? phones : undefined
}

type AddressRow = ContactFormValues['addresses'][number]

function toAddressFields(row: AddressRow): ApiContactAddress {
  return {
    street: row.street?.trim() || null,
    locality: row.city?.trim() || null,
    region: row.region?.trim() || null,
    po_box: row.poBox?.trim() || null,
    extended: row.extended?.trim() || null,
    postal_code: row.postalCode?.trim() || null,
    country: row.country?.trim() || null,
  }
}

const hasAddressContent = (address: ApiContactAddress) =>
  Boolean(
    address.street ||
    address.locality ||
    address.region ||
    address.po_box ||
    address.extended ||
    address.postal_code ||
    address.country
  )

function toAddressObjects(
  rows: ContactFormValues['addresses']
): ApiContactAddress[] | undefined {
  if (!rows?.length) return undefined
  const addresses = rows.map(toAddressFields).filter(hasAddressContent)
  return addresses.length ? addresses : undefined
}

function formatBirthdayValue(
  birthday?: string,
  birthdayUnknownYear?: boolean
): string | undefined {
  const value = birthday?.trim()
  if (!value) return undefined
  if (birthdayUnknownYear) {
    const monthDay = value.length >= 5 ? value.slice(5) : value
    return `--${monthDay}`
  }
  return value
}

export function serializeContactFromForm(
  values: ContactFormValues
): ContactCreateBody {
  const firstName = values.firstName.trim()
  const lastName = values.lastName.trim()
  const organization = values.organization?.trim()
  const isOrg = values.contactKind === 'org'
  const email = values.emails.find((entry) => entry.value.trim())?.value.trim()
  const phone = values.phoneNumbers
    .find((entry) => entry.value.trim())
    ?.value.trim()
  const personName = `${firstName} ${lastName}`.trim()
  const displayName = isOrg
    ? organization || personName || email || phone
    : personName || email || phone || organization

  const body: ContactCreateBody = {
    display_name: displayName || undefined,
    first_name: firstName || undefined,
    last_name: lastName || undefined,
    organization: organization || undefined,
    job_title: values.jobTitle?.trim() || undefined,
    emails: toEmailObjects(values.emails),
    phones: toPhoneObjects(values.phoneNumbers),
    addresses: toAddressObjects(values.addresses),
    urls: values.urls
      ?.map((entry) => normalizeContactUrl(entry.value))
      .filter(Boolean)
      .map((value) => ({ value })),
    categories:
      values.categories && values.categories.length > 0
        ? values.categories
        : undefined,
    birthday: formatBirthdayValue(values.birthday, values.birthdayUnknownYear),
    note: values.note?.trim() || undefined,
    kind: isOrg ? 'org' : 'individual',
  }

  const middleName = values.middleName?.trim()
  if (middleName) body.middle_name = middleName
  const prefix = values.prefix?.trim()
  if (prefix) body.prefix = prefix
  const suffix = values.suffix?.trim()
  if (suffix) body.suffix = suffix
  const nickname = values.nickname?.trim()
  if (nickname) body.nickname = nickname
  const department = values.department?.trim()
  if (department) body.department = department
  const role = values.title?.trim()
  if (role) body.role = role
  const impp = values.impp
    ?.map((entry) => entry.value.trim())
    .filter(Boolean)
    .map((uri) => ({ uri }))
  if (impp?.length) body.impp = impp
  const anniversary = values.anniversary?.trim()
  if (anniversary) body.anniversary = anniversary

  if (values.clearPhoto) {
    body.photos = []
  } else if (values.photoDataUri) {
    body.photos = [values.photoDataUri]
  }

  return body
}

type SourceRow = { sourceIndex?: number }

const sourceOf = <T>(list: T[] | undefined, row: SourceRow) =>
  row.sourceIndex !== undefined ? list?.[row.sourceIndex] : undefined

/**
 * Types and preference of an email/phone row: the stored ones are kept while
 * the select still shows them (the form only edits the first type and a
 * "preferred" flag), so an untouched row is sent back unchanged.
 */
function mergeTypedEntry<T extends string>(
  row: { type?: string; pref?: boolean },
  source: { types?: string[]; pref?: number | null } | undefined,
  allowed: readonly T[]
): { types?: string[]; pref?: number } {
  const type = row.type && row.type !== '_none' ? row.type : undefined
  const typeUnchanged =
    source !== undefined &&
    (row.type ?? '_none') === toFormFieldType(source.types, allowed)
  const types = typeUnchanged ? source.types : type ? [type] : undefined
  const storedPref = source?.pref ?? undefined
  // The checkbox means "most preferred" (PREF=1); a lower stored rank
  // (PREF=2...) is kept while the box stays unchecked.
  const pref = row.pref
    ? 1
    : storedPref !== undefined && storedPref > 1
      ? storedPref
      : undefined
  return {
    ...(types?.length ? { types } : {}),
    ...(pref !== undefined ? { pref } : {}),
  }
}

function mergeEmails(
  rows: ContactFormValues['emails'],
  stored: ApiContactEmail[] | undefined
): ApiContactEmail[] {
  return rows
    .filter((row) => row.value.trim())
    .map((row) => ({
      value: row.value.trim(),
      ...mergeTypedEntry(row, sourceOf(stored, row), CONTACT_EMAIL_TYPES),
    }))
}

function mergePhones(
  rows: ContactFormValues['phoneNumbers'],
  stored: ApiContactPhone[] | undefined
): ApiContactPhone[] {
  return rows
    .filter((row) => row.value.trim())
    .map((row) => ({
      number: row.value.trim(),
      ...mergeTypedEntry(row, sourceOf(stored, row), CONTACT_PHONE_TYPES),
    }))
}

function mergeAddresses(
  rows: ContactFormValues['addresses'],
  stored: ApiContactAddress[] | undefined
): ApiContactAddress[] {
  return (rows ?? []).flatMap((row) => {
    const address = toAddressFields(row)
    return hasAddressContent(address)
      ? [{ ...sourceOf(stored, row), ...address }]
      : []
  })
}

function sameName(values: ContactFormValues, original: VCard): boolean {
  const isOrg = values.contactKind === 'org'
  return (
    isOrg === (original.kind === 'org') &&
    values.firstName.trim() === (original.firstName ?? '').trim() &&
    values.lastName.trim() === (original.lastName ?? '').trim() &&
    (values.organization ?? '').trim() === (original.organization ?? '').trim()
  )
}

/**
 * Edit body built from the form. The server replaces each list it receives
 * and keeps every key it does not receive, so:
 * - a field the user emptied is sent explicitly (`[]` for lists, `null` for
 *   text fields): the form always loads them from the contact;
 * - list entries keep what the form does not show (address types and
 *   preference, every email/phone type, URL and IMPP types), taken from the
 *   stored contact;
 * - the display name (FN) is only recomputed when the name was edited, so an
 *   imported FN survives an unrelated change.
 */
export function serializeContactEditFromForm(
  values: ContactFormValues,
  original?: VCard | null
): ContactPatchBody {
  const body: ContactPatchBody = serializeContactFromForm(values)
  body.emails = mergeEmails(values.emails, original?.structuredEmails)
  body.phones = mergePhones(values.phoneNumbers, original?.structuredPhones)
  body.addresses = mergeAddresses(
    values.addresses,
    original?.structuredAddresses
  )
  body.urls = (values.urls ?? [])
    .filter((row) => row.value.trim())
    .map((row) => {
      const type = sourceOf(original?.structuredUrls, row)?.type
      return {
        value: normalizeContactUrl(row.value),
        ...(type ? { type } : {}),
      }
    })
  body.impp = (values.impp ?? [])
    .filter((row) => row.value.trim())
    .map((row) => {
      const type = sourceOf(original?.structuredImpp, row)?.type
      return { uri: row.value.trim(), ...(type ? { type } : {}) }
    })
  body.categories ??= []
  body.note ??= null
  body.organization ??= null
  body.job_title ??= null
  body.middle_name ??= null
  body.prefix ??= null
  body.suffix ??= null
  body.nickname ??= null
  body.department ??= null
  body.role ??= null
  body.birthday ??= null
  body.anniversary ??= null
  // Not sent: the server keeps the stored FN (it may come from an import).
  if (original && sameName(values, original)) {
    delete body.display_name
  }
  return body
}

export function serializeContactPatch(patch: Partial<VCard>): ContactPatchBody {
  const body: ContactPatchBody = {}

  if (patch.firstName !== undefined) body.first_name = patch.firstName
  if (patch.lastName !== undefined) body.last_name = patch.lastName
  if (patch.firstName !== undefined || patch.lastName !== undefined) {
    const displayName =
      `${patch.firstName ?? ''} ${patch.lastName ?? ''}`.trim()
    if (displayName) body.display_name = displayName
  }
  if (patch.middleName !== undefined) body.middle_name = patch.middleName
  if (patch.prefix !== undefined) body.prefix = patch.prefix
  if (patch.suffix !== undefined) body.suffix = patch.suffix
  if (patch.nickname !== undefined) body.nickname = patch.nickname
  if (patch.organization !== undefined) body.organization = patch.organization
  if (patch.department !== undefined) body.department = patch.department
  if (patch.jobTitle !== undefined) body.job_title = patch.jobTitle
  if (patch.title !== undefined) body.role = patch.title
  if (patch.note !== undefined) body.note = patch.note
  if (patch.emails !== undefined) body.emails = toEmailObjects(patch.emails)
  if (patch.phoneNumbers !== undefined) {
    body.phones = toPhoneObjects(patch.phoneNumbers)
  }
  if (patch.urls !== undefined) {
    body.urls = patch.urls
      .map((value) => value.trim())
      .filter(Boolean)
      .map((value) => ({ value }))
  }
  if (patch.categories !== undefined) body.categories = patch.categories
  if (patch.birthday !== undefined) body.birthday = patch.birthday
  if (patch.anniversary !== undefined) body.anniversary = patch.anniversary
  if (patch.geo !== undefined) body.geo = patch.geo
  if (patch.photos !== undefined) body.photos = patch.photos

  return body
}

export function serializeContactCreate(
  vcard: Partial<VCard>
): ContactCreateBody {
  return serializeContactPatch(vcard) as ContactCreateBody
}

export function serializeAddressBookPatch(
  patch: Partial<{ name: string; description: string; default?: boolean }>
): Record<string, unknown> {
  const body: Record<string, unknown> = {}
  if (patch.name !== undefined) body.name = patch.name
  if (patch.description !== undefined) body.description = patch.description
  if (patch.default !== undefined) body.is_default = patch.default
  return body
}

export function serializeAddressBookCreate(input: {
  name: string
  description?: string
}): Record<string, string> {
  return {
    name: input.name,
    description: input.description ?? '',
  }
}
