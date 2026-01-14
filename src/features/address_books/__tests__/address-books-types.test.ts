import type {
  AddressBook,
  AddressBookType,
  VCard,
} from '../address-books-types'

describe('Address Books Types', () => {
  it('should have valid AddressBook type', () => {
    const addressBook: AddressBook = {
      id: 'test',
      name: 'Test',
      description: 'Test description',
      type: 'personal',
      default: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    expect(addressBook.id).toBe('test')
    expect(addressBook.type).toBe('personal')
  })

  it('should have valid VCard type', () => {
    const vcard: VCard = {
      id: '1',
      version: '4.0',
      firstName: 'John',
      lastName: 'Doe',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    expect(vcard.firstName).toBe('John')
    expect(vcard.version).toBe('4.0')
  })

  it('should have valid AddressBookType union', () => {
    const types: AddressBookType[] = ['global', 'personal', 'shared']
    expect(types).toHaveLength(3)
  })
})
