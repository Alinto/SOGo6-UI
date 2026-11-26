import { getErrorCode } from '@/lib/redux/api/error-handlers'

/** Backend error codes of the MFA endpoints (SOGo6-server app/utils/errors.py) */
export const MFA_ERROR = {
  SESSION_INVALID: 'S000209',
  CODE_INVALID: 'S000210',
  TOO_MANY_ATTEMPTS: 'S000211',
  ENFORCED: 'S000212',
  METHOD_NOT_ALLOWED: 'S000213',
  PROVIDER_REQUIRED: 'S000214',
  NO_PENDING_ENROLLMENT: 'S000215',
  DISABLED: 'S000216',
  NOT_SET: 'S000217',
  CODE_REQUIRED: 'S000218',
  SECRET_UNREADABLE: 'S000219',
  PASSWORD_REQUIRED: 'S000220',
  PASSWORD_INVALID: 'S000221',
} as const

const ERROR_KEYS: Record<string, string> = {
  [MFA_ERROR.SESSION_INVALID]: 'error.session_invalid.string',
  [MFA_ERROR.CODE_INVALID]: 'error.code_invalid.string',
  [MFA_ERROR.TOO_MANY_ATTEMPTS]: 'error.too_many_attempts.string',
  [MFA_ERROR.ENFORCED]: 'error.enforced.string',
  [MFA_ERROR.NO_PENDING_ENROLLMENT]: 'error.no_pending_enrollment.string',
  [MFA_ERROR.CODE_REQUIRED]: 'error.code_required.string',
  [MFA_ERROR.SECRET_UNREADABLE]: 'error.secret_unreadable.string',
  [MFA_ERROR.PASSWORD_REQUIRED]: 'error.password_required.string',
  [MFA_ERROR.PASSWORD_INVALID]: 'error.password_invalid.string',
}

/** Translation key (namespace MFA) for an error of an MFA endpoint */
export function mfaErrorKey(error: unknown): string {
  const code = getErrorCode(error)
  return (code && ERROR_KEYS[code]) || 'error.generic.string'
}

/**
 * At login, the MFA session is gone (expired, or deleted after too many codes):
 * the user must type the password again.
 */
export function isMfaLoginSessionLost(error: unknown): boolean {
  const code = getErrorCode(error)
  return (
    code === MFA_ERROR.SESSION_INVALID || code === MFA_ERROR.TOO_MANY_ATTEMPTS
  )
}
