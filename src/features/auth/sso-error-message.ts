'use client'

import { useTranslations } from 'next-intl'

const SSO_ERROR_MESSAGES = {
  S000210: 'error.sso_provider_unreachable.string',
  S000211: 'error.sso_exchange_failed.string',
  S000212: 'error.sso_user_not_found.string',
  S000213: 'error.sso_state_invalid.string',
  S000214: 'error.sso_state_storage.string',
  S000215: 'error.sso_redirect_not_allowed.string',
} as const

type SsoErrorCode = keyof typeof SSO_ERROR_MESSAGES

type SsoErrorTranslator = (
  key:
    | (typeof SSO_ERROR_MESSAGES)[SsoErrorCode]
    | 'error.sso_failed.string'
    | 'error.generic.string',
  values?: { code: string }
) => string

export function isSsoErrorCode(
  code: string | null | undefined
): code is SsoErrorCode {
  return typeof code === 'string' && code in SSO_ERROR_MESSAGES
}

export function getSsoErrorMessage(
  t: SsoErrorTranslator,
  code: string | null | undefined
): string {
  switch (code) {
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
