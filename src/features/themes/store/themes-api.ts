import { apiSlice } from '@/lib/redux/api/api-slice'
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'

const injectedEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder: EndpointBuilder<BaseQueryFn, string, 'api'>) => ({
    getThemes: builder.query<CSSStyleSheet, void>({
      query: () => 'customization/themes',
    }),
  }),
  overrideExisting: false,
})

export const { useGetThemesQuery } = injectedEndpoints
