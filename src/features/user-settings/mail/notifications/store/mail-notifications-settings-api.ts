import { apiSlice } from '@/lib/redux/api/api-slice'
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import type { MailNotifications } from '../mail-notifications-type'

const injectedEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder: EndpointBuilder<BaseQueryFn, string, 'api'>) => ({
    getMailNotificationsSettings: builder.query<MailNotifications, void>({
      query: () => 'settings/mail/notifications',
      providesTags: ['mail_notifications_settings'],
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
      invalidatesTags: ['mail_notifications_settings'],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetMailNotificationsSettingsQuery,
  useUpdateMailNotificationsSettingsMutation,
} = injectedEndpoints
