import {
  addressBookContactPath,
  addressBookContactsPath,
  addressBookListPath,
  addressBookListsPath,
  addressBookPath,
  addressBooksCollectionPath,
  buildListQueryParams,
  contactsAutocompletePath,
  legacyAddressBookEntriesPath,
  legacyVCardPath,
  isLegacyAddressBooksApi,
} from '../api-routes'

jest.mock('@/lib/env-service', () => ({
  isUsingFakeApi: jest.fn(),
}))

import { isUsingFakeApi } from '@/lib/env-service'

const mockIsUsingFakeApi = isUsingFakeApi as jest.MockedFunction<
  typeof isUsingFakeApi
>

describe('api-routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('backend paths', () => {
    beforeEach(() => {
      mockIsUsingFakeApi.mockReturnValue(false)
    })

    it('uses addressbooks collection path', () => {
      expect(addressBooksCollectionPath()).toBe('addressbooks')
      expect(addressBookPath('ab-1')).toBe('addressbooks/ab-1')
      expect(addressBookContactsPath('ab-1')).toBe('addressbooks/ab-1/contacts')
      expect(addressBookContactPath('ab-1', 'ct-1')).toBe(
        'addressbooks/ab-1/contacts/ct-1'
      )
      expect(addressBookListsPath('ab-1')).toBe('addressbooks/ab-1/lists')
      expect(addressBookListPath('ab-1', 'list-1')).toBe(
        'addressbooks/ab-1/lists/list-1'
      )
    })

    it('encodes special characters in path segments', () => {
      expect(addressBookPath('book/with space')).toBe(
        'addressbooks/book%2Fwith%20space'
      )
    })

    it('returns false for legacy mode', () => {
      expect(isLegacyAddressBooksApi()).toBe(false)
    })
  })

  describe('fakeApi paths', () => {
    beforeEach(() => {
      mockIsUsingFakeApi.mockReturnValue(true)
    })

    it('uses legacy address_books collection path', () => {
      expect(addressBooksCollectionPath()).toBe('address_books')
      expect(addressBookPath('ab-1')).toBe('address_books/ab-1')
      expect(isLegacyAddressBooksApi()).toBe(true)
    })

    it('keeps legacy entry paths unchanged', () => {
      expect(legacyAddressBookEntriesPath('ab-1')).toBe('address_books/ab-1')
      expect(legacyVCardPath('ab-1', 'ct-1')).toBe('address_books/ab-1/ct-1')
    })
  })

  describe('buildListQueryParams', () => {
    it('builds query params from listing options', () => {
      expect(
        buildListQueryParams({
          search: 'alice',
          page: 2,
          page_size: 25,
          sort_by: 'last_name',
          sort_order: 'desc',
        })
      ).toEqual({
        search: 'alice',
        page: 2,
        page_size: 25,
        sort_by: 'last_name',
        sort_order: 'desc',
      })
    })

    it('omits short search when omitShortSearch is enabled', () => {
      expect(
        buildListQueryParams({ search: 'a', page: 1 }, { omitShortSearch: true })
      ).toEqual({ page: 1 })
    })

    it('returns undefined for empty params', () => {
      expect(buildListQueryParams({})).toBeUndefined()
    })
  })

  describe('autocomplete path', () => {
    it('uses contacts autocomplete endpoint', () => {
      expect(contactsAutocompletePath()).toBe('contacts/autocomplete')
    })
  })
})
