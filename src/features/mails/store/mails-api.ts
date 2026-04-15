import { createApiNotificationHandler } from '@/features/notifications/api-notification-handler'
import {
  apiSlice,
  FOLDER_MESSAGES_SLICE,
  FOLDER_SHARE_SLICE,
  MAIL_SLICE,
  MAILS_FOLDERS_SLICE,
} from '@/lib/redux/api/api-slice'
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import type {
  CreateFolderBody,
  FolderShareData,
  FolderShareUser,
  ImapAttachments,
  ImapFolder,
  ImapMessages,
  ImapMessagesAPIResponse,
  ImapMessagesBackendResponse,
  ImapMessagesList,
} from '../mails-types'
import { sortImapFoldersTree } from '../utils/sort-folders'

interface BackendResponse<T> {
  data: T
  error_code: string
  error_msg: string
}

export interface MailListQueryParams {
  page?: number | string
  page_size?: number | string
  sort_by?: 'date' | 'from' | 'cc' | 'size' | 'subject' | 'to'
  sort_order?: 'asc' | 'desc'
  fields?: string
  fields_action?: 'include' | 'exclude'
}

/** Folder payloads may still use legacy `unseen` instead of `unseen_count`. */
type RawImapFolder = Omit<ImapFolder, 'unseen_count' | 'selectable'> & {
  unseen_count?: number
  unseen?: number
  selectable?: boolean
  subfolders?: RawImapFolder[]
  children?: RawImapFolder[]
}

function normalizeImapFolder(folder: RawImapFolder): ImapFolder {
  const { unseen, subfolders, children, ...rest } = folder
  const unseen_count = folder.unseen_count ?? unseen ?? 0
  const selectable = folder.selectable ?? true
  return {
    ...rest,
    unseen_count,
    selectable,
    subfolders: subfolders?.map(normalizeImapFolder),
    children: children?.map(normalizeImapFolder),
  } as ImapFolder
}

function normalizeImapFolderTree(folders: RawImapFolder[]): ImapFolder[] {
  return folders.map(normalizeImapFolder)
}

interface PaginationHeader {
  total: number
  total_pages: number
  first_page: number
  last_page: number
  page: number
}

/** Élément message brut (liste dossier) tel que renvoyé par l’API. */
interface RawMailListItem {
  uid?: string
  id?: string
  subject?: string
  from?: { name: string; email: string }
  to?: Array<{ name: string; email: string }>
  date?: string
  seen?: boolean
  flagged?: boolean
  has_attachment?: boolean
  size?: number
  contents?: Array<{ content: string; contentType: string }>
  snippet?: string
  answered?: boolean
  forwarded?: boolean
  deleted?: boolean
  priority?: number
  mail_type?: string | string[]
  /** Déjà normalisé (réponse `{ mails: ImapMessagesList[] }`). */
  mailType?: string[]
}

function normalizeListMailTypes(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((v): v is string => typeof v === 'string')
  }
  if (typeof raw === 'string' && raw.length > 0) {
    return [raw]
  }
  return []
}

function coerceListPriority(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : 3
}

function mapMailToListItem(mail: RawMailListItem): ImapMessagesList {
  const textContent =
    mail.contents?.find((c) => c.contentType === 'text/plain')?.content || ''
  const snippetFromContents = textContent
    .replace(/\r\n/g, ' ')
    .replace(/\n/g, ' ')
    .trim()
    .substring(0, 100)
  const apiSnippet =
    typeof mail.snippet === 'string' ? mail.snippet.trim() : ''
  const snippet = apiSnippet || snippetFromContents

  return {
    id: mail.uid || mail.id || '',
    subject: mail.subject || '(No subject)',
    from: mail.from || { name: '', email: '' },
    to: mail.to || [],
    date: mail.date || '',
    seen: mail.seen || false,
    flagged: mail.flagged || false,
    hasAttachment: mail.has_attachment || false,
    snippet,
    size: mail.size,
    answered: mail.answered ?? false,
    forwarded: mail.forwarded ?? false,
    deleted: mail.deleted ?? false,
    priority: coerceListPriority(mail.priority),
    mailType: normalizeListMailTypes(
      mail.mail_type !== undefined && mail.mail_type !== null
        ? mail.mail_type
        : mail.mailType
    ),
  }
}

/**
 * Extracts HTML or text content from contents[] for compatibility with MailContent
 * @param contents - Contents from the backend
 * @returns Content of the mail or empty string if unavailable
 */
function extractBodyFromContents(
  contents: Array<{ content: string; contentType: string }> | undefined
): string {
  if (!contents || contents.length === 0) return ''

  try {
    // Prioritize HTML
    const htmlContent = contents.find(
      (c) => c?.contentType === 'text/html' && typeof c?.content === 'string'
    )
    if (htmlContent?.content) return htmlContent.content

    // Fallback plain text
    const plainContent = contents.find(
      (c) => c?.contentType === 'text/plain' && typeof c?.content === 'string'
    )
    return plainContent?.content || ''
  } catch {
    return ''
  }
}

/**
 * Normalizes attachments from the backend to the ImapAttachments format
 * Backend : Array<{filename, contentType, size, downloadUri, displayUri, extension}>
 * Frontend : ImapAttachments {parts: [...], count, zipUri?}
 * @param attachments - Raw attachments from the backend or already normalized
 * @returns Format ImapAttachments unifié
 */
function normalizeAttachments(
  attachments:
    | ImapAttachments
    | Array<{
        filename: string
        contentType: string
        size: number
        downloadUri: string
        displayUri: string
        extension: string
      }>
): ImapAttachments {
  // Strict type guard: verify it's already a valid ImapAttachments
  if (
    attachments &&
    typeof attachments === 'object' &&
    'count' in attachments &&
    typeof attachments.count === 'number'
  ) {
    return attachments as ImapAttachments
  }

  // Real backend: transform Array → ImapAttachments
  if (Array.isArray(attachments) && attachments.length > 0) {
    try {
      const parts = attachments.map((att, index) => ({
        partId: att.filename || `attachment-${index}`,
        name: att.filename || 'unnamed',
        contentType: att.contentType || 'application/octet-stream',
        size: att.size || 0,
        downloadUri: att.downloadUri || '',
        displayUri: att.displayUri || '',
      }))

      return {
        parts,
        count: parts.length,
        zipUri: undefined,
      }
    } catch {
      return { parts: [], count: 0 }
    }
  }

  // Fallback: no attachments or invalid format
  return { parts: [], count: 0 }
}

const getFoldersQuery = ({ accountId = '0' }: { accountId?: string } = {}) =>
  `mailboxes/${accountId}/folders`

const getFolderMessagesQuery = ({
  accountId = '0',
  folder,
  params,
}: {
  accountId?: string
  folder: string
  params?: Record<string, string | number | boolean>
}) => {
  let url = `mailboxes/${accountId}/folders/${encodeURIComponent(folder)}/mails`
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
  mailId,
}: {
  accountId?: string
  folder: string
  mailId: string
}) =>
  `mailboxes/${accountId}/folders/${encodeURIComponent(folder)}/mails/${encodeURIComponent(mailId)}`

const moveToTrashQuery = ({
  accountId = '0',
  folder,
  mailId,
}: {
  accountId?: string
  folder: string
  mailId: string
}) => ({
  url: `mailboxes/${accountId}/folders/${encodeURIComponent(folder)}/mails/${encodeURIComponent(mailId)}`,
  method: 'DELETE' as const,
})

const mailActionQuery = ({
  accountId = '0',
  folder,
  mailId,
  action,
  data,
}: {
  accountId?: string
  folder: string
  mailId: string
  action: 'tag' | 'untag' | 'move' | 'spam' | 'ham' | 'copy'
  data?: string | string[] | null
}) => ({
  url: `mailboxes/${accountId}/folders/${encodeURIComponent(folder)}/mails/${encodeURIComponent(mailId)}/action`,
  method: 'POST' as const,
  body: { action, data },
})

const injectedEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder: EndpointBuilder<BaseQueryFn, string, 'api'>) => ({
    getFolders: builder.query<ImapFolder[], { accountId?: string }>({
      query: getFoldersQuery,
      transformResponse: (response: BackendResponse<RawImapFolder[]>) => {
        const folders = normalizeImapFolderTree(response.data || [])
        return sortImapFoldersTree(folders)
      },
      providesTags: [MAILS_FOLDERS_SLICE],
    }),

    getFolderMessages: builder.query<
      ImapMessagesBackendResponse,
      {
        accountId?: string
        folder: string
        params?: MailListQueryParams & Record<string, string | number | boolean>
      }
    >({
      keepUnusedDataFor: 60,
      query: getFolderMessagesQuery,
      transformResponse: (
        response:
          | BackendResponse<RawMailListItem[]>
          | BackendResponse<ImapMessagesAPIResponse>
          | ImapMessagesAPIResponse,
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
            totalPages = totalPages || 1
            total = total >= 0 ? total : 0
          } catch {
            // Invalid X-Pagination JSON: totals are derived from the response body when possible
          }
        }

        const payload =
          typeof response === 'object' && response && 'data' in response
            ? response.data
            : response

        let rawMails: RawMailListItem[] = []

        if (Array.isArray(payload)) {
          rawMails = payload as RawMailListItem[]
        } else if (
          payload &&
          typeof payload === 'object' &&
          'messages' in payload &&
          Array.isArray((payload as { messages: unknown }).messages)
        ) {
          const body = payload as ImapMessagesAPIResponse
          rawMails = body.messages as RawMailListItem[]
          if (!paginationHeader) {
            total = body.total ?? rawMails.length
            totalPages = body.totalPages ?? 1
            page = body.page ?? 1
          }
        } else if (
          payload &&
          typeof payload === 'object' &&
          'mails' in payload &&
          Array.isArray((payload as { mails: unknown }).mails)
        ) {
          const body = payload as ImapMessagesBackendResponse
          rawMails = body.mails as RawMailListItem[]
          if (!paginationHeader) {
            total = body.total ?? rawMails.length
            totalPages = body.totalPages ?? 1
            page = body.page ?? 1
          }
        }

        const mails = rawMails.map(mapMailToListItem)

        if (!paginationHeader) {
          total = total || mails.length
          totalPages = totalPages || 1
          page = page || 1
        }

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
        { type: FOLDER_MESSAGES_SLICE, folder },
      ],
    }),

    getMail: builder.query<
      ImapMessages,
      {
        accountId?: string
        folder: string
        mailId: string
      }
    >({
      query: getMailQuery,
      transformResponse: (
        response: BackendResponse<ImapMessages> | ImapMessages
      ) => {
        let mail = 'data' in response ? response.data : response

        if (mail.contents && mail.contents.length > 0 && !mail.body) {
          mail = {
            ...mail,
            body: extractBodyFromContents(mail.contents),
          }
        }

        if (mail.attachments) {
          mail = {
            ...mail,
            attachments: normalizeAttachments(mail.attachments),
          }
        }
        return mail
      },
      providesTags: (result, error, { mailId }) => [
        { type: MAIL_SLICE, id: mailId },
      ],
    }),

    moveToTrash: builder.mutation<
      void,
      {
        accountId?: string
        folder: string
        mailId: string
      }
    >({
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
        { type: FOLDER_MESSAGES_SLICE, folder },
        MAILS_FOLDERS_SLICE,
      ],
    }),

    mailAction: builder.mutation<
      void,
      {
        accountId?: string
        folder: string
        mailId: string
        action: 'tag' | 'untag' | 'move' | 'spam' | 'ham' | 'copy'
        data?: string | string[] | null
      }
    >({
      query: mailActionQuery,
      invalidatesTags: (result, error, { folder }) => [
        { type: FOLDER_MESSAGES_SLICE, folder },
        MAILS_FOLDERS_SLICE,
      ],
    }),

    purgeFolder: builder.mutation<
      { mails_deleted: number },
      {
        accountId: string
        folderPath: string
        date?: string
        applyToSubfolders?: boolean
        permanentlyDelete?: boolean
      }
    >({
      query: ({
        accountId,
        folderPath,
        date,
        applyToSubfolders,
        permanentlyDelete,
      }) => ({
        url: `mailboxes/${accountId}/folders/${encodeURIComponent(folderPath)}/purge`,
        method: 'POST',
        body: {
          ...(date && { date }),
          ...(applyToSubfolders !== undefined && { applyToSubfolders }),
          ...(permanentlyDelete !== undefined && { permanentlyDelete }),
        },
      }),
      invalidatesTags: (_result, _error, { folderPath }) => [
        { type: 'folder/messages', folder: folderPath },
        'mails/folders',
      ],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        await createApiNotificationHandler(dispatch, {
          successTitle: 'folders_purge.successTitle.string',
          successMessage: 'folders_purge.successMessage.string',
          errorTitle: 'folders_purge.errorTitle.string',
          errorMessage: 'folders_purge.errorMessage.string',
        })(undefined, { queryFulfilled })
      },
    }),

    expungeFolder: builder.mutation<
      { mail_deleted: number },
      { accountId: string; folderPath: string }
    >({
      query: ({ accountId, folderPath }) => ({
        url: `mailboxes/${accountId}/folders/${encodeURIComponent(folderPath)}/expunge`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { folderPath }) => [
        { type: 'folder/messages', folder: folderPath },
        'mails/folders',
      ],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        await createApiNotificationHandler(dispatch, {
          successTitle: 'folders_expunge.successTitle.string',
          successMessage: 'folders_expunge.successMessage.string',
          errorTitle: 'folders_expunge.errorTitle.string',
          errorMessage: 'folders_expunge.errorMessage.string',
        })(undefined, { queryFulfilled })
      },
    }),

    getFolderShare: builder.query<
      FolderShareData,
      { accountId: string; folderPath: string }
    >({
      query: ({ accountId, folderPath }) => ({
        url: `mailboxes/${accountId}/folders/${encodeURIComponent(folderPath)}/share`,
        method: 'GET',
      }),
      transformResponse: (response: BackendResponse<FolderShareData>) =>
        response.data ?? { users: {} },
      providesTags: (_result, _error, { folderPath }) => [
        { type: FOLDER_SHARE_SLICE, folder: folderPath },
      ],
    }),

    setFolderShare: builder.mutation<
      FolderShareData,
      { accountId: string; folderPath: string; users: FolderShareUser[] }
    >({
      query: ({ accountId, folderPath, users }) => ({
        url: `mailboxes/${accountId}/folders/${encodeURIComponent(folderPath)}/share`,
        method: 'POST',
        body: users,
      }),
      invalidatesTags: (_result, _error, { folderPath }) => [
        'mails/folders',
        { type: FOLDER_SHARE_SLICE, folder: folderPath },
      ],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        await createApiNotificationHandler(dispatch, {
          successTitle: 'folders_share.successTitle.string',
          successMessage: 'folders_share.successMessage.string',
          errorTitle: 'folders_share.errorTitle.string',
          errorMessage: 'folders_share.errorMessage.string',
        })(undefined, { queryFulfilled })
      },
    }),

    createFolder: builder.mutation<
      ImapFolder,
      { accountId: string; body: CreateFolderBody }
    >({
      query: ({ accountId, body }) => ({
        url: `mailboxes/${accountId}/folders`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: BackendResponse<RawImapFolder>) =>
        normalizeImapFolder(response.data),
      invalidatesTags: ['mails/folders'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        await createApiNotificationHandler(dispatch, {
          successTitle: 'folders_create.success.title.string',
          successMessage: 'folders_create.success.message.string',
          errorTitle: 'folders_create.error.title.string',
          errorMessage: 'folders_create.error.message.string',
        })(undefined, { queryFulfilled })
      },
    }),

    deleteFolder: builder.mutation<
      void,
      { accountId: string; folderPath: string }
    >({
      query: ({ accountId, folderPath }) => ({
        url: `mailboxes/${accountId}/folders/${encodeURIComponent(folderPath)}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { folderPath }) => [
        'mails/folders',
        { type: 'folder/messages', folder: folderPath },
        { type: 'folder/share', folder: folderPath },
      ],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        await createApiNotificationHandler(dispatch, {
          successTitle: 'folders_delete.success.title.string',
          successMessage: 'folders_delete.success.message.string',
          errorTitle: 'folders_delete.error.title.string',
          errorMessage: 'folders_delete.error.message.string',
        })(undefined, { queryFulfilled })
      },
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetFoldersQuery,
  useGetFolderMessagesQuery,
  useGetMailQuery,
  useMoveToTrashMutation,
  useMailActionMutation,
  usePurgeFolderMutation,
  useExpungeFolderMutation,
  useGetFolderShareQuery,
  useSetFolderShareMutation,
  useCreateFolderMutation,
  useDeleteFolderMutation,
} = injectedEndpoints

export const mailsApiEndpoints = injectedEndpoints

export {
  getFolderMessagesQuery,
  getFoldersQuery,
  getMailQuery,
  mailActionQuery,
  moveToTrashQuery,
}
