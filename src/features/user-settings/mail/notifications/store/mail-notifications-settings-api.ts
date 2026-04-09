import {
  apiSlice,
  MAIL_NOTIFICATIONS_SETTINGS_SLICE,
} from '@/lib/redux/api/api-slice'
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import type { MailNotifications } from '../mail-notifications-type'

const injectedEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder: EndpointBuilder<BaseQueryFn, string, 'api'>) => ({
    getMailNotificationsSettings: builder.query<MailNotifications, void>({
      query: () => 'settings/mail/notifications',
      providesTags: [MAIL_NOTIFICATIONS_SETTINGS_SLICE],
    }),
    updateMailNotificationsSettings: builder.mutation<
      MailNotifications,
      Partial<MailNotifications>
    >({
      query: ({ ...patch }) => ({
        url: `settings/mail/notifications`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: [MAIL_NOTIFICATIONS_SETTINGS_SLICE],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetMailNotificationsSettingsQuery,
  useUpdateMailNotificationsSettingsMutation,
} = injectedEndpoints
