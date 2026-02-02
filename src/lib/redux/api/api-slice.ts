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

const dynamicBaseQuery: BaseQueryFn = async (args, api, extraOptions) => {
  console.log('🔍 dynamicBaseQuery CALLED')
  
  const envVars = await fetchEnvVars()
  const baseUrl = envVars.REACT_APP_API_BASE_URL || '/fakeApi'
  
  console.log('🌐 Base URL:', baseUrl)

  const baseQuery = fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState
    
      
      const token = state.auth?.token

      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }

      headers.set('Content-Type', 'application/json')
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
