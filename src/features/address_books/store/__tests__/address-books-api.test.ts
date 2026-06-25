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
  })

  it('exports address book mutations', () => {
    expect(typeof AddressBooksApi.useAddVCardToAddressBookMutation).toBe('function')
    expect(typeof AddressBooksApi.useUpdateVCardMutation).toBe('function')
    expect(typeof AddressBooksApi.useDeleteVCardFromAddressBookMutation).toBe(
      'function'
    )
    expect(typeof AddressBooksApi.useAddAddressBookMutation).toBe('function')
    expect(typeof AddressBooksApi.useUpdateAddressBookMutation).toBe('function')
    expect(typeof AddressBooksApi.useDeleteAddressBookMutation).toBe('function')
    expect(typeof AddressBooksApi.useImportAddressBookDocumentMutation).toBe('function')
    expect(typeof AddressBooksApi.useImportContactsDocumentMutation).toBe('function')
    expect(typeof AddressBooksApi.useImportListsDocumentMutation).toBe('function')
    expect(typeof AddressBooksApi.useExportAddressBookDocumentMutation).toBe('function')
    expect(typeof AddressBooksApi.useExportContactDocumentMutation).toBe('function')
    expect(typeof AddressBooksApi.useExportListDocumentMutation).toBe('function')
  })

  it('exports addressBooksApiEndpoints', () => {
    expect(AddressBooksApi.addressBooksApiEndpoints).toBeDefined()
    expect(
      AddressBooksApi.addressBooksApiEndpoints.endpoints.addVCardToAddressBook
    ).toBeDefined()
    expect(
      AddressBooksApi.addressBooksApiEndpoints.endpoints.searchContactsAutocomplete
    ).toBeDefined()
  })
})
