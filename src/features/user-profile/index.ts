/**
 * User Profile feature module
 * Exports types, hooks, and API for the /api/user/v1/profile endpoint
 */

// Types
export type {
  ProfileApiResponse,
  ProfileData,
  Mailbox,
  Identity,
  MailServerConfig,
  UserPreferences,
  DomainUISettings,
} from './profile-types'

// API
export { profileApi, useGetUserProfileQuery } from './store/profile-api'

// Hooks
export { useProfile } from './hooks/use-profile'
