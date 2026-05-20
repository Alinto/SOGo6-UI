import { createApiNotificationHandler } from '@/features/notifications/api-notification-handler'
import { apiSlice } from '@/lib/redux/api/api-slice'
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import type {
  BackendResponse,
  SaveDraftArg,
  SendMailArg,
} from './mail-api-types'

const injectedEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder: EndpointBuilder<BaseQueryFn, string, 'api'>) => ({
    sendMail: builder.mutation<BackendResponse<void>, SendMailArg>({
      query: ({ accountId, mail, mailUid }) => ({
        url: `mailboxes/${accountId}/send`,
        params: mailUid != null ? { uid: mailUid } : undefined,
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
    }),
    saveDraft: builder.mutation<BackendResponse<void>, SaveDraftArg>({
      query: ({ accountId, mailUid, mail, displayNotification }) => ({
        url: `mailboxes/${accountId}/mail/save`,
        params: mailUid != null ? { uid: mailUid } : undefined,
        method: 'POST',
        body: {
          ...mail,
          cc: mail.cc ?? [],
          bcc: mail.bcc ?? [],
          return_receipt: mail.return_receipt ?? null,
        },
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        if (arg.displayNotification) {
          await createApiNotificationHandler(dispatch, {
            successTitle: 'save_draft.success.title.string',
            successMessage: 'save_draft.success.message.string',
            errorTitle: 'save_draft.error.title.string',
            errorMessage: 'save_draft.error.message.string',
          })(undefined, { queryFulfilled })
        }
      },
    }),
    deleteMail: builder.mutation<
      void,
      { accountId: string; folder: string; mailUid: string }
    >({
      query: ({ accountId, folder, mailUid }) => ({
        url: `mailboxes/${accountId}/folders/${folder}/mails/${mailUid}`,
        method: 'DELETE',
      }),
      // async onQueryStarted(arg, { dispatch, queryFulfilled }) {
      //   await createApiNotificationHandler(dispatch, {
      //     successTitle: 'discard_draft.success.title.string',
      //     successMessage: 'discard_draft.success.message.string',
      //     errorTitle: 'discard_draft.error.title.string',
      //     errorMessage: 'discard_draft.error.message.string',
      //   })(undefined, { queryFulfilled })
      // },
    }),
  }),

  overrideExisting: true,
})

export const {
  useSendMailMutation,
  useSaveDraftMutation,
  useDeleteMailMutation,
} = injectedEndpoints
export const mailSendApiEndpoints = injectedEndpoints
