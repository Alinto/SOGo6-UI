import { fetchEnvVars } from '@/lib/env-service'
import type { RootState } from '@/lib/redux/store'
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
  'mail_forward_settings',
  'imap_accounts',
  'address_books',
  'vcard',
  'mail/folders',
  'folder/messages',
  'preferences',
  'mail',
  'mails/folders',
  'calendars',
  'calendar_events',
  'adminConfig',
  'adminConfig/domain',
  'adminConfig/rules',
  '/admin/v1/config/system',
  '/admin/v1/config/domains',
  '/admin/v1/config/rules',
  '/admin/v1/config/dynamic-form',
  '/admin/v1/config/domain-default',
  'admin/v1/config/domains',
] as const

// Cache the base URL to avoid fetching env vars on every API call
let cachedBaseUrl: string | null = null

const dynamicBaseQuery: BaseQueryFn = async (args, api, extraOptions) => {
  // Fetch and cache base URL only once
  if (!cachedBaseUrl) {
    const envVars = await fetchEnvVars()
    cachedBaseUrl = envVars.REACT_APP_API_BASE_URL || '/fakeApi'
    
    // Log only in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🌐 API Base URL initialized:', cachedBaseUrl)
    }
  }

  const baseQuery = fetchBaseQuery({
    baseUrl: cachedBaseUrl,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState
      const token = state.auth?.token

      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }

      // Don't force Content-Type - let RTK Query handle it automatically
      // This allows proper handling of multipart/form-data for file uploads
      return headers
    },
  })

  return baseQuery(args, api, extraOptions)
}

export const apiSlice = createApi({
  reducerPath: 'api',
  tagTypes,
  baseQuery: dynamicBaseQuery,
  endpoints: () => ({}),
})
