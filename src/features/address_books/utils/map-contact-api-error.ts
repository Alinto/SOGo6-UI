import { getErrorCode, isFetchBaseQueryError } from '@/lib/redux/api/error-handlers'

export type ContactApiErrorContext = 'list_form' | 'contact_form' | 'toast'

function resolveErrorCode(error: unknown): string | null {
  const fromHelper = getErrorCode(error)
  if (fromHelper) return fromHelper

  if (
    isFetchBaseQueryError(error) &&
    error.data &&
    typeof error.data === 'object' &&
    'error_code' in error.data &&
    typeof error.data.error_code === 'string'
  ) {
    return error.data.error_code
  }

  return null
}

const ERROR_MESSAGE_KEYS: Record<
  string,
  Partial<Record<ContactApiErrorContext, string>>
> = {
  S000702: { toast: 'addressbook_duplicate.string' },
  S000704: { toast: 'contact_duplicate.string' },
  S000711: { toast: 'list_duplicate.string' },
  S000709: { toast: 'access_denied.string' },
  S000708: { toast: 'read_only.string' },
  S000714: { list_form: 'list_member_invalid.string' },
  S000040: { contact_form: 'file_too_large.string' },
}

export function getContactApiErrorMessageKey(
  error: unknown,
  context: ContactApiErrorContext
): string {
  const code = resolveErrorCode(error)
  if (!code) {
    return 'generic.string'
  }

  const mapping = ERROR_MESSAGE_KEYS[code]
  return mapping?.[context] ?? mapping?.toast ?? 'generic.string'
}

export function isContactConflictError(error: unknown): boolean {
  const code = resolveErrorCode(error)
  return code === 'S000702' || code === 'S000704' || code === 'S000711'
}
