import { createApiNotificationHandler } from '@/features/notifications/api-notification-handler'
import {
  apiSlice,
  MAIL_FORWARD_SETTINGS_SLICE,
} from '@/lib/redux/api/api-slice'
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import type { MailForward } from '../mail-forward-types'

const injectedEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder: EndpointBuilder<BaseQueryFn, string, 'api'>) => ({
    getMailForwardSettings: builder.query<MailForward, void>({
      query: () => 'settings/mail/forward',
      providesTags: [MAIL_FORWARD_SETTINGS_SLICE],
    }),
    updateMailForwardSettings: builder.mutation<
      MailForward,
      Partial<MailForward>
    >({
      query: ({ ...patch }) => ({
        url: `settings/mail/forward`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: [MAIL_FORWARD_SETTINGS_SLICE],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        await createApiNotificationHandler(dispatch, {
          successTitle: 'US_MAIL_FORWARD.success.title.string',
          successMessage: 'US_MAIL_FORWARD.success.saved.string',
          errorTitle: 'US_MAIL_FORWARD.errors_api.title.string',
          errorMessage: 'US_MAIL_FORWARD.errors_api.save_failed.string',
        })(undefined, { queryFulfilled })
      },
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetMailForwardSettingsQuery,
  useUpdateMailForwardSettingsMutation,
} = injectedEndpoints
