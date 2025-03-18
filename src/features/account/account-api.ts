import { apiSlice } from '@/lib/redux/api/api-slice'
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import type { Account } from './account-types'

export const injectAccountEndpoints = () => {
  const injectedEndpoints = apiSlice.injectEndpoints({
    endpoints: (builder: EndpointBuilder<BaseQueryFn, string, 'api'>) => ({
      getAccounts: builder.query<Account[], void>({
        query: () => 'accounts',
      }),
      getAccountById: builder.query<Account, string>({
        query: (id) => `accounts/${id}`,
      }),
      createAccount: builder.mutation<Account, Partial<Account>>({
        query: (newAccount) => ({
          url: 'accounts',
          method: 'POST',
          body: newAccount,
        }),
      }),
      updateAccount: builder.mutation<Account, Partial<Account>>({
        query: ({ id, ...patch }) => ({
          url: `accounts/${id}`,
          method: 'PATCH',
          body: patch,
        }),
      }),
      deleteAccount: builder.mutation<{ success: boolean; id: string }, string>(
        {
          query: (id) => ({
            url: `accounts/${id}`,
            method: 'DELETE',
          }),
        }
      ),
    }),
    overrideExisting: false,
  })

  return injectedEndpoints
}
