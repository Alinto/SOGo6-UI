import { createApiNotificationHandler } from '@/features/notifications/api-notification-handler'
import { apiSlice } from '@/lib/redux/api/api-slice'
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import type {
  ImapFolder,
  ImapMessages,
  ImapMessagesAPIResponse,
} from '../mails-types'

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
    getMail: builder.query<ImapMessages, { folder: string; mailId: string }>({
      query: ({ folder, mailId }) =>
        `/mails/folders/${encodeURIComponent(folder)}/messages/${encodeURIComponent(mailId)}`,
      providesTags: (result, error, { mailId }) => [
        { type: 'mail', id: mailId },
      ],
    }),
    moveToTrash: builder.mutation<void, { folder: string; mailId: string }>({
      query: ({ folder, mailId }) => ({
        url: `/mails/folders/${encodeURIComponent(folder)}/messages/${encodeURIComponent(mailId)}/move`,
        method: 'POST',
        body: { destination: 'Trash' },
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        await createApiNotificationHandler(dispatch, {
          successTitle: 'title.success.string',
          successMessage: 'message.success.string',
          errorTitle: 'title.error.string',
          errorMessage: 'message.error.string',
        })(undefined, { queryFulfilled })
      },
      invalidatesTags: (result, error, { folder }) => [
        { type: 'folder/messages', folder },
        'mails/folders',
      ],
    }),
    archiveMail: builder.mutation<void, { folder: string; mailId: string }>({
      query: ({ folder, mailId }) => ({
        url: `/mails/folders/${encodeURIComponent(folder)}/messages/${encodeURIComponent(mailId)}/move`,
        method: 'POST',
        body: { destination: 'Archive' },
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        await createApiNotificationHandler(dispatch, {
          successTitle: 'title.success.string',
          successMessage: 'message.success.string',
          errorTitle: 'title.error.string',
          errorMessage: 'message.error.string',
        })(undefined, { queryFulfilled })
      },
      invalidatesTags: (result, error, { folder }) => [
        { type: 'folder/messages', folder },
        'mails/folders',
      ],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetFoldersQuery,
  useGetFolderMessagesQuery,
  useGetMailQuery,
  useMoveToTrashMutation,
  useArchiveMailMutation,
} = injectedEndpoints

export const mailsApiEndpoints = injectedEndpoints
