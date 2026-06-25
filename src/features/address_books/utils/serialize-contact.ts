import type {
  ApiContactAddress,
  ContactCreateBody,
  ContactPatchBody,
} from '../address-books-api-types'
import type { VCard } from '../address-books-types'
import type { ContactFormValues } from '../components/contact-form'

export const CONTACT_PHOTO_MAX_BYTES = 2048 * 1024

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

function toAddressObjects(
  rows: ContactFormValues['addresses']
): ApiContactAddress[] | undefined {
  if (!rows?.length) return undefined

  const addresses = rows
    .map((row) => ({
      street: row.street?.trim() || null,
      locality: row.city?.trim() || null,
      region: row.region?.trim() || null,
      po_box: row.poBox?.trim() || null,
      extended: row.extended?.trim() || null,
      postal_code: row.postalCode?.trim() || null,
      country: row.country?.trim() || null,
    }))
    .filter(
      (row) =>
        row.street ||
        row.locality ||
        row.region ||
        row.po_box ||
        row.extended ||
        row.postal_code ||
        row.country
    )

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
  const displayName = isOrg
    ? organization || `${firstName} ${lastName}`.trim()
    : `${firstName} ${lastName}`.trim()

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
      ?.map((entry) => entry.value.trim())
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

export function serializeContactPatch(
  patch: Partial<VCard>
): ContactPatchBody {
  const body: ContactPatchBody = {}

  if (patch.firstName !== undefined) body.first_name = patch.firstName
  if (patch.lastName !== undefined) body.last_name = patch.lastName
  if (patch.firstName !== undefined || patch.lastName !== undefined) {
    const displayName = `${patch.firstName ?? ''} ${patch.lastName ?? ''}`.trim()
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

export function serializeContactCreate(vcard: Partial<VCard>): ContactCreateBody {
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
