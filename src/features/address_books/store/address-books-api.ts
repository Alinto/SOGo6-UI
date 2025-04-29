import { apiSlice } from '@/lib/redux/api/api-slice'
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import type { AddressBook, AddressBooks } from '../address-books-types'

const injectedEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder: EndpointBuilder<BaseQueryFn, string, 'api'>) => ({
    getAddressBooks: builder.query<AddressBooks, void>({
      query: () => 'address_books',
      providesTags: ['address_books'],
    }),
    updateAddressBook: builder.mutation<AddressBook, Partial<AddressBook>>({
      query: ({ ...patch }) => ({
        url: `address_books`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: ['address_books'],
    }),
  }),
  overrideExisting: false,
})

export const { useGetAddressBooksQuery, useUpdateAddressBookMutation } =
  injectedEndpoints
