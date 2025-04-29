export type AddressBookType = 'global' | 'personal' | 'shared'

export interface AddressBook {
  name: string
  description: string
  type: AddressBookType
  id: string
  default?: boolean
}

export interface AddressBooks {
  globals: AddressBook[]
  personals: AddressBook[]
  subscriptions: AddressBook[]
}
