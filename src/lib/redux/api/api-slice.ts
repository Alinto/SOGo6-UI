import { fetchEnvVars } from '@/lib/env-service'
import type { BaseQueryFn } from '@reduxjs/toolkit/query'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const tagTypes = [
  'address_books_settings',
  'general_settings',
  'mail_filters_settings',
  'mail_labels_settings',
  'mail_general_settings',
  'mail_notifications_settings',
  'mail_vacation_settings',
  'address_books',
  'vcard',
  'mail/folders',
  'folder/messages',
  'preferences',
  'mails/folders',
  'calendars',
  'calendar_events',
] as const

// Dynamic base query that fetches env vars first
const dynamicBaseQuery: BaseQueryFn = async (args, api, extraOptions) => {
  const envVars = await fetchEnvVars()
  const baseUrl = envVars.REACT_APP_API_BASE_URL || '/fakeApi'

  const baseQuery = fetchBaseQuery({
    baseUrl,
  })

  return baseQuery(args, api, extraOptions)
}

// Define our single API slice object
export const apiSlice = createApi({
  reducerPath: 'api',
  tagTypes,
  baseQuery: dynamicBaseQuery,
  endpoints: () => ({}),
})
