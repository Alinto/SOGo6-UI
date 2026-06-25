import type {
  ApiContactAddress,
  ApiContactEmail,
  ApiContactPhone,
} from '../address-books-api-types'

export type AddressBookType = 'global' | 'personal' | 'shared'

export interface AddressBook {
  name: string
  description: string
  type: AddressBookType
  id: string
  default?: boolean
  created_at?: string
  updated_at?: string
}

export interface AddressBooks {
  globals: AddressBook[]
  personals: AddressBook[]
  subscriptions: AddressBook[]
}

export type ContactKind = 'individual' | 'group' | 'org'

export interface ContactMember {
  contactId?: string
  email: string
  displayName?: string
}

export interface VCard {
  id: string
  version: string
  kind?: ContactKind
  members?: ContactMember[]
  firstName: string
  lastName: string
  middleName?: string
  prefix?: string
  suffix?: string
  nickname?: string
  title?: string
  organization?: string
  department?: string
  jobTitle?: string
  photo?: string
  note?: string
  categories?: string[]
  urls?: string[]
  photos?: string[]
  emails?: string[]
  structuredEmails?: ApiContactEmail[]
  phoneNumbers?: string[]
  structuredPhones?: ApiContactPhone[]
  addresses?: string[]
  structuredAddresses?: ApiContactAddress[]
  impp?: string[]
  geo?: string
  birthday?: string
  anniversary?: string
  sound?: string
  uid?: string
  key?: string
  addressBookKey?: string
  created_at?: string
  updated_at?: string
}
