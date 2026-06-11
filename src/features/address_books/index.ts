export type {
  AddressBook,
  AddressBooks,
  AddressBookType,
  ContactKind,
  ContactMember,
  VCard,
} from './address-books-types'

export {
  useAddAddressBookMutation,
  useAddVCardToAddressBookMutation,
  useDeleteAddressBookMutation,
  useDeleteVCardFromAddressBookMutation,
  useGetAddressBookVCardsQuery,
  useGetAddressBooksQuery,
  useGetVCardQuery,
  useMoveVCardToAddressBookMutation,
  useUpdateAddressBookMutation,
  useUpdateVCardMutation,
  addressBooksApiEndpoints,
} from './store/address-books-api'

export {
  closeForm,
  closeListForm,
  openCreateForm,
  openCreateListForm,
  openEditForm,
  openEditListForm,
  selectAddressBooksUi,
  setFormBookId,
  setSearchQuery,
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
  getDistributionListEmails,
  getDistributionListMemberCount,
  getDistributionListName,
  getMemberDisplayLabel,
  isDistributionList,
  isIndividualContact,
  membersFromContacts,
  vCardToMember,
} from './utils/distribution-list'
