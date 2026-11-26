'use client'

import { useTranslations } from 'next-intl'

/** Error codes of the API for a SSO login (see errors.py of the API) */
const SSO_ERROR_CODES = [
  'S000209',
  'S000210',
  'S000211',
  'S000212',
  'S000213',
  'S000214',
  'S000215',
  'S000216',
  'S000217',
] as const

type SsoErrorCode = (typeof SSO_ERROR_CODES)[number]

/** Shown when the landing page refuses a SSO login started from another tab or browser */
export const SSO_ERROR_INVALID_STATE: SsoErrorCode = 'S000213'

type SsoErrorTranslator = (
  key:
    | 'error.sso_wrong_auth_type.string'
    | 'error.sso_provider_unreachable.string'
    | 'error.sso_exchange_failed.string'
    | 'error.sso_user_not_found.string'
    | 'error.sso_state_invalid.string'
    | 'error.sso_state_storage.string'
    | 'error.sso_redirect_not_allowed.string'
    | 'error.sso_password_not_allowed.string'
    | 'error.sso_email_not_verified.string'
    | 'error.sso_failed.string'
    | 'error.generic.string',
  values?: { code: string }
) => string

export function isSsoErrorCode(
  code: string | null | undefined
): code is SsoErrorCode {
  return SSO_ERROR_CODES.some((ssoCode) => ssoCode === code)
}

export function getSsoErrorMessage(
  t: SsoErrorTranslator,
  code: string | null | undefined
): string {
  switch (code) {
    case 'S000209':
      return t('error.sso_wrong_auth_type.string')
    case 'S000210':
      return t('error.sso_provider_unreachable.string')
    case 'S000211':
      return t('error.sso_exchange_failed.string')
    case 'S000212':
      return t('error.sso_user_not_found.string')
    case 'S000213':
      return t('error.sso_state_invalid.string')
    case 'S000214':
      return t('error.sso_state_storage.string')
    case 'S000215':
      return t('error.sso_redirect_not_allowed.string')
    case 'S000216':
      return t('error.sso_password_not_allowed.string')
    case 'S000217':
      return t('error.sso_email_not_verified.string')
    default:
      return code
        ? t('error.sso_failed.string', { code })
        : t('error.generic.string')
  }
}

export function useSsoErrorMessage() {
  const t = useTranslations('AUTH')
  return (code: string | null | undefined) => getSsoErrorMessage(t, code)
}
