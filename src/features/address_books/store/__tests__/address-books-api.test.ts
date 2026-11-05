import '@testing-library/jest-dom'

import * as AddressBooksApi from '../address-books-api'

describe('address-books-api', () => {
  it('exports address book queries', () => {
    expect(typeof AddressBooksApi.useGetAddressBooksQuery).toBe('function')
    expect(typeof AddressBooksApi.useGetAddressBookVCardsQuery).toBe('function')
    expect(typeof AddressBooksApi.useGetVCardQuery).toBe('function')
    expect(typeof AddressBooksApi.useSearchContactsAutocompleteQuery).toBe(
      'function'
    )
    expect(typeof AddressBooksApi.useSearchGabAutocompleteQuery).toBe(
      'function'
    )
  })

  it('exports address book mutations', () => {
    expect(typeof AddressBooksApi.useAddVCardToAddressBookMutation).toBe(
      'function'
    )
    expect(typeof AddressBooksApi.useUpdateVCardMutation).toBe('function')
    expect(typeof AddressBooksApi.useDeleteVCardFromAddressBookMutation).toBe(
      'function'
    )
    expect(typeof AddressBooksApi.useAddAddressBookMutation).toBe('function')
    expect(typeof AddressBooksApi.useUpdateAddressBookMutation).toBe('function')
    expect(typeof AddressBooksApi.useDeleteAddressBookMutation).toBe('function')
    expect(typeof AddressBooksApi.useImportAddressBookDocumentMutation).toBe(
      'function'
    )
    expect(typeof AddressBooksApi.useImportContactsDocumentMutation).toBe(
      'function'
    )
    expect(typeof AddressBooksApi.useImportListsDocumentMutation).toBe(
      'function'
    )
    expect(typeof AddressBooksApi.useExportAddressBookDocumentMutation).toBe(
      'function'
    )
    expect(typeof AddressBooksApi.useExportContactDocumentMutation).toBe(
      'function'
    )
    expect(typeof AddressBooksApi.useExportListDocumentMutation).toBe(
      'function'
    )
  })

  it('exports addressBooksApiEndpoints', () => {
    expect(AddressBooksApi.addressBooksApiEndpoints).toBeDefined()
    expect(
      AddressBooksApi.addressBooksApiEndpoints.endpoints.addVCardToAddressBook
    ).toBeDefined()
    expect(
      AddressBooksApi.addressBooksApiEndpoints.endpoints
        .searchContactsAutocomplete
    ).toBeDefined()
    expect(
      AddressBooksApi.addressBooksApiEndpoints.endpoints.searchGabAutocomplete
    ).toBeDefined()
  })

  describe('shared address books', () => {
    it('exports the shared address books hooks', () => {
      expect(typeof AddressBooksApi.useGetSharedAddressBookUsersQuery).toBe(
        'function'
      )
      expect(typeof AddressBooksApi.useGetSharedAddressBooksByOwnerQuery).toBe(
        'function'
      )
      expect(
        typeof AddressBooksApi.useUpdateSharedAddressBookSubscriptionMutation
      ).toBe('function')
    })

    it('builds the paginated users query with a trimmed search', () => {
      expect(
        AddressBooksApi.getSharedAddressBookUsersQuery({
          page: 2,
          page_size: 20,
          search: '  sogo ',
        })
      ).toEqual({
        url: 'shared-addressbooks/users',
        params: { page: 2, page_size: 20, search: 'sogo' },
      })
    })

    it('omits an empty search from the users query', () => {
      expect(
        AddressBooksApi.getSharedAddressBookUsersQuery({
          page: 1,
          page_size: 20,
          search: '   ',
        }).params
      ).toEqual({ page: 1, page_size: 20 })
    })

    it("builds the owner's address books query with an encoded owner", () => {
      expect(
        AddressBooksApi.getSharedAddressBooksByOwnerQuery('a b@x.org')
      ).toBe('shared-addressbooks/a%20b%40x.org')
    })

    it('normalizes the backend users response (mail, no total)', () => {
      expect(
        AddressBooksApi.normalizeSharedAddressBookUsersResponse({
          data: {
            users: [
              { mail: 'sogo-tests1@example.org', username: 'Didy' },
              { mail: 'nameless@example.org', username: '' },
              { username: 'No mail' },
            ],
          },
          error_code: 'S000000',
          error_msg: 'No Error',
        } as never)
      ).toEqual({
        users: [
          { owner: 'sogo-tests1@example.org', username: 'Didy' },
          { owner: 'nameless@example.org', username: 'nameless@example.org' },
        ],
      })
    })

    it('keeps the total and accepts `owner` when the backend sends them', () => {
      expect(
        AddressBooksApi.normalizeSharedAddressBookUsersResponse({
          users: [{ owner: 'a@x.org', username: 'A' }],
          total_count: 42,
        })
      ).toEqual({
        users: [{ owner: 'a@x.org', username: 'A' }],
        total_count: 42,
      })
    })

    it('takes the totals from the X-Pagination header', () => {
      expect(
        AddressBooksApi.normalizeSharedAddressBookUsersResponse(
          { data: { users: [{ mail: 'a@x.org', username: 'A' }] } } as never,
          { total: 21, totalPages: 2, page: 1 }
        )
      ).toEqual({
        users: [{ owner: 'a@x.org', username: 'A' }],
        total_count: 21,
        total_pages: 2,
      })
    })

    it('builds the subscribe query with an encoded key', () => {
      expect(
        AddressBooksApi.updateSharedAddressBookSubscriptionQuery({
          key: 'book 1',
          subscribe: true,
        })
      ).toEqual({
        url: 'shared-addressbooks/book%201',
        method: 'PUT',
        body: { subscribe: 1 },
      })
    })

    it('builds the unsubscribe query', () => {
      expect(
        AddressBooksApi.updateSharedAddressBookSubscriptionQuery({
          key: 'book-1',
          subscribe: false,
        })
      ).toEqual({
        url: 'shared-addressbooks/book-1',
        method: 'PUT',
        body: { subscribe: 0 },
      })
    })

    it('fills in the owner when an address book comes without it', () => {
      const [book] = AddressBooksApi.normalizeSharedAddressBooksResponse(
        { data: [{ key: 'ab-2', name: 'Suppliers' }] } as never,
        'sogo-tests2@example.org'
      )
      expect(book).toMatchObject({
        key: 'ab-2',
        owner: 'sogo-tests2@example.org',
        name_owner: null,
        subscribed: false,
      })
    })

    it("normalizes the wrapped owner's address books response", () => {
      const result = AddressBooksApi.normalizeSharedAddressBooksResponse({
        data: {
          addressbooks: [
            {
              key: '52f612e6',
              name: 'Personal contacts',
              description: null,
              owner: 'sogo-tests1@example.org',
              subscribed: false,
            },
          ],
        },
        error_code: 'S000000',
        error_msg: 'No Error',
      } as never)
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        key: '52f612e6',
        name: 'Personal contacts',
        description: null,
        owner: 'sogo-tests1@example.org',
        name_owner: null,
        subscribed: false,
      })
    })
  })
})
