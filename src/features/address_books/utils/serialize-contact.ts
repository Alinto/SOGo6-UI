import type {
  ApiContactAddress,
  ContactCreateBody,
  ContactPatchBody,
} from '../address-books-api-types'
import type { VCard } from '../address-books-types'
import type { ContactFormValues } from '../components/contact-form'

export const CONTACT_PHOTO_MAX_BYTES = 2048 * 1024

function toEmailObjects(values?: string[] | { value: string }[]) {
  if (!values?.length) return undefined
  const emails = values
    .map((value) => (typeof value === 'string' ? value : value.value).trim())
    .filter(Boolean)
    .map((value) => ({ value }))
  return emails.length ? emails : undefined
}

function toPhoneObjects(values?: string[] | { value: string }[]) {
  if (!values?.length) return undefined
  const phones = values
    .map((value) => (typeof value === 'string' ? value : value.value).trim())
    .filter(Boolean)
    .map((number) => ({ number }))
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
      postal_code: row.postalCode?.trim() || null,
      country: row.country?.trim() || null,
    }))
    .filter(
      (row) => row.street || row.locality || row.postal_code || row.country
    )

  return addresses.length ? addresses : undefined
}

export function serializeContactFromForm(
  values: ContactFormValues
): ContactCreateBody {
  const firstName = values.firstName.trim()
  const lastName = values.lastName.trim()
  const displayName = `${firstName} ${lastName}`.trim()

  const body: ContactCreateBody = {
    display_name: displayName || undefined,
    first_name: firstName || undefined,
    last_name: lastName || undefined,
    organization: values.organization?.trim() || undefined,
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
    birthday: values.birthday?.trim() || undefined,
    note: values.note?.trim() || undefined,
    kind: 'individual',
  }

  if (values.photoDataUri) {
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
