import { apiSlice } from '@/lib/redux/api/api-slice'
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import type { AddressBook, AddressBooks, VCard } from '../address-books-types'

const injectedEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder: EndpointBuilder<BaseQueryFn, string, 'api'>) => ({
    getAddressBooks: builder.query<AddressBooks, void>({
      query: () => 'address_books',
      providesTags: ['address_books'],
    }),
    getAddressBookVCards: builder.query<VCard[], string>({
      query: (id) => `address_books/${id}`,
      providesTags: (result, error, id) => [{ type: 'address_books', id }],
    }),
    getVCard: builder.query<VCard, { book_id: string; id: string }>({
      query: ({ book_id, id }) => `address_books/${book_id}/${id}`,
      providesTags: (result, error, { id }) => [{ type: 'vcard', id }],
    }),
    updateVCard: builder.mutation<VCard, Partial<VCard> & { book_id: string }>({
      query: ({ book_id, id, ...patch }) => ({
        url: `address_books/${book_id}/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id, book_id }) => [
        { type: 'vcard', id },
        { type: 'address_books', id: book_id },
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
          { type: 'address_books', id },
          { type: 'address_books', id: 'LIST' },
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
        { type: 'address_books', id },
        { type: 'address_books', id: 'LIST' },
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
      invalidatesTags: ['address_books'],
    }),
    deleteAddressBook: builder.mutation<void, string>({
      query: (id) => ({
        url: `address_books/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['address_books'],
    }),
    addAddressBook: builder.mutation<
      AddressBook,
      Omit<AddressBook, 'id' | 'default'>
    >({
      query: (addressBook) => ({
        url: 'address_books',
        method: 'POST',
        body: addressBook,
      }),
      invalidatesTags: ['address_books'],
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
