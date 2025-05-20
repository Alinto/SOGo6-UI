// Import the RTK Query methods from the React-specific entry point
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
] as const

// Define our single API slice object
export const apiSlice = createApi({
  // The cache reducer expects to be added at `state.api` (already default - this is optional)
  reducerPath: 'api',
  tagTypes,
  // All of our requests will have URLs starting with '/fakeApi'
  baseQuery: fetchBaseQuery({ baseUrl: '/fakeApi' }),
  // The "endpoints" represent operations and requests for this server
  endpoints: () => ({}),
})
