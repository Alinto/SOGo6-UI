import { fetchEnvVars } from '@/lib/env-service'
import type { RootState } from '@/lib/redux/store'
import type { BaseQueryFn } from '@reduxjs/toolkit/query'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const ADDRESS_BOOKS_SETTINGS_SLICE = 'address_books_settings'
export const GENERAL_SETTINGS_SLICE = 'general_settings'
export const MAIL_FILTERS_SETTINGS_SLICE = 'mail_filters_settings'
export const MAIL_LABELS_SETTINGS_SLICE = 'mail_labels_settings'
export const MAIL_GENERAL_SETTINGS_SLICE = 'mail_general_settings'
export const MAIL_NOTIFICATIONS_SETTINGS_SLICE = 'mail_notifications_settings'
export const MAIL_VACATION_SETTINGS_SLICE = 'mail_vacation_settings'
export const MAIL_FORWARD_SETTINGS_SLICE = 'mail_forward_settings'
export const EXTERNAL_ACCOUNTS_SLICE = 'external_accounts'
export const ADDRESS_BOOKS_SLICE = 'address_books'
export const VCARD_SLICE = 'vcard'
export const MAIL_FOLDERS_SLICE = 'mail/folders'
export const FOLDER_MESSAGES_SLICE = 'folder/messages'
export const PREFERENCES_SLICE = 'preferences'
export const PROFILE_SLICE = 'profile'
export const MAIL_SLICE = 'mail'
export const MAILS_FOLDERS_SLICE = 'mails/folders'
export const CALENDARS_SLICE = 'calendars'
export const CALENDAR_EVENTS_SLICE = 'calendar_events'
export const ADMIN_CONFIG_SLICE = 'adminConfig'
export const ADMIN_CONFIG_DOMAIN_SLICE = 'adminConfig/domain'
export const ADMIN_CONFIG_RULES_SLICE = 'adminConfig/rules'
export const ADMIN_V1_CONFIG_SYSTEM_SLICE = '/admin/v1/config/system'
export const ADMIN_V1_CONFIG_DOMAINS_SLICE = '/admin/v1/config/domains'
export const ADMIN_V1_CONFIG_RULES_SLICE = '/admin/v1/config/rules'
export const ADMIN_V1_CONFIG_DYNAMIC_FORM_SLICE =
  '/admin/v1/config/dynamic-form'
export const ADMIN_V1_CONFIG_DOMAIN_DEFAULT_SLICE =
  '/admin/v1/config/domain-default'
export const ADMIN_V1_CONFIG_DOMAINS_ALT_SLICE = 'admin/v1/config/domains'
export const SYSTEM_SLICE = 'system'
export const AUTH_MODE_SLICE = 'auth/mode'
export const MAILBOXES_SLICE = 'mailboxes'
export const FOLDER_SHARE_SLICE = 'folder/share'

// ---------------------------------------------------------------------------
// Tag types array
// ---------------------------------------------------------------------------
const tagTypes = [
  ADDRESS_BOOKS_SETTINGS_SLICE,
  GENERAL_SETTINGS_SLICE,
  MAIL_FILTERS_SETTINGS_SLICE,
  MAIL_LABELS_SETTINGS_SLICE,
  MAIL_GENERAL_SETTINGS_SLICE,
  MAIL_NOTIFICATIONS_SETTINGS_SLICE,
  MAIL_VACATION_SETTINGS_SLICE,
  MAIL_FORWARD_SETTINGS_SLICE,
  EXTERNAL_ACCOUNTS_SLICE,
  ADDRESS_BOOKS_SLICE,
  VCARD_SLICE,
  MAIL_FOLDERS_SLICE,
  FOLDER_MESSAGES_SLICE,
  PREFERENCES_SLICE,
  PROFILE_SLICE,
  MAIL_SLICE,
  MAILS_FOLDERS_SLICE,
  CALENDARS_SLICE,
  CALENDAR_EVENTS_SLICE,
  ADMIN_CONFIG_SLICE,
  ADMIN_CONFIG_DOMAIN_SLICE,
  ADMIN_CONFIG_RULES_SLICE,
  ADMIN_V1_CONFIG_SYSTEM_SLICE,
  ADMIN_V1_CONFIG_DOMAINS_SLICE,
  ADMIN_V1_CONFIG_RULES_SLICE,
  ADMIN_V1_CONFIG_DYNAMIC_FORM_SLICE,
  ADMIN_V1_CONFIG_DOMAIN_DEFAULT_SLICE,
  ADMIN_V1_CONFIG_DOMAINS_ALT_SLICE,
  SYSTEM_SLICE,
  AUTH_MODE_SLICE,
  MAILBOXES_SLICE,
  FOLDER_SHARE_SLICE,
] as const

// Cache the base URL to avoid fetching env vars on every API call
let cachedBaseUrl: string

const dynamicBaseQuery: BaseQueryFn = async (args, api, extraOptions) => {
  // Fetch and cache base URL only once
  if (!cachedBaseUrl) {
    const envVars = await fetchEnvVars()
    cachedBaseUrl = envVars.REACT_APP_API_BASE_URL || '/fakeApi' //fakeApi if env var is missing

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
