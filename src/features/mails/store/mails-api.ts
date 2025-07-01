import { apiSlice } from '@/lib/redux/api/api-slice'
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import type { ImapFolder, ImapMessagesAPIResponse } from '../mails-types'

const injectedEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder: EndpointBuilder<BaseQueryFn, string, 'api'>) => ({
    getFolders: builder.query<ImapFolder, void>({
      query: () => '/mails/folders',
      providesTags: ['mails/folders'],
    }),
    getFolderMessages: builder.query<
      ImapMessagesAPIResponse,
      { folder: string; params?: Record<string, string | number | boolean> }
    >({
      keepUnusedDataFor: 3600, // 1 hour
      query: ({ folder, params }) => {
        let url = `/mails/folders/${encodeURIComponent(folder)}/messages`
        if (params && Object.keys(params).length > 0) {
          const searchParams = new URLSearchParams()
          Object.entries(params).forEach(([key, value]) => {
            searchParams.append(key, String(value))
          })
          url += `?${searchParams.toString()}`
        }
        return url
      },
      providesTags: (result, error, { folder }) => [
        { type: 'folder/messages', folder },
      ],
    }),
  }),
  overrideExisting: false,
})

export const { useGetFoldersQuery, useGetFolderMessagesQuery } =
  injectedEndpoints
