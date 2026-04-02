import {
  apiSlice,
  MAIL_FILTERS_SETTINGS_SLICE,
} from '@/lib/redux/api/api-slice'
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import type { MailFilter } from '../mail-filters-types'

const injectedEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder: EndpointBuilder<BaseQueryFn, string, 'api'>) => ({
    getMailFiltersSettings: builder.query<MailFilter[], void>({
      query: () => 'settings/mail/filters',
      providesTags: [MAIL_FILTERS_SETTINGS_SLICE],
    }),
    updateMailFiltersSettings: builder.mutation<
      MailFilter[],
      Partial<MailFilter>
    >({
      query: ({ ...patch }) => ({
        url: `settings/mail/filters`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: [MAIL_FILTERS_SETTINGS_SLICE],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetMailFiltersSettingsQuery,
  useUpdateMailFiltersSettingsMutation,
} = injectedEndpoints
