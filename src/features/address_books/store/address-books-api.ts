import {
  ADDRESS_BOOKS_SLICE,
  apiSlice,
  VCARD_SLICE,
} from '@/lib/redux/api/api-slice'
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import type { AddressBook, AddressBooks, VCard } from '../address-books-types'

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
      providesTags: (result, error, { id }) => [{ type: VCARD_SLICE, id }],
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
    }),
    addVCardToAddressBook: builder.mutation<void, { id: string; vCard: VCard }>(
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
      }
    ),
    deleteVCardFromAddressBook: builder.mutation<
      void,
      { id: string; vCardId: string }
    >({
      query: ({ id, vCardId }) => ({
        url: `address_books/${id}/${vCardId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: ADDRESS_BOOKS_SLICE, id },
        { type: ADDRESS_BOOKS_SLICE, id: 'LIST' },
      ],
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
    }),
    deleteAddressBook: builder.mutation<void, string>({
      query: (id) => ({
        url: `address_books/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [ADDRESS_BOOKS_SLICE],
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
  useAddAddressBookMutation,
  useDeleteAddressBookMutation,
} = injectedEndpoints
