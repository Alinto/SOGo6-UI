import { apiSlice } from '@/lib/redux/api/api-slice'
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import type { MailLabel } from '../mail-labels-types'

type UpdateMailLabelsPayload = {
  labels: MailLabel[]
}

const injectedEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder: EndpointBuilder<BaseQueryFn, string, 'api'>) => ({
    getMailLabelsSettings: builder.query<MailLabel[], void>({
      query: () => 'settings/mail/labels',
      providesTags: ['mail_labels_settings'],
    }),
    updateMailLabelsSettings: builder.mutation<
      MailLabel[],
      UpdateMailLabelsPayload
    >({
      query: (payload) => ({
        url: `settings/mail/labels`,
        method: 'PATCH',
        body: payload,
      }),
      invalidatesTags: ['mail_labels_settings'],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetMailLabelsSettingsQuery,
  useUpdateMailLabelsSettingsMutation,
} = injectedEndpoints
