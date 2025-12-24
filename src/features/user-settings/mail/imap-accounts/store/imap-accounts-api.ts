import { createApiNotificationHandler } from '@/features/notifications/api-notification-handler'
import { apiSlice } from '@/lib/redux/api/api-slice'
import type {
  ImapAccountCreate,
  ImapAccountDetail,
  ImapAccountListItem,
} from '../types'

const TAG = 'imap_accounts' as const
const LIST_ID = 'LIST' as const

const injectedEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // IMAP accounts list
    getImapAccountsList: builder.query<ImapAccountListItem[], void>({
      query: () => 'settings/mail/imap-accounts',
      providesTags: (result) =>
        result
          ? [
              { type: TAG, id: LIST_ID },
              ...result.map(({ id }) => ({ type: TAG, id })),
            ]
          : [{ type: TAG, id: LIST_ID }],
    }),

    // IMAP account detail
    getImapAccountDetail: builder.query<ImapAccountDetail, string>({
      query: (id) => `settings/mail/imap-accounts?id=${id}`,
      providesTags: (_result, _error, id) => [
        { type: TAG, id },
        { type: TAG, id: LIST_ID },
      ],
    }),

    // Update (readReceipts only)
    updateImapAccount: builder.mutation<
      ImapAccountDetail,
      { id: string; readReceipts: 'never' | 'selective' }
    >({
      query: ({ id, readReceipts }) => ({
        url: `settings/mail/imap-accounts?id=${id}`,
        method: 'PATCH',
        body: { readReceipts },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: TAG, id },
        { type: TAG, id: LIST_ID },
      ],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        await createApiNotificationHandler(dispatch, {
          successTitle: 'US_MAIL_IMAP_ACCOUNTS.success.title.string',
          successMessage: 'US_MAIL_IMAP_ACCOUNTS.success.updated.string',
          errorTitle: 'US_MAIL_IMAP_ACCOUNTS.errors_api.title.string',
          errorMessage: 'US_MAIL_IMAP_ACCOUNTS.errors_api.update_failed.string',
        })(undefined, { queryFulfilled })
      },
    }),

    // Delete an IMAP account
    deleteImapAccount: builder.mutation<void, string>({
      query: (id) => ({
        url: `settings/mail/imap-accounts?id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: TAG, id },
        { type: TAG, id: LIST_ID },
      ],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        await createApiNotificationHandler(dispatch, {
          successTitle: 'US_MAIL_IMAP_ACCOUNTS.success.title.string',
          successMessage: 'US_MAIL_IMAP_ACCOUNTS.success.deleted.string',
          errorTitle: 'US_MAIL_IMAP_ACCOUNTS.errors_api.title.string',
          errorMessage: 'US_MAIL_IMAP_ACCOUNTS.errors_api.delete_failed.string',
        })(undefined, { queryFulfilled })
      },
    }),

    // Create a new IMAP account (with password)
    createImapAccount: builder.mutation<ImapAccountListItem, ImapAccountCreate>(
      {
        query: (account) => ({
          url: `settings/mail/imap-accounts`,
          method: 'POST',
          body: account,
        }),
        invalidatesTags: [{ type: TAG, id: LIST_ID }],
        async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
          await createApiNotificationHandler(dispatch, {
            successTitle: 'US_MAIL_IMAP_ACCOUNTS.success.title.string',
            successMessage: 'US_MAIL_IMAP_ACCOUNTS.success.created.string',
            errorTitle: 'US_MAIL_IMAP_ACCOUNTS.errors_api.title.string',
            errorMessage:
              'US_MAIL_IMAP_ACCOUNTS.errors_api.create_failed.string',
          })(undefined, { queryFulfilled })
        },
      }
    ),
  }),
  overrideExisting: false,
})

export const {
  useGetImapAccountsListQuery,
  useGetImapAccountDetailQuery,
  useUpdateImapAccountMutation,
  useCreateImapAccountMutation,
  useDeleteImapAccountMutation,
} = injectedEndpoints
