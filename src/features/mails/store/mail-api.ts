import { createApiNotificationHandler } from '@/features/notifications/api-notification-handler'
import {
  apiSlice,
  FOLDER_MESSAGES_SLICE,
  MAILS_FOLDERS_SLICE,
} from '@/lib/redux/api/api-slice'
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import type {
  BackendResponse,
  CurrentMailItem,
  DeleteAttachmentArg,
  DownloadAttachmentArg,
  GetCurrentMailArg,
  SaveDraftArg,
  SendMailArg,
  UploadAttachmentArg,
} from './mail-api-types'

const injectedEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder: EndpointBuilder<BaseQueryFn, string, 'api'>) => ({
    sendMail: builder.mutation<BackendResponse<void>, SendMailArg>({
      query: ({ accountId, mail, mailKey }) => ({
        url:
          mailKey != null
            ? `mailboxes/${accountId}/mail/${mailKey}/send`
            : `mailboxes/${accountId}/mail/send`,
        method: 'POST',
        body: {
          ...mail,
          cc: mail.cc ?? [],
          bcc: mail.bcc ?? [],
          return_receipt: mail.return_receipt ?? null,
          attachments: mail.attachments ?? [],
        },
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        await createApiNotificationHandler(dispatch, {
          successTitle: 'mail_send.success.title.string',
          successMessage: 'mail_send.success.message.string',
          errorTitle: 'mail_send.error.title.string',
          errorMessage: 'mail_send.error.message.string',
        })(undefined, { queryFulfilled })
      },
      invalidatesTags: (_result, _error) => [
        { type: FOLDER_MESSAGES_SLICE, folder: 'Drafts' },
        { type: FOLDER_MESSAGES_SLICE, folder: 'Sent' },
        MAILS_FOLDERS_SLICE,
      ],
    }),

    // POST mail/save — create new draft (no key yet)
    // POST mail/save?close=true — create new draft and close
    // PUT mail/:key/save — update existing draft
    // PUT mail/:key/save?close=true — save and close
    saveDraft: builder.mutation<BackendResponse<{ key: string }>, SaveDraftArg>(
      {
        query: ({ accountId, mailKey, mail, close }) => ({
          url:
            mailKey != null
              ? `mailboxes/${accountId}/mail/${mailKey}/save`
              : `mailboxes/${accountId}/mail/save`,
          params: close ? { close: true } : undefined,
          method: mailKey != null ? 'PUT' : 'POST',
          body: {
            ...mail,
            cc: mail.cc ?? [],
            bcc: mail.bcc ?? [],
            return_receipt: mail.return_receipt ?? null,
          },
        }),
        async onQueryStarted(arg, { dispatch, queryFulfilled }) {
          await createApiNotificationHandler(dispatch, {
            displayNotificationOnError: arg.displayNotificationOnError,
            errorTitle: 'save_draft.error.title.string',
            errorMessage: 'save_draft.error.message.string',
            displayNotificationOnSuccess: arg.displayNotificationOnSuccess,
            successTitle: 'save_draft.success.title.string',
            successMessage: 'save_draft.success.message.string',
          })(undefined, { queryFulfilled })
        },
        invalidatesTags: (_result, _error) => [
          { type: FOLDER_MESSAGES_SLICE, folder: 'Drafts' },
          MAILS_FOLDERS_SLICE,
        ],
      }
    ),

    // DELETE mail/:key
    deleteMail: builder.mutation<void, { accountId: string; mailKey: string }>({
      query: ({ accountId, mailKey }) => ({
        url: `mailboxes/${accountId}/mail/${mailKey}`,
        method: 'DELETE',
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        await createApiNotificationHandler(dispatch, {
          successTitle: 'discard_draft.success.title.string',
          successMessage: 'discard_draft.success.message.string',
          errorTitle: 'discard_draft.error.title.string',
          errorMessage: 'discard_draft.error.message.string',
        })(undefined, { queryFulfilled })
      },
      invalidatesTags: (_result, _error) => [
        { type: FOLDER_MESSAGES_SLICE, folder: 'Drafts' },
        MAILS_FOLDERS_SLICE,
      ],
    }),

    // POST mail/:key/attachments or POST mail/attachments (no key yet)
    uploadAttachment: builder.mutation<
      BackendResponse<{ key: string; filename: string }>,
      UploadAttachmentArg
    >({
      query: ({ accountId, mailKey, file }) => {
        const formData = new FormData()
        formData.append('file', file)
        return {
          url:
            mailKey != null
              ? `mailboxes/${accountId}/mail/${mailKey}/attachments`
              : `mailboxes/${accountId}/mail/attachments`,
          method: 'POST',
          body: formData,
        }
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        await createApiNotificationHandler(dispatch, {
          errorTitle: 'attachment_upload.error.title.string',
          errorMessage: 'attachment_upload.error.message.string',
          displayNotificationOnSuccess: false,
        })(undefined, { queryFulfilled })
      },
    }),

    // DELETE mail/:key/attachments/:filename
    deleteAttachment: builder.mutation<void, DeleteAttachmentArg>({
      query: ({ accountId, mailKey, filename }) => ({
        url: `mailboxes/${accountId}/mail/${mailKey}/attachments/${filename}`,
        method: 'DELETE',
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        await createApiNotificationHandler(dispatch, {
          errorTitle: 'attachment_delete.error.title.string',
          errorMessage: 'attachment_delete.error.message.string',
          displayNotificationOnSuccess: false,
        })(undefined, { queryFulfilled })
      },
    }),

    // GET mail/current
    getCurrentDrafts: builder.query<
      BackendResponse<CurrentMailItem[]>,
      GetCurrentMailArg
    >({
      query: ({ accountId }) => ({
        url: `mailboxes/${accountId}/mail/current`,
        method: 'GET',
      }),
    }),

    // GET mail/:key/attachments/:filename
    downloadAttachment: builder.query<Blob, DownloadAttachmentArg>({
      query: ({ accountId, mailKey, filename }) => ({
        url: `mailboxes/${accountId}/mail/${mailKey}/attachments/${filename}`,
        method: 'GET',
        responseHandler: async (response) => {
          return response.blob()
        },
      }),
    }),
  }),
  overrideExisting: true,
})

export const {
  useSendMailMutation,
  useSaveDraftMutation,
  useDeleteMailMutation,
  useUploadAttachmentMutation,
  useDeleteAttachmentMutation,
  useLazyDownloadAttachmentQuery,
  useLazyGetCurrentDraftsQuery,
} = injectedEndpoints

export const mailSendApiEndpoints = injectedEndpoints
