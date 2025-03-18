import { apiSlice } from '@/lib/redux/api/api-slice'
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import type { AddressBook } from '../address-books-types'

const injectedEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder: EndpointBuilder<BaseQueryFn, string, 'api'>) => ({
    getAddressBooksSettings: builder.query<AddressBook[], void>({
      query: () => 'settings/address_books',
      providesTags: ['address_books_settings'],
    }),
    addAddressBooksSettings: builder.mutation<
      AddressBook,
      Omit<AddressBook, 'id'>
    >({
      query: ({ ...addressBook }) => ({
        url: 'settings/address_books',
        method: 'POST',
        body: addressBook,
      }),
      invalidatesTags: ['address_books_settings'],
    }),
    updateAddressBooksSettings: builder.mutation<
      AddressBook,
      Partial<AddressBook>
    >({
      query: ({ ...patch }) => ({
        url: `settings/address_books`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: ['address_books_settings'],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetAddressBooksSettingsQuery,
  useAddAddressBooksSettingsMutation,
  useUpdateAddressBooksSettingsMutation,
} = injectedEndpoints
