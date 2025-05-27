import { apiSlice } from '@/lib/redux/api/api-slice'
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import type { ImapFolder } from '../mails-types'

const injectedEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder: EndpointBuilder<BaseQueryFn, string, 'api'>) => ({
    getFolders: builder.query<ImapFolder, void>({
      query: () => 'mails/folders',
      providesTags: ['mails/folders'],
    }),
  }),
  overrideExisting: false,
})

export const { useGetFoldersQuery } = injectedEndpoints
