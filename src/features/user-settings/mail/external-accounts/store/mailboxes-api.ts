import { createApiNotificationHandler } from '@/features/notifications/api-notification-handler'
import { apiSlice, MAILBOXES_SLICE } from '@/lib/redux/api/api-slice'
import type { UnknownAction } from '@reduxjs/toolkit'
import type { Dispatch } from 'redux'
import {
  Mailbox,
  MailboxesResponse,
  MailboxPOST,
  MailboxProfilePatch,
  SkipNotification,
} from './mailboxes-api-types'

const mailboxesOnQueryStarted = async (
  _arg: SkipNotification,
  {
    dispatch,
    queryFulfilled,
  }: {
    dispatch: Dispatch<UnknownAction>
    queryFulfilled: Promise<{ data: MailboxesResponse | void }>
  }
) => {
  // Check if notification should be skipped from payload
  const skipNotification = _arg?._skipNotification === true
  if (skipNotification) return

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

    getUserMailbox: builder.query<MailboxesResponse, { id: string }>({
      query: ({ id }) => ({
        url: `mailboxes/${id}`,
      }),
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

    updateUserMailboxProfile: builder.mutation<
      MailboxesResponse,
      MailboxProfilePatch
    >({
      query: ({ _skipNotification, id, ...patch }) => ({
        url: `mailboxes/${id}`,
        method: 'PATCH',
        body: { ...patch },
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

    deleteUserMailbox: builder.mutation<
      void,
      { id: string; _skipNotification?: boolean }
    >({
      query: ({ id, _skipNotification }) => ({
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
  useGetUserMailboxQuery,
  useLazyGetUserMailboxesQuery,
  useCreateUserMailboxMutation,
  useUpdateUserMailboxMutation,
  useUpdateUserMailboxProfileMutation,
  useDeleteUserMailboxMutation,
} = userMailboxesApi
