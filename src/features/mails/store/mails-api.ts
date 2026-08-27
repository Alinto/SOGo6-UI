import { createApiNotificationHandler } from '@/features/notifications/api-notification-handler'
import { USER_CLASS_ANY, USER_CLASS_USER } from '@/lib/constants/user-class'
import {
  apiSlice,
  FOLDER_MESSAGES_SLICE,
  FOLDER_SHARE_SLICE,
  MAIL_SLICE,
  MAILS_FOLDERS_SLICE,
} from '@/lib/redux/api/api-slice'
import type { RootState } from '@/lib/redux/store'
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import type {
  CreateFolderBody,
  FolderShareData,
  FolderShareUser,
  ImapFolder,
  ImapMessages,
  ImapMessagesBackendResponse,
  UpdateFolderBody,
} from '../mails-types'
import { getMailActionNotificationKeys } from '../utils/get-mail-action-notification-keys'
import {
  buildRightsFromPermissions,
  getActiveAdvancedCodes,
} from '../utils/permission-mapping'
import { sortImapFoldersTree } from '../utils/sort-folders'
import {
  dispatchGetMailSeenPatch,
  dispatchSeenPatchOnAllFolderMessageCaches,
  findListItemInFolderCaches,
  folderMessagesCache,
  isFolderRemovingAction,
  isMailActionSeenFlagToggle,
  removeMailFromAllFolderCaches,
} from './mails-cache'
import {
  extractBodyFromContents,
  normalizeAttachments,
  normalizeImapFolder,
  normalizeImapFolderTree,
  normalizeMailDetail,
  transformFolderMessagesResponse,
  type BackendResponse,
  type RawImapFolder,
} from './mails-normalizers'

export interface MailListQueryParams {
  page?: number | string
  page_size?: number | string
  sort_by?: 'date' | 'from' | 'cc' | 'size' | 'subject' | 'to'
  sort_order?: 'asc' | 'desc'
  fields?: string
  fields_action?: 'include' | 'exclude'
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

const getEditMailQuery = ({
  accountId = '0',
  folder,
  mailId,
}: {
  accountId?: string
  folder: string
  mailId: string
}) => {
  return getMailQuery({ accountId, folder, mailId }) + '/edit'
}

const getReplyMailQuery = ({
  accountId = '0',
  folder,
  mailId,
}: {
  accountId?: string
  folder: string
  mailId: string
}) => {
  return getMailQuery({ accountId, folder, mailId }) + '/reply'
}

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

interface ShareUserPayload {
  c_email?: string
  uid?: string
  user_class: string
  permissions: string[]
  do_subfolders: boolean
}

function toWireUserClass(userClass: FolderShareUser['userClass']): string {
  if (userClass === 'public-user') return 'public'
  if (userClass === 'any-authenticated-user') return USER_CLASS_ANY
  return USER_CLASS_USER
}

/**
 * The real backend sends the wire shape (`user_class`, `do_subfolders`, no
 * `rights`) documented in the fakeApi mock's WireShareUser; the fakeApi mock
 * itself returns the already-normalized app shape (`userClass`,
 * `applyToSubfolders`, `rights`) since it stores what its own PUT handler
 * built. Accept either.
 */
interface RawFolderShareUser {
  uid: string
  c_email?: string
  userClass?: FolderShareUser['userClass']
  user_class?: string
  rights?: FolderShareUser['rights']
  permissions?: string[]
  applyToSubfolders?: boolean
  do_subfolders?: boolean
}

function fromWireUserClass(userClass?: string): FolderShareUser['userClass'] {
  if (userClass === 'public') return 'public-user'
  if (userClass === USER_CLASS_ANY) return 'any-authenticated-user'
  return 'normal-user'
}

function normalizeFolderShareUser(raw: RawFolderShareUser): FolderShareUser {
  const permissions = raw.permissions ?? []
  return {
    uid: raw.uid,
    c_email: raw.c_email,
    userClass: raw.userClass ?? fromWireUserClass(raw.user_class),
    rights: raw.rights ?? buildRightsFromPermissions(permissions),
    permissions,
    applyToSubfolders: raw.applyToSubfolders ?? raw.do_subfolders ?? false,
  }
}

// The real backend may return `data` as a bare array of share entries (as
// confirmed for the analogous calendars/address_books endpoints); the
// fakeApi mock returns `data.users` as a Record keyed by uid. Normalize both
// into the Record shape the rest of the app expects.
function normalizeFolderShareData(data: unknown): FolderShareData {
  if (Array.isArray(data)) {
    const users: FolderShareData['users'] = {}
    for (const u of data as RawFolderShareUser[]) {
      const normalized = normalizeFolderShareUser(u)
      users[normalized.uid] = normalized
    }
    return { users }
  }
  if (data && typeof data === 'object' && 'users' in data) {
    const users: FolderShareData['users'] = {}
    for (const [uid, u] of Object.entries(
      (data as { users: Record<string, RawFolderShareUser> }).users
    )) {
      users[uid] = normalizeFolderShareUser(u)
    }
    return { users }
  }
  return { users: {} }
}

const setFolderShareQuery = ({
  accountId,
  folderPath,
  users,
}: {
  accountId: string
  folderPath: string
  users: FolderShareUser[]
}) => ({
  url: `mailboxes/${accountId}/folders/${encodeURIComponent(folderPath)}/share`,
  method: 'PUT' as const,
  body: users.map((u): ShareUserPayload => {
    const user_class = toWireUserClass(u.userClass)
    return {
      c_email: u.c_email,
      ...(user_class === USER_CLASS_ANY ? {} : { uid: u.uid }),
      user_class,
      permissions: getActiveAdvancedCodes(u.rights),
      do_subfolders: u.applyToSubfolders ?? false,
    }
  }),
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
      transformResponse: transformFolderMessagesResponse,
      providesTags: (_result, _error, { folder }) => [
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
        return normalizeMailDetail(mail)
      },
      providesTags: (result, error, { mailId }) => [
        { type: MAIL_SLICE, id: mailId },
      ],
      /**
       * Mark-as-read strategy: optimistic patch + IMAP tag dispatched immediately
       * on request, regardless of whether getMail succeeds. This matches Gmail/Outlook
       * behavior — the act of opening a mail marks it read, even if the content fails
       * to load. If the IMAP tag call fails, the optimistic patch is rolled back.
       *
       * Edge case: if the user navigates directly to a mail URL without the folder
       * list being loaded first (findListItemInFolderCaches returns undefined),
       * the mail will NOT be marked as read. This is acceptable and expected.
       */
      async onQueryStarted(arg, { dispatch, getState }) {
        const accountKey = arg.accountId ?? '0'
        const listItem = findListItemInFolderCaches(
          getState() as RootState,
          accountKey,
          arg.folder,
          arg.mailId
        )
        if (!listItem || listItem.seen) return

        const optimisticPatches = dispatchSeenPatchOnAllFolderMessageCaches(
          dispatch,
          getState() as RootState,
          {
            accountId: arg.accountId,
            folder: arg.folder,
            mailId: arg.mailId,
            seen: true,
          }
        )
        try {
          await dispatch(
            folderMessagesCache.initiateMailAction(
              {
                accountId: arg.accountId,
                folder: arg.folder,
                mailId: arg.mailId,
                action: 'tag',
                data: ['\\Seen'],
              },
              { subscribe: false }
            )
          ).unwrap()
        } catch {
          optimisticPatches.forEach((p) => p.undo())
        }
      },
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
      async onQueryStarted(arg, { dispatch, getState, queryFulfilled }) {
        const removalPatches = removeMailFromAllFolderCaches(
          dispatch,
          getState() as RootState,
          arg
        )
        try {
          await queryFulfilled
        } catch {
          removalPatches.forEach((p) => p.undo())
        }
        await createApiNotificationHandler(dispatch, {
          successTitle: 'title.success.string',
          successMessage: 'message.success.string',
          errorTitle: 'title.error.string',
          errorMessage: 'message.error.string',
        })(undefined, { queryFulfilled })
      },
      invalidatesTags: (_result, _error, { folder, mailId }) => [
        { type: FOLDER_MESSAGES_SLICE, folder },
        MAILS_FOLDERS_SLICE,
        { type: MAIL_SLICE, id: mailId },
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
      async onQueryStarted(arg, { dispatch, getState, queryFulfilled }) {
        const patchResults: Array<{ undo: () => void }> = []
        let getMailPatch: { undo: () => void } | undefined

        if (isMailActionSeenFlagToggle(arg)) {
          const seen = arg.action === 'tag'
          const listItem = findListItemInFolderCaches(
            getState() as RootState,
            arg.accountId ?? '0',
            arg.folder,
            arg.mailId
          )
          const alreadyApplied = listItem != null && listItem.seen === seen

          if (!alreadyApplied) {
            patchResults.push(
              ...dispatchSeenPatchOnAllFolderMessageCaches(
                dispatch,
                getState() as RootState,
                {
                  accountId: arg.accountId,
                  folder: arg.folder,
                  mailId: arg.mailId,
                  seen,
                }
              )
            )
          }

          const mailPatch = dispatchGetMailSeenPatch(dispatch, {
            accountId: arg.accountId,
            folder: arg.folder,
            mailId: arg.mailId,
            seen,
          })
          if (mailPatch) getMailPatch = mailPatch

          try {
            await queryFulfilled
          } catch {
            patchResults.forEach((p) => p.undo())
            getMailPatch?.undo()
          }
          return
        }

        if (isFolderRemovingAction(arg.action)) {
          patchResults.push(
            ...removeMailFromAllFolderCaches(
              dispatch,
              getState() as RootState,
              {
                accountId: arg.accountId,
                folder: arg.folder,
                mailId: arg.mailId,
              }
            )
          )
          try {
            await queryFulfilled
          } catch {
            patchResults.forEach((p) => p.undo())
          }
        }

        const notifKeys = getMailActionNotificationKeys(arg)
        if (notifKeys) {
          await createApiNotificationHandler(dispatch, notifKeys)(undefined, {
            queryFulfilled,
          })
        }
      },
      invalidatesTags: (_result, _error, arg) =>
        isMailActionSeenFlagToggle(arg)
          ? [MAILS_FOLDERS_SLICE]
          : [
              { type: FOLDER_MESSAGES_SLICE, folder: arg.folder },
              MAILS_FOLDERS_SLICE,
              { type: MAIL_SLICE, id: arg.mailId },
            ],
    }),

    downloadMail: builder.mutation<
      Blob,
      {
        accountId?: string
        folder: string
        mailId: string
        format?: 'eml' | 'zip'
      }
    >({
      query: ({ accountId = '0', folder, mailId, format = 'eml' }) => ({
        url: `mailboxes/${accountId}/folders/${encodeURIComponent(folder)}/mails/${encodeURIComponent(mailId)}/download`,
        method: 'POST',
        body: { format },
        responseHandler: (response) => response.blob(),
      }),
    }),

    getMailRaw: builder.query<
      string,
      {
        accountId?: string
        folder: string
        mailId: string
      }
    >({
      query: ({ accountId = '0', folder, mailId }) =>
        `mailboxes/${accountId}/folders/${encodeURIComponent(folder)}/mails/${encodeURIComponent(mailId)}/raw`,
      transformResponse: (
        response: BackendResponse<{ raw: string }> | { raw: string }
      ) => ('data' in response ? response.data.raw : response.raw),
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
          do_subfolders: applyToSubfolders ?? true,
          permanently_delete: permanentlyDelete ?? false,
          date: date ?? new Date().toISOString().slice(0, 10),
        },
      }),
      invalidatesTags: (_result, _error, { folderPath }) => [
        { type: FOLDER_MESSAGES_SLICE, folder: folderPath },
        MAILS_FOLDERS_SLICE,
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
        { type: FOLDER_MESSAGES_SLICE, folder: folderPath },
        MAILS_FOLDERS_SLICE,
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
      transformResponse: (response: BackendResponse<unknown>) =>
        normalizeFolderShareData(response.data),
      providesTags: (_result, _error, { folderPath }) => [
        { type: FOLDER_SHARE_SLICE, folder: folderPath },
      ],
    }),

    setFolderShare: builder.mutation<
      FolderShareData,
      {
        accountId: string
        folderPath: string
        users: FolderShareUser[]
      }
    >({
      query: setFolderShareQuery,
      invalidatesTags: (_result, _error, { folderPath }) => [
        'mails/folders',
        { type: FOLDER_SHARE_SLICE, folder: folderPath },
        FOLDER_SHARE_SLICE,
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
      invalidatesTags: [MAILS_FOLDERS_SLICE],
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
        MAILS_FOLDERS_SLICE,
        { type: FOLDER_MESSAGES_SLICE, folder: folderPath },
        { type: FOLDER_SHARE_SLICE, folder: folderPath },
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

    renameFolder: builder.mutation<
      ImapFolder,
      { accountId: string; folderPath: string; body: UpdateFolderBody }
    >({
      query: ({ accountId, folderPath, body }) => ({
        url: `mailboxes/${accountId}/folders/${encodeURIComponent(folderPath)}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: BackendResponse<RawImapFolder>) =>
        normalizeImapFolder(response.data),
      invalidatesTags: (_result, _error, { folderPath }) => [
        MAILS_FOLDERS_SLICE,
        { type: FOLDER_MESSAGES_SLICE, folder: folderPath },
        { type: FOLDER_SHARE_SLICE, folder: folderPath },
      ],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        await createApiNotificationHandler(dispatch, {
          successTitle: 'folders_rename.success.title.string',
          successMessage: 'folders_rename.success.message.string',
          errorTitle: 'folders_rename.error.title.string',
          errorMessage: 'folders_rename.error.message.string',
        })(undefined, { queryFulfilled })
      },
    }),

    setFolderType: builder.mutation<
      ImapFolder,
      { accountId: string; folderPath: string; type: string }
    >({
      query: ({ accountId, folderPath, type }) => ({
        url: `mailboxes/${accountId}/folders/${encodeURIComponent(folderPath)}`,
        method: 'PATCH',
        body: { type },
      }),
      transformResponse: (response: BackendResponse<RawImapFolder>) =>
        normalizeImapFolder(response.data),
      invalidatesTags: [MAILS_FOLDERS_SLICE],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        await createApiNotificationHandler(dispatch, {
          successTitle: 'folders_set_type.success.title.string',
          successMessage: 'folders_set_type.success.message.string',
          errorTitle: 'folders_set_type.error.title.string',
          errorMessage: 'folders_set_type.error.message.string',
        })(undefined, { queryFulfilled })
      },
    }),

    moveFolder: builder.mutation<
      ImapFolder,
      { accountId: string; folderPath: string; newPath: string }
    >({
      query: ({ accountId, folderPath, newPath }) => ({
        url: `mailboxes/${accountId}/folders/${encodeURIComponent(folderPath)}`,
        method: 'PATCH',
        body: { name: newPath },
      }),
      transformResponse: (response: BackendResponse<RawImapFolder>) =>
        normalizeImapFolder(response.data),
      invalidatesTags: [MAILS_FOLDERS_SLICE],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        await createApiNotificationHandler(dispatch, {
          successTitle: 'folders_move.success.title.string',
          successMessage: 'folders_move.success.message.string',
          errorTitle: 'folders_move.error.title.string',
          errorMessage: 'folders_move.error.message.string',
        })(undefined, { queryFulfilled })
      },
    }),

    exportFolder: builder.mutation<
      { job_id?: string },
      { accountId: string; folderPath: string }
    >({
      query: ({ accountId, folderPath }) => ({
        url: `mailboxes/${accountId}/folders/${encodeURIComponent(folderPath)}/export`,
        method: 'POST',
      }),
      transformResponse: (response: BackendResponse<{ job_id?: string }>) =>
        response.data ?? {},
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        await createApiNotificationHandler(dispatch, {
          successTitle: 'folders_export.success.title.string',
          successMessage: 'folders_export.success.message.string',
          errorTitle: 'folders_export.error.title.string',
          errorMessage: 'folders_export.error.message.string',
        })(undefined, { queryFulfilled })
      },
    }),

    getEditMessage: builder.query<
      ImapMessages,
      {
        folder: string
        accountId?: string
        mailId: string
      }
    >({
      query: getEditMailQuery,
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

    getReplyMessage: builder.query<
      ImapMessages & { key?: string },
      {
        folder: string
        accountId?: string
        mailId: string
      }
    >({
      query: getReplyMailQuery,
      transformResponse: (
        response:
          | (BackendResponse<ImapMessages> & { key?: string })
          | ImapMessages
      ) => {
        let mail: ImapMessages & { key?: string } =
          'data' in response ? { ...response.data } : response

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
  }),
  overrideExisting: true,
})

export const {
  useGetFoldersQuery,
  useGetFolderMessagesQuery,
  useGetMailQuery,
  useLazyGetMailQuery,
  useLazyGetEditMessageQuery,
  useLazyGetReplyMessageQuery,
  useMoveToTrashMutation,
  useMailActionMutation,
  useDownloadMailMutation,
  useLazyGetMailRawQuery,
  usePurgeFolderMutation,
  useExpungeFolderMutation,
  useGetFolderShareQuery,
  useLazyGetFolderShareQuery,
  useSetFolderShareMutation,
  useCreateFolderMutation,
  useDeleteFolderMutation,
  useRenameFolderMutation,
  useSetFolderTypeMutation,
  useMoveFolderMutation,
  useExportFolderMutation,
} = injectedEndpoints

export const mailsApiEndpoints = injectedEndpoints

export {
  getFolderMessagesQuery,
  getFoldersQuery,
  getMailQuery,
  mailActionQuery,
  moveToTrashQuery,
  setFolderShareQuery,
}
