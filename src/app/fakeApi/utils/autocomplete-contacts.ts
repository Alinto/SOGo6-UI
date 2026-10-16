import type { VCard } from '@/features/address_books/address-books-types'

/** Address book holding the autocomplete contacts (see DEFAULT_VCARDS). */
export const AUTOCOMPLETE_ADDRESS_BOOK = {
  key: 'personal',
  name: 'Personal Address Book',
}

type AutocompleteContact = {
  contact_key: string
  email: string
  firstName: string
  lastName: string
  phone: string
}

const CONTACTS: AutocompleteContact[] = [
  ['jdupont', 'Jean', 'Dupont', '+33 1 42 00 00 01'],
  ['mleblanc', 'Marie', 'Leblanc', '+33 6 12 00 00 02'],
  ['pmartin', 'Pierre', 'Martin', '+33 1 42 00 00 03'],
  ['srobert', 'Sophie', 'Robert', '+33 6 12 00 00 04'],
  ['abernard', 'Antoine', 'Bernard', '+33 1 42 00 00 05'],
  ['lmoreau', 'Lucie', 'Moreau', '+33 6 12 00 00 06'],
  ['nthomas', 'Nicolas', 'Thomas', '+33 1 42 00 00 07'],
  ['csimon', 'Claire', 'Simon', '+33 6 12 00 00 08'],
  ['vdubois', 'Victor', 'Dubois', '+33 1 42 00 00 09'],
  ['eleroy', 'Émilie', 'Leroy', '+33 6 12 00 00 10'],
].map(([contact_key, firstName, lastName, phone]) => ({
  contact_key,
  email: `${contact_key}@sogo.eu`,
  firstName,
  lastName,
  phone,
}))

/** Autocomplete payload shape (`contact_key`, `email`, `name`). */
export const AUTOCOMPLETE_CONTACTS = CONTACTS.map(
  ({ contact_key, email, firstName, lastName }) => ({
    contact_key,
    email,
    name: `${firstName} ${lastName}`,
  })
)

/**
 * The same people as address book contacts, so a recipient picked from the
 * autocomplete can be found, shown and edited. Kept minimal: demo data lives
 * in a size-limited cookie.
 */
export const AUTOCOMPLETE_VCARDS: VCard[] = CONTACTS.map(
  ({ contact_key, email, firstName, lastName, phone }) => ({
    id: contact_key,
    version: '4.0',
    firstName,
    lastName,
    emails: [email],
    phoneNumbers: [phone],
  })
)
