import { apiSlice } from '@/lib/redux/api/api-slice'
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import type { GeneralSettings } from '../general-types'

const injectedEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder: EndpointBuilder<BaseQueryFn, string, 'api'>) => ({
    getGeneralSettings: builder.query<GeneralSettings, void>({
      query: () => 'settings/general',
      providesTags: ['general_settings'],
    }),
    updateGeneralSettings: builder.mutation<
      GeneralSettings,
      Partial<GeneralSettings>
    >({
      query: ({ ...patch }) => ({
        url: `settings/general`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: ['general_settings'],
    }),
  }),
  overrideExisting: false,
})

export const { useGetGeneralSettingsQuery, useUpdateGeneralSettingsMutation } =
  injectedEndpoints
