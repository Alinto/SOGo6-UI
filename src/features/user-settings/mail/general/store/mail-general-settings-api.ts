import { apiSlice } from '@/lib/redux/api/api-slice'
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import type { MailGeneralSettings } from '../mail-general-types'

const injectedEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder: EndpointBuilder<BaseQueryFn, string, 'api'>) => ({
    getMailGeneralSettings: builder.query<MailGeneralSettings, void>({
      query: () => 'settings/mail/general',
      providesTags: ['mail_general_settings'],
    }),
    updateMailGeneralSettings: builder.mutation<
      MailGeneralSettings,
      Partial<MailGeneralSettings>
    >({
      query: ({ ...patch }) => ({
        url: `settings/mail/general`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: ['mail_general_settings'],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetMailGeneralSettingsQuery,
  useUpdateMailGeneralSettingsMutation,
} = injectedEndpoints
