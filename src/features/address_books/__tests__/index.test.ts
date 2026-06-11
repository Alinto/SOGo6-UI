import '@testing-library/jest-dom'

import * as AddressBooks from '../index'

describe('address books feature index', () => {
  describe('re-exports', () => {
    it('does not export type names at runtime', () => {
      expect('VCard' in AddressBooks).toBe(false)
    })
  })

  describe('API hooks', () => {
    it('exports useGetAddressBooksQuery', () => {
      expect(typeof AddressBooks.useGetAddressBooksQuery).toBe('function')
    })

    it('exports useGetVCardQuery', () => {
      expect(typeof AddressBooks.useGetVCardQuery).toBe('function')
    })

    it('exports useMoveVCardToAddressBookMutation', () => {
      expect(typeof AddressBooks.useMoveVCardToAddressBookMutation).toBe('function')
    })
  })

  describe('UI slice', () => {
    it('exports openCreateForm action', () => {
      expect(typeof AddressBooks.openCreateForm).toBe('function')
    })

    it('exports addressBooksUiReducer', () => {
      expect(typeof AddressBooks.addressBooksUiReducer).toBe('function')
    })
  })

  describe('hooks and utilities', () => {
    it('exports useAddressBookState and useAddressBookEditState', () => {
      expect(typeof AddressBooks.useAddressBookState).toBe('function')
      expect(typeof AddressBooks.useAddressBookEditState).toBe('function')
    })

    it('exports contact list utilities', () => {
      expect(typeof AddressBooks.getContactDisplayName).toBe('function')
      expect(typeof AddressBooks.filterAndSortContacts).toBe('function')
    })

    it('exports distribution list utilities', () => {
      expect(typeof AddressBooks.isDistributionList).toBe('function')
      expect(typeof AddressBooks.getDistributionListName).toBe('function')
    })
  })
})
