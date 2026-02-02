import { createApiNotificationHandler } from '@/features/notifications/api-notification-handler'
import { apiSlice } from '@/lib/redux/api/api-slice'
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import type {
  ImapFolder,
  ImapMessages,
  ImapMessagesList,
  ImapMessagesBackendResponse,
} from '../mails-types'

interface BackendResponse<T> {
  data: T
  error_code: string
  error_msg: string
}

interface PaginationHeader {
  total: number
  total_pages: number
  first_page: number
  last_page: number
  page: number
}

function mapFolderResponse(folder: ImapFolder): ImapFolder {
  return {
    ...folder,
    subfolders: folder.children?.map(mapFolderResponse) || [],
  }
}

function mapMailToListItem(mail: {
  uid?: string
  id?: string
  subject?: string
  from?: { name: string; email: string }
  to?: Array<{ name: string; email: string }>
  date?: string
  seen?: boolean
  flagged?: boolean
  has_attachment?: boolean
  contents?: Array<{ content: string; contentType: string }>
}): ImapMessagesList {

  const textContent = mail.contents?.find((c) => c.contentType === 'text/plain')?.content || ''
  const snippet = textContent
    .replace(/\r\n/g, ' ')
    .replace(/\n/g, ' ')
    .trim()
    .substring(0, 100)

  return {
    id: mail.uid || mail.id || '',
    subject: mail.subject || '(No subject)',
    from: mail.from || { name: '', email: '' },
    to: mail.to || [],
    date: mail.date || '',
    seen: mail.seen || false,
    flagged: mail.flagged || false,
    hasAttachment: mail.has_attachment || false,
    snippet: snippet,
  }
}

const getFoldersQuery = ({ accountId = '0' }: { accountId?: string } = {}) => 
  `/api/user/v1/mailboxes/${accountId}/folders`

const getFolderMessagesQuery = ({
  accountId = '0',
  folder,
  params,
}: {
  accountId?: string
  folder: string
  params?: Record<string, string | number | boolean>
}) => {
  let url = `/api/user/v1/mailboxes/${accountId}/folders/${encodeURIComponent(folder)}/mails`
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value))
    })
    url += `?${searchParams.toString()}`
  }
  return url
}

const getMailQuery = ({ 
  accountId = '0',
  folder, 
  mailId 
}: { 
  accountId?: string
  folder: string
  mailId: string 
}) => `/api/user/v1/mailboxes/${accountId}/folders/${encodeURIComponent(folder)}/mails/${encodeURIComponent(mailId)}`

const moveToTrashQuery = ({
  accountId = '0',
  folder,
  mailId,
}: {
  accountId?: string
  folder: string
  mailId: string
}) => ({
  url: `/api/user/v1/mailboxes/${accountId}/folders/${encodeURIComponent(folder)}/mails/${encodeURIComponent(mailId)}`,
  method: 'DELETE' as const,
})

const injectedEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder: EndpointBuilder<BaseQueryFn, string, 'api'>) => ({
    getFolders: builder.query<ImapFolder[], { accountId?: string }>({
      query: getFoldersQuery,
      transformResponse: (response: BackendResponse<ImapFolder[]>) => {
        const folders = response.data || []
        const mappedFolders = folders.map(mapFolderResponse)
        return mappedFolders
      },
      providesTags: ['mails/folders'],
    }),
    
    getFolderMessages: builder.query<
      ImapMessagesBackendResponse,
      { 
        accountId?: string
        folder: string
        params?: Record<string, string | number | boolean> 
      }
    >({
      keepUnusedDataFor: 3600,
      query: getFolderMessagesQuery,
      transformResponse: (
        response: BackendResponse<
          Array<{
            uid?: string
            id?: string
            subject?: string
            from?: { name: string; email: string }
            to?: Array<{ name: string; email: string }>
            date?: string
            seen?: boolean
            flagged?: boolean
            has_attachment?: boolean
            contents?: Array<{ content: string; contentType: string }>
          }>
        >,
        meta: { response?: Response }
      ) => {
        
        const paginationHeader = meta?.response?.headers?.get('X-Pagination')
        let total = 0
        let totalPages = 1
        let page = 1
        
        if (paginationHeader) {
          try {
            const pagination: PaginationHeader = JSON.parse(paginationHeader)
            total = pagination.total || 0
            totalPages = pagination.total_pages || 1
            page = pagination.page || 1
          } catch (e) {
            console.error('❌ Failed to parse pagination header:', e)
          }
        }
        
        const mails = (response.data || []).map(mapMailToListItem)
        
        const result: ImapMessagesBackendResponse = {
          mails: mails,
          total: total,
          page: page,
          totalPages: totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        }
        
        return result
      },
      providesTags: (result, error, { folder }) => [
        { type: 'folder/messages', folder },
      ],
    }),
    
    getMail: builder.query<ImapMessages, { 
      accountId?: string
      folder: string
      mailId: string 
    }>({
      query: getMailQuery,
      transformResponse: (response: BackendResponse<ImapMessages> | ImapMessages) => {
        if ('data' in response) {
          return response.data
        }
        return response
      },
      providesTags: (result, error, { mailId }) => [
        { type: 'mail', id: mailId },
      ],
    }),
    
    moveToTrash: builder.mutation<void, { 
      accountId?: string
      folder: string
      mailId: string 
    }>({
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
