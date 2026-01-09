export interface AddressBookData {
  globals: Array<{
    name: string
    description: string
    type: 'global'
    id: string
  }>
  personals: Array<{
    name: string
    description: string
    type: 'personal'
    id: string
    default?: boolean
  }>
  subscriptions: Array<{
    name: string
    description: string
    type: 'shared'
    id: string
  }>
}

declare global {
  var __addressBooksData: AddressBookData | undefined
}

function initializeData(): AddressBookData {
  return {
    globals: [
      {
        name: 'Global',
        description: 'Global address book',
        type: 'global',
        id: 'global',
      },
      {
        name: 'Customers',
        description: 'Customers address book',
        type: 'global',
        id: 'customers',
      },
    ],
    personals: [
      {
        name: 'Work',
        description: 'Work address book',
        type: 'personal',
        id: 'work',
        default: true,
      },
      {
        name: 'Personal',
        description: 'kids address book',
        type: 'personal',
        id: 'personal',
      },
    ],
    subscriptions: [
      {
        name: 'SmokedKimchi address book',
        description: 'Shared address book',
        type: 'shared',
        id: 'smokedkimchi',
      },
    ],
  }
}

if (!globalThis.__addressBooksData) {
  globalThis.__addressBooksData = initializeData()
}

export const addressBooksData = globalThis.__addressBooksData
