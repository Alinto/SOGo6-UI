import { createApiNotificationHandler } from '@/features/notifications/api-notification-handler'
import { unwrapBackendResponse } from '@/lib/api/backend-response'
import {
  apiSlice,
  MAIL_FORWARD_SETTINGS_SLICE,
} from '@/lib/redux/api/api-slice'
import type { UnknownAction } from '@reduxjs/toolkit'
import type { Dispatch } from 'redux'
import type {
  ApiForwardGetResponse,
  ApiForwardPostResponse,
} from '../mail-forward-api-types'
import type { MailForward } from '../mail-forward-types'
import {
  mapApiForwardToUi,
  mapUiForwardToApi,
} from '../mail-forward-utils'

const mailForwardOnQueryStarted = async (
  _arg: unknown,
  {
    dispatch,
    queryFulfilled,
  }: {
    dispatch: Dispatch<UnknownAction>
    queryFulfilled: Promise<{ data: MailForward }>
  }
) => {
  await createApiNotificationHandler(dispatch, {
    successTitle: 'mail_forward.save.success.title.string',
    successMessage: 'mail_forward.save.success.message.string',
    errorTitle: 'mail_forward.save.error.title.string',
    errorMessage: 'mail_forward.save.error.message.string',
  })(undefined, { queryFulfilled })
}

export const getMailForwardUrl = (accountId = '0') =>
  `mailboxes/${accountId}/forward`

const injectedEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMailForwardSettings: builder.query<
      MailForward,
      { accountId?: string } | void
    >({
      query: (arg) => {
        const accountId =
          arg && typeof arg === 'object' && 'accountId' in arg
            ? arg.accountId ?? '0'
            : '0'
        return getMailForwardUrl(accountId)
      },
      transformResponse: (raw: unknown) => {
        const payload = unwrapBackendResponse<ApiForwardGetResponse>(
          raw as ApiForwardGetResponse
        )
        return mapApiForwardToUi(payload.forward)
      },
      providesTags: [MAIL_FORWARD_SETTINGS_SLICE],
    }),
    updateMailForwardSettings: builder.mutation<
      MailForward,
      { accountId?: string; forward: MailForward }
    >({
      query: ({ accountId = '0', forward }) => ({
        url: getMailForwardUrl(accountId),
        method: 'POST',
        body: { Forward: mapUiForwardToApi(forward) },
      }),
      transformResponse: (raw: unknown) => {
        const payload = unwrapBackendResponse<ApiForwardPostResponse>(
          raw as ApiForwardPostResponse
        )
        return mapApiForwardToUi(payload.forward)
      },
      invalidatesTags: [MAIL_FORWARD_SETTINGS_SLICE],
      onQueryStarted: mailForwardOnQueryStarted,
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetMailForwardSettingsQuery,
  useUpdateMailForwardSettingsMutation,
} = injectedEndpoints

export const mailForwardSettingsApiEndpoints = injectedEndpoints
