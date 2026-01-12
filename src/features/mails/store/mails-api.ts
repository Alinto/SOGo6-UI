import { createApiNotificationHandler } from '@/features/notifications/api-notification-handler'
import { apiSlice } from '@/lib/redux/api/api-slice'
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import type {
  ImapFolder,
  ImapMessages,
  ImapMessagesAPIResponse,
} from '../mails-types'

const getFoldersQuery = () => '/mails/folders'

const getFolderMessagesQuery = ({
  folder,
  params,
}: {
  folder: string
  params?: Record<string, string | number | boolean>
}) => {
  let url = `/mails/folders/${encodeURIComponent(folder)}/messages`
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value))
    })
    url += `?${searchParams.toString()}`
  }
  return url
}

const getMailQuery = ({ folder, mailId }: { folder: string; mailId: string }) =>
  `/mails/folders/${encodeURIComponent(folder)}/messages/${encodeURIComponent(mailId)}`

const moveToTrashQuery = ({
  folder,
  mailId,
}: {
  folder: string
  mailId: string
}) => ({
  url: `/mails/folders/${encodeURIComponent(folder)}/messages/${encodeURIComponent(mailId)}/move`,
  method: 'POST' as const,
  body: { destination: 'Trash' },
})

const injectedEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder: EndpointBuilder<BaseQueryFn, string, 'api'>) => ({
    getFolders: builder.query<ImapFolder, void>({
      query: getFoldersQuery,
      providesTags: ['mails/folders'],
    }),
    getFolderMessages: builder.query<
      ImapMessagesAPIResponse,
      { folder: string; params?: Record<string, string | number | boolean> }
    >({
      keepUnusedDataFor: 3600, // 1 hour
      query: getFolderMessagesQuery,
      providesTags: (result, error, { folder }) => [
        { type: 'folder/messages', folder },
      ],
    }),
    getMail: builder.query<ImapMessages, { folder: string; mailId: string }>({
      query: getMailQuery,
      providesTags: (result, error, { mailId }) => [
        { type: 'mail', id: mailId },
      ],
    }),
    moveToTrash: builder.mutation<void, { folder: string; mailId: string }>({
      query: moveToTrashQuery,
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
} = injectedEndpoints

export const mailsApiEndpoints = injectedEndpoints

export {
  getFolderMessagesQuery,
  getFoldersQuery,
  getMailQuery,
  moveToTrashQuery,
}
