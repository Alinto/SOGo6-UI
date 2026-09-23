export type {
  AddressBook,
  AddressBookType,
  AddressBooks,
  ContactKind,
  ContactMember,
  VCard,
} from './address-books-types'

export {
  addressBooksApiEndpoints,
  useAddAddressBookMutation,
  useAddVCardToAddressBookMutation,
  useDeleteAddressBookMutation,
  useDeleteVCardFromAddressBookMutation,
  useGetAddressBookContactPickerQuery,
  useGetAddressBookVCardsQuery,
  useGetAddressBooksQuery,
  useGetVCardQuery,
  useLazySearchContactsAutocompleteQuery,
  useSearchContactsAutocompleteQuery,
  useUpdateAddressBookMutation,
  useUpdateVCardMutation,
} from './store/address-books-api'

export {
  closeForm,
  closeListForm,
  openCreateForm,
  openCreateListForm,
  openEditForm,
  openEditListForm,
  selectAddressBooksUi,
  setBookRights,
  setFormBookId,
  setPage,
  setPageSize,
  setSearchQuery,
  setSortBy,
  toggleSortOrder,
} from './store/address-books-ui-slice'

export type {
  AddressBooksUiState,
  ContactSortOrder,
} from './store/address-books-ui-slice'

export { default as addressBooksUiReducer } from './store/address-books-ui-slice'

export {
  filterAndSortContacts,
  getContactDisplayName,
  parseContactName,
  partitionAddressBookEntries,
} from './utils/contact-list'

export {
  resolveDefaultAddressBookId,
  resolveDefaultBookId,
} from './utils/resolve-default-book'

export { buildAddressBookDavUrl } from './utils/address-book-url'

export {
  useAddressBookEditState,
  useAddressBookState,
} from './hooks/use-address-book-state'

export {
  selectBookEntriesItems,
  useAddressBookEntries,
} from './hooks/use-address-book-entries'

export { useAddressBookContactPicker } from './hooks/use-address-book-contact-picker'

export { useRecipientSuggestions } from './hooks/use-recipient-suggestions'

export {
  getDistributionListEmails,
  getDistributionListMemberCount,
  getDistributionListName,
  getMemberDisplayLabel,
  isDistributionList,
  isIndividualContact,
  membersFromContacts,
  vCardToMember,
} from './utils/distribution-list'
