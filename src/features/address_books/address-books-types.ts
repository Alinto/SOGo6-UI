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

/** Booleans a share grantee can hold on an address book's cards. */
export interface AddressBookShareRights {
  can_view: boolean
  can_create_objects: boolean
  can_edit_objects: boolean
  can_erase_objects: boolean
}

/**
 * 'any-authenticated-user' is the pseudo-entry granting access to anyone
 * logged in, mirroring CalendarShareUserClass/FolderShareUserClass from the
 * calendar/mail features.
 */
export type AddressBookShareUserClass = 'normal-user' | 'any-authenticated-user'

export interface AddressBookShareUser {
  uid: string
  c_email?: string
  userClass: AddressBookShareUserClass
  rights: AddressBookShareRights
  /** Whether the owner has force-subscribed this user (added to their list directly). */
  subscribed?: boolean
}

export interface AddressBookShareData {
  users: Record<string, AddressBookShareUser>
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
