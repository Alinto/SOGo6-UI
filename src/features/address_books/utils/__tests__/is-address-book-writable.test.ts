import { isAddressBookWritable, isAddressBookWritableByType } from '../is-address-book-writable'

describe('isAddressBookWritable', () => {
  it('returns true only for personal books', () => {
    expect(
      isAddressBookWritable({
        id: '1',
        name: 'Personal',
        description: '',
        type: 'personal',
      })
    ).toBe(true)
    expect(
      isAddressBookWritable({
        id: '2',
        name: 'Shared',
        description: '',
        type: 'shared',
      })
    ).toBe(false)
    expect(
      isAddressBookWritable({
        id: '3',
        name: 'Global',
        description: '',
        type: 'global',
      })
    ).toBe(false)
  })

  it('checks type helper', () => {
    expect(isAddressBookWritableByType('personal')).toBe(true)
    expect(isAddressBookWritableByType('shared')).toBe(false)
  })
})
