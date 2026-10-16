import type { VCard } from '../address-books-types'
import { getContactDisplayName } from './contact-list'
import { getContactPhotoSrc } from './contact-photo'

type ContactFields = Omit<VCard, 'id'>

// `emails`/`phoneNumbers` and their structured variants hold the same
// values (see normalizeContact): read one of them, never both.
export function getContactEmails(
  contact: Pick<VCard, 'emails' | 'structuredEmails'>
): string[] {
  return (
    contact.structuredEmails?.length
      ? contact.structuredEmails.map((entry) => entry.value)
      : (contact.emails ?? [])
  ).filter(Boolean)
}

export function getContactPhones(
  contact: Pick<VCard, 'phoneNumbers' | 'structuredPhones'>
): string[] {
  return (
    contact.structuredPhones?.length
      ? contact.structuredPhones.map((phone) => phone.number)
      : (contact.phoneNumbers ?? [])
  ).filter(Boolean)
}

const sameList = (a: string[], b: string[]) =>
  a.length === b.length && a.every((value, index) => value === b[index])

/**
 * What a contact edit changes in a compose recipient card: the name (also
 * shown on the recipient tag), and the card details (emails, phones, photo).
 * Without the contact as it was before, everything counts as changed.
 */
export function getRecipientCardChanges(
  before: VCard | null | undefined,
  after: ContactFields
): { nameChanged: boolean; cardChanged: boolean } {
  if (!before) return { nameChanged: true, cardChanged: true }

  const afterCard = { ...after, id: before.id }
  const nameChanged =
    getContactDisplayName(before) !== getContactDisplayName(afterCard)
  // `photos` is left undefined when the form kept the current photo.
  const photoChanged =
    after.photos !== undefined && after.photos[0] !== getContactPhotoSrc(before)

  return {
    nameChanged,
    cardChanged:
      nameChanged ||
      photoChanged ||
      !sameList(getContactEmails(before), getContactEmails(afterCard)) ||
      !sameList(getContactPhones(before), getContactPhones(afterCard)),
  }
}
