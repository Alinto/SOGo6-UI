import { createApiNotificationHandler } from '@/features/notifications/api-notification-handler'
import {
  ADDRESS_BOOKS_SLICE,
  apiSlice,
  VCARD_SLICE,
} from '@/lib/redux/api/api-slice'
import type { AppDispatch } from '@/lib/redux/store'
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import type { AddressBook, AddressBooks, VCard } from '../address-books-types'

const vcardBookTag = (bookId: string) => ({
  type: VCARD_SLICE,
  id: `book:${bookId}`,
})

const notifyMutation =
  (options: {
    successTitle: string
    successMessage: string
    errorTitle: string
    errorMessage: string
  }) =>
  async (
    dispatch: AppDispatch,
    { queryFulfilled }: { queryFulfilled: Promise<unknown> }
  ) => {
    await createApiNotificationHandler(dispatch, options)(undefined, {
      queryFulfilled,
    })
  }

const notifyEntryCreate = notifyMutation({
  successTitle: 'address_book_entry_create.success.title.string',
  successMessage: 'address_book_entry_create.success.message.string',
  errorTitle: 'address_book_entry_create.error.title.string',
  errorMessage: 'address_book_entry_create.error.message.string',
})

const notifyEntryUpdate = notifyMutation({
  successTitle: 'address_book_entry_update.success.title.string',
  successMessage: 'address_book_entry_update.success.message.string',
  errorTitle: 'address_book_entry_update.error.title.string',
  errorMessage: 'address_book_entry_update.error.message.string',
})

const notifyEntryDelete = notifyMutation({
  successTitle: 'address_book_entry_delete.success.title.string',
  successMessage: 'address_book_entry_delete.success.message.string',
  errorTitle: 'address_book_entry_delete.error.title.string',
  errorMessage: 'address_book_entry_delete.error.message.string',
})

const notifyEntryMove = notifyMutation({
  successTitle: 'address_book_entry_move.success.title.string',
  successMessage: 'address_book_entry_move.success.message.string',
  errorTitle: 'address_book_entry_move.error.title.string',
  errorMessage: 'address_book_entry_move.error.message.string',
})

const notifyBookCreate = notifyMutation({
  successTitle: 'address_book_create.success.title.string',
  successMessage: 'address_book_create.success.message.string',
  errorTitle: 'address_book_create.error.title.string',
  errorMessage: 'address_book_create.error.message.string',
})

const notifyBookUpdate = notifyMutation({
  successTitle: 'address_book_update.success.title.string',
  successMessage: 'address_book_update.success.message.string',
  errorTitle: 'address_book_update.error.title.string',
  errorMessage: 'address_book_update.error.message.string',
})

const notifyBookDelete = notifyMutation({
  successTitle: 'address_book_delete.success.title.string',
  successMessage: 'address_book_delete.success.message.string',
  errorTitle: 'address_book_delete.error.title.string',
  errorMessage: 'address_book_delete.error.message.string',
})

const injectedEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder: EndpointBuilder<BaseQueryFn, string, 'api'>) => ({
    getAddressBooks: builder.query<AddressBooks, void>({
      query: () => 'address_books',
      providesTags: [ADDRESS_BOOKS_SLICE],
    }),
    getAddressBookVCards: builder.query<VCard[], string>({
      query: (id) => `address_books/${id}`,
      providesTags: (result, error, id) => [{ type: ADDRESS_BOOKS_SLICE, id }],
    }),
    getVCard: builder.query<VCard, { book_id: string; id: string }>({
      query: ({ book_id, id }) => `address_books/${book_id}/${id}`,
      providesTags: (result, error, { id, book_id }) => [
        { type: VCARD_SLICE, id },
        vcardBookTag(book_id),
      ],
    }),
    updateVCard: builder.mutation<VCard, Partial<VCard> & { book_id: string }>({
      query: ({ book_id, id, ...patch }) => ({
        url: `address_books/${book_id}/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id, book_id }) => [
        { type: VCARD_SLICE, id },
        { type: ADDRESS_BOOKS_SLICE, id: book_id },
      ],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await notifyEntryUpdate(dispatch, { queryFulfilled })
      },
    }),
    addVCardToAddressBook: builder.mutation<VCard, { id: string; vCard: VCard }>(
      {
        query: ({ id, vCard }) => ({
          url: `address_books/${id}`,
          method: 'POST',
          body: vCard,
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: ADDRESS_BOOKS_SLICE, id },
          { type: ADDRESS_BOOKS_SLICE, id: 'LIST' },
        ],
        async onQueryStarted(_, { dispatch, queryFulfilled }) {
          await notifyEntryCreate(dispatch, { queryFulfilled })
        },
      }
    ),
    moveVCardToAddressBook: builder.mutation<
      void,
      { sourceBookId: string; targetBookId: string; vCardId: string }
    >({
      query: ({ sourceBookId, targetBookId, vCardId }) => ({
        url: `address_books/${sourceBookId}/${vCardId}/move`,
        method: 'POST',
        body: { targetBookId },
      }),
      invalidatesTags: (result, error, { sourceBookId, targetBookId, vCardId }) => [
        { type: ADDRESS_BOOKS_SLICE, id: sourceBookId },
        { type: ADDRESS_BOOKS_SLICE, id: targetBookId },
        { type: ADDRESS_BOOKS_SLICE, id: 'LIST' },
        { type: VCARD_SLICE, id: vCardId },
        vcardBookTag(sourceBookId),
        vcardBookTag(targetBookId),
      ],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await notifyEntryMove(dispatch, { queryFulfilled })
      },
    }),
    deleteVCardFromAddressBook: builder.mutation<
      void,
      { id: string; vCardId: string }
    >({
      query: ({ id, vCardId }) => ({
        url: `address_books/${id}/${vCardId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { id: bookId, vCardId }) => [
        { type: ADDRESS_BOOKS_SLICE, id: bookId },
        { type: ADDRESS_BOOKS_SLICE, id: 'LIST' },
        { type: VCARD_SLICE, id: vCardId },
        vcardBookTag(bookId),
      ],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await notifyEntryDelete(dispatch, { queryFulfilled })
      },
    }),
    updateAddressBook: builder.mutation<
      AddressBook,
      Partial<AddressBook> & { id: string }
    >({
      query: ({ id, ...patch }) => ({
        url: `address_books/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: [ADDRESS_BOOKS_SLICE],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await notifyBookUpdate(dispatch, { queryFulfilled })
      },
    }),
    deleteAddressBook: builder.mutation<void, string>({
      query: (id) => ({
        url: `address_books/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [ADDRESS_BOOKS_SLICE],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await notifyBookDelete(dispatch, { queryFulfilled })
      },
    }),
    addAddressBook: builder.mutation<
      AddressBook,
      Omit<AddressBook, 'id' | 'default'>
    >({
      query: (addressBook) => ({
        url: ADDRESS_BOOKS_SLICE,
        method: 'POST',
        body: addressBook,
      }),
      invalidatesTags: [ADDRESS_BOOKS_SLICE],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await notifyBookCreate(dispatch, { queryFulfilled })
      },
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetAddressBooksQuery,
  useUpdateAddressBookMutation,
  useGetAddressBookVCardsQuery,
  useGetVCardQuery,
  useUpdateVCardMutation,
  useAddVCardToAddressBookMutation,
  useDeleteVCardFromAddressBookMutation,
  useMoveVCardToAddressBookMutation,
  useAddAddressBookMutation,
  useDeleteAddressBookMutation,
} = injectedEndpoints

export const addressBooksApiEndpoints = injectedEndpoints
