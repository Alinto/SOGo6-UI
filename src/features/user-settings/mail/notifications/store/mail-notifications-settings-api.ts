import { addNotification } from '@/features/notifications'
import { createApiNotificationHandler } from '@/features/notifications/api-notification-handler'
import { unwrapBackendResponse } from '@/lib/api/backend-response'
import {
  apiSlice,
  MAIL_NOTIFICATIONS_SETTINGS_SLICE,
} from '@/lib/redux/api/api-slice'
import type { UnknownAction } from '@reduxjs/toolkit'
import type { Dispatch } from 'redux'
import type {
  ApiNotification,
  ApiNotificationGetResponse,
  ApiNotificationPostResponse,
} from '../mail-notifications-api-types'
import type { MailNotification } from '../mail-notifications-type'
import {
  mapApiNotificationToUi,
  mapUiNotificationToApi,
} from '../mail-notifications-utils'

const mailNotificationOnQueryStarted = async (
  arg: { notification: MailNotification },
  {
    dispatch,
    queryFulfilled,
  }: {
    dispatch: Dispatch<UnknownAction>
    queryFulfilled: Promise<{ data: MailNotification }>
  }
) => {
  const baseHandler = createApiNotificationHandler(dispatch, {
    displayNotificationOnSuccess: false,
    successTitle: 'mail_notify.save.success.title.string',
    successMessage: 'mail_notify.save.success.message.string',
    errorTitle: 'mail_notify.save.error.title.string',
    errorMessage: 'mail_notify.save.error.message.string',
  })

  try {
    const { data } = await queryFulfilled

    if (arg.notification.enabled && !data.enabled) {
      dispatch(
        addNotification({
          type: 'warning',
          title: 'mail_notify.save.warning.title.string',
          message: 'mail_notify.save.warning.message.string',
          details: '',
          duration: 6000,
        })
      )
      return
    }

    if (arg.notification.enabled || arg.notification.addresses.length > 0) {
      dispatch(
        addNotification({
          type: 'success',
          title: 'mail_notify.save.success.title.string',
          message: 'mail_notify.save.success.message.string',
          details: '',
          duration: 3000,
        })
      )
    }
  } catch {
    await baseHandler(undefined, {
      queryFulfilled: queryFulfilled as Promise<unknown>,
    })
  }
}

export const getMailNotifyUrl = (accountId = '0') =>
  `mailboxes/${accountId}/notify`

const injectedEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMailNotificationSettings: builder.query<
      MailNotification,
      { accountId?: string } | void
    >({
      query: (arg) => {
        const accountId =
          arg && typeof arg === 'object' && 'accountId' in arg
            ? (arg.accountId ?? '0')
            : '0'
        return getMailNotifyUrl(accountId)
      },
      transformResponse: (raw: unknown) => {
        const payload = unwrapBackendResponse<ApiNotificationGetResponse>(
          raw as ApiNotificationGetResponse
        )
        return mapApiNotificationToUi(payload.notification)
      },
      providesTags: [MAIL_NOTIFICATIONS_SETTINGS_SLICE],
    }),
    updateMailNotificationSettings: builder.mutation<
      MailNotification,
      { accountId?: string; notification: MailNotification }
    >({
      query: ({ accountId = '0', notification }) => ({
        url: getMailNotifyUrl(accountId),
        method: 'POST',
        body: { Notification: mapUiNotificationToApi(notification) },
      }),
      transformResponse: (raw: unknown) => {
        const payload = unwrapBackendResponse<ApiNotificationPostResponse>(
          raw as ApiNotificationPostResponse
        )
        return mapApiNotificationToUi(payload.notification)
      },
      invalidatesTags: [MAIL_NOTIFICATIONS_SETTINGS_SLICE],
      onQueryStarted: mailNotificationOnQueryStarted,
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetMailNotificationSettingsQuery,
  useUpdateMailNotificationSettingsMutation,
} = injectedEndpoints

export const mailNotificationSettingsApiEndpoints = injectedEndpoints

export function wasNotificationPersisted(
  requested: ApiNotification,
  response: ApiNotification | null
): boolean {
  if (!requested.enabled) {
    return true
  }
  return Boolean(response?.enabled)
}
