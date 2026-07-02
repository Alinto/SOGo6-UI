import { createApiNotificationHandler } from '@/features/notifications/api-notification-handler'
import {
  apiSlice,
  MAIL_FILTERS_SETTINGS_SLICE,
} from '@/lib/redux/api/api-slice'
import type { UnknownAction } from '@reduxjs/toolkit'
import type { Dispatch } from 'redux'
import type { MailFilter } from '../mail-filters-types'
import { unwrapBackendResponse } from '@/lib/api/backend-response'
import {
  mapApiFiltersToUi,
  mapUiFiltersToApi,
} from '../mail-filters-utils'

const mailFiltersOnQueryStarted = async (
  _arg: unknown,
  {
    dispatch,
    queryFulfilled,
  }: {
    dispatch: Dispatch<UnknownAction>
    queryFulfilled: Promise<{ data: MailFilter[] }>
  }
) => {
  await createApiNotificationHandler(dispatch, {
    successTitle: 'mail_filters.save.success.title.string',
    successMessage: 'mail_filters.save.success.message.string',
    errorTitle: 'mail_filters.save.error.title.string',
    errorMessage: 'mail_filters.save.error.message.string',
  })(undefined, { queryFulfilled })
}

export const getMailFiltersUrl = (accountId = '0') =>
  `mailboxes/${accountId}/filters`

const injectedEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMailFiltersSettings: builder.query<
      MailFilter[],
      { accountId?: string } | void
    >({
      query: (arg) => {
        const accountId =
          arg && typeof arg === 'object' && 'accountId' in arg
            ? arg.accountId ?? '0'
            : '0'
        return getMailFiltersUrl(accountId)
      },
      transformResponse: (raw: unknown) => {
        const payload = unwrapBackendResponse(
          raw as { filters?: Parameters<typeof mapApiFiltersToUi>[0] }
        )
        return mapApiFiltersToUi(payload.filters ?? [])
      },
      providesTags: [MAIL_FILTERS_SETTINGS_SLICE],
    }),
    updateMailFiltersSettings: builder.mutation<
      MailFilter[],
      { accountId?: string; filters: MailFilter[] }
    >({
      query: ({ accountId = '0', filters }) => ({
        url: getMailFiltersUrl(accountId),
        method: 'POST',
        body: { filters: mapUiFiltersToApi(filters) },
      }),
      transformResponse: (raw: unknown) => {
        const payload = unwrapBackendResponse(
          raw as { filters?: Parameters<typeof mapApiFiltersToUi>[0] }
        )
        return mapApiFiltersToUi(payload.filters ?? [])
      },
      invalidatesTags: [MAIL_FILTERS_SETTINGS_SLICE],
      onQueryStarted: mailFiltersOnQueryStarted,
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetMailFiltersSettingsQuery,
  useUpdateMailFiltersSettingsMutation,
} = injectedEndpoints

export const mailFiltersSettingsApiEndpoints = injectedEndpoints
