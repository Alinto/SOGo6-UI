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

export interface VCard {
  id: string
  version: string
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
  phoneNumbers?: string[]
  addresses?: string[]
  impp?: string[]
  geo?: string
  birthday?: string
  anniversary?: string
  sound?: string
  uid?: string
  key?: string
  created_at?: string
  updated_at?: string
}
