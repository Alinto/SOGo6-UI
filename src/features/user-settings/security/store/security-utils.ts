import type {
  UserPreferences,
  UserSecurity,
} from '@/features/user-settings/store/user-preferences-api-types'
import type { TotpSettings } from '../../store/user-preferences-types'

/**
 * Checks if TOTP is enabled based on MFA API data
 * TOTP is enabled only when SOGO_U_MFA_ENABLE is true AND SOGO_U_MFA_METHOD is "totp"
 */
function isTotpEnabled(security: UserSecurity): boolean {
  return (
    security.SOGO_U_MFA_ENABLE === true && security.SOGO_U_MFA_METHOD === 'totp'
  )
}

export function mapSecuritySettingsToApi(values: TotpSettings): UserSecurity {
  return {
    SOGO_U_MFA_ENABLE: values.totp,
    SOGO_U_MFA_METHOD: values.totp ? 'totp' : null,
  }
}

export function mapApiToSecuritySettings(data: UserPreferences): TotpSettings {
  const security = data.USER_SECURITY
  const totpEnabled = isTotpEnabled(security)

  return {
    totp: totpEnabled,
  }
}
