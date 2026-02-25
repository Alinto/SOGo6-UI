import { useGetUserProfileQuery } from '../store/profile-api'
import { useAppSelector } from '@/lib/redux/hooks'

/**
 * Custom hook for easy access to profile data
 * Combines data from auth.user (uid, cn, email) with profile API
 */
export function useProfile() {
  const {
    data: profile,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetUserProfileQuery()

  // Get user info from Redux auth state
  const authUser = useAppSelector((state) => state.auth.user)

  // Extract domain from uid (e.g. "user@sogo.nu" → "sogo.nu")
  const domain = authUser?.uid?.includes('@') 
  ? authUser.uid.split('@')[1] 
  : ''

  // Separate main account vs external accounts
  const mainAccount = profile?.mailboxes.find((m) => m.id === '0')
  const externalAccounts = profile?.mailboxes.filter((m) => m.id !== '0') || []

  // Default identity
  const defaultIdentity = mainAccount?.identities.find((id) => id.isDefault)

  return {
    // Raw data
    profile,
    isLoading,
    isError,
    error,
    refetch,

    // User info (combined auth.user + extracted domain)
    user: authUser
      ? {
          ...authUser,
          domain,
        }
      : null,

    // Mailboxes
    mainAccount,
    externalAccounts,
    allMailboxes: profile?.mailboxes || [],
    defaultIdentity,

    // Preferences shortcuts
    preferences: profile?.prefs,
    language: profile?.prefs?.USER_GENERAL?.SOGO_U_LANGUAGE,
    timezone: profile?.prefs?.USER_GENERAL?.SOGO_U_TIMEZONE,
    firstModule: profile?.prefs?.USER_GENERAL?.SOGO_U_FIRST_MODULE,
    mfaEnabled: profile?.prefs?.USER_SECURITY?.SOGO_U_MFA_ENABLE,

    // UI settings (domain) - Feature toggles
    uiSettings: profile?.ui,
    canAddExternalAccount: profile?.ui?.SOGO_D_ALLOW_EXT_MAIL_ACCOUNT ?? false,
    identitiesEnabled: profile?.ui?.SOGO_D_IDENTITIES_ENABLED ?? false,
    customFromEnabled:
      profile?.ui?.SOGO_D_IDENTITIES_CUSTOM_FROM_ENABLED ?? false,
    moduleAccess: profile?.ui?.SOGO_D_MODULE_ACCESS || [],
    mfaAvailable: profile?.ui?.SOGO_D_LOGIN_MFA ?? false,
    passwordChangeEnabled: profile?.ui?.SOGO_D_PWD_CHANGE_ENABLED ?? false,
    forwardEnabled: profile?.ui?.SOGO_D_FORWARD_ENABLED ?? false,
    vacationEnabled: profile?.ui?.SOGO_D_VACATION_ENABLED ?? false,
    mailFilteringEnabled: profile?.ui?.SOGO_D_MAIL_FILTERING_ENABLED ?? false,
    mailPurgeAllow: profile?.ui?.SOGO_D_MAIL_PURGE_ALLOW ?? false,
    mailMaxRecipient: profile?.ui?.SOGO_D_MAIL_MAX_RECIPIENT ?? 0,
    jitsiLinkEnabled: profile?.ui?.SOGO_D_JITSI_LINK_ENABLED ?? false,
    jitsiBaseUrl: profile?.ui?.SOGO_D_JITSI_BASE_URL ?? null,
  }
}
