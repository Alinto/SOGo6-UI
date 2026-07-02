import { createApiNotificationHandler } from '@/features/notifications/api-notification-handler'
import {
  apiSlice,
  MAIL_VACATION_SETTINGS_SLICE,
} from '@/lib/redux/api/api-slice'
import type { UnknownAction } from '@reduxjs/toolkit'
import type { Dispatch } from 'redux'
import type { MailVacation } from '../mail-vacation-types'
import { unwrapBackendResponse } from '@/lib/api/backend-response'
import {
  mapApiVacationToUi,
  mapUiVacationToApi,
} from '../mail-vacation-utils'
import type {
  ApiVacationGetResponse,
  ApiVacationPostResponse,
} from '../mail-vacation-api-types'

const mailVacationOnQueryStarted = async (
  _arg: unknown,
  {
    dispatch,
    queryFulfilled,
  }: {
    dispatch: Dispatch<UnknownAction>
    queryFulfilled: Promise<{ data: MailVacation }>
  }
) => {
  await createApiNotificationHandler(dispatch, {
    successTitle: 'mail_vacation.save.success.title.string',
    successMessage: 'mail_vacation.save.success.message.string',
    errorTitle: 'mail_vacation.save.error.title.string',
    errorMessage: 'mail_vacation.save.error.message.string',
  })(undefined, { queryFulfilled })
}

export const getMailVacationUrl = (accountId = '0') =>
  `mailboxes/${accountId}/vacation`

const injectedEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMailVacationSettings: builder.query<
      MailVacation,
      { accountId?: string } | void
    >({
      query: (arg) => {
        const accountId =
          arg && typeof arg === 'object' && 'accountId' in arg
            ? arg.accountId ?? '0'
            : '0'
        return getMailVacationUrl(accountId)
      },
      transformResponse: (raw: unknown) => {
        const payload = unwrapBackendResponse<ApiVacationGetResponse>(
          raw as ApiVacationGetResponse
        )
        return mapApiVacationToUi(payload.vacation)
      },
      providesTags: [MAIL_VACATION_SETTINGS_SLICE],
    }),
    updateMailVacationSettings: builder.mutation<
      MailVacation,
      { accountId?: string; vacation: MailVacation; timezone?: string }
    >({
      query: ({ accountId = '0', vacation, timezone }) => ({
        url: getMailVacationUrl(accountId),
        method: 'POST',
        body: { Vacation: mapUiVacationToApi(vacation, timezone) },
      }),
      transformResponse: (raw: unknown) => {
        const payload = unwrapBackendResponse<ApiVacationPostResponse>(
          raw as ApiVacationPostResponse
        )
        return mapApiVacationToUi(payload.vacation)
      },
      invalidatesTags: [MAIL_VACATION_SETTINGS_SLICE],
      onQueryStarted: mailVacationOnQueryStarted,
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetMailVacationSettingsQuery,
  useUpdateMailVacationSettingsMutation,
} = injectedEndpoints

export const mailVacationSettingsApiEndpoints = injectedEndpoints
