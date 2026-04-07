import { createApiNotificationHandler } from '@/features/notifications/api-notification-handler'
import { apiSlice, MAILBOXES_SLICE } from '@/lib/redux/api/api-slice'
import { Mailbox, MailboxesResponse, MailboxPOST } from './mailboxes-api-types'

const mailboxesOnQueryStarted = async (
  _arg: unknown,
  { dispatch, queryFulfilled }: { dispatch: any; queryFulfilled: Promise<any> }
) => {
  await createApiNotificationHandler(dispatch, {
    successTitle: 'title.success.string',
    successMessage: 'message.success.string',
    errorTitle: 'title.error.string',
    errorMessage: 'message.error.string',
  })(undefined, { queryFulfilled })
}

export const userMailboxesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserMailboxes: builder.query<MailboxesResponse, void>({
      query: () => 'mailboxes',
      providesTags: [MAILBOXES_SLICE],
    }),

    createUserMailbox: builder.mutation<MailboxesResponse, MailboxPOST>({
      query: ({ ...post }) => ({
        url: 'mailboxes',
        method: 'POST',
        body: post,
      }),
      invalidatesTags: [MAILBOXES_SLICE],
      onQueryStarted: mailboxesOnQueryStarted,
    }),

    updateUserMailbox: builder.mutation<MailboxesResponse, Mailbox>({
      query: ({ id, ...patch }) => ({
        url: `mailboxes/${id}`,
        method: 'PATCH',
        body: { ...patch },
      }),
      invalidatesTags: [MAILBOXES_SLICE],
      onQueryStarted: mailboxesOnQueryStarted,
    }),

    deleteUserMailbox: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `mailboxes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [MAILBOXES_SLICE],
      onQueryStarted: mailboxesOnQueryStarted,
    }),
  }),
})

export const {
  useGetUserMailboxesQuery,
  useLazyGetUserMailboxesQuery,
  useCreateUserMailboxMutation,
  useUpdateUserMailboxMutation,
  useDeleteUserMailboxMutation,
} = userMailboxesApi
