import { getErrorCode, isFetchBaseQueryError } from '@/lib/redux/api/error-handlers'

export type ContactApiErrorContext =
  | 'list_form'
  | 'contact_form'
  | 'toast'
  | 'book_form'

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
  S000701: { toast: 'addressbook_not_found.string', book_form: 'addressbook_not_found.string' },
  S000702: { toast: 'addressbook_duplicate.string', book_form: 'addressbook_duplicate.string' },
  S000703: { toast: 'contact_not_found.string', contact_form: 'contact_not_found.string' },
  S000704: { toast: 'contact_duplicate.string', contact_form: 'contact_duplicate.string' },
  S000705: { toast: 'contact_persist_failed.string', contact_form: 'contact_persist_failed.string' },
  S000706: { toast: 'contact_update_failed.string', contact_form: 'contact_update_failed.string' },
  S000707: { toast: 'operation_not_supported.string', contact_form: 'operation_not_supported.string', book_form: 'operation_not_supported.string' },
  S000708: { toast: 'read_only.string', contact_form: 'read_only.string', list_form: 'read_only.string', book_form: 'read_only.string' },
  S000709: { toast: 'access_denied.string', contact_form: 'access_denied.string', list_form: 'access_denied.string', book_form: 'access_denied.string' },
  S000710: { toast: 'list_not_found.string', list_form: 'list_not_found.string' },
  S000711: { toast: 'list_duplicate.string', list_form: 'list_duplicate.string' },
  S000712: { toast: 'list_persist_failed.string', list_form: 'list_persist_failed.string' },
  S000713: { toast: 'list_update_failed.string', list_form: 'list_update_failed.string' },
  S000714: { list_form: 'list_member_invalid.string', toast: 'list_member_invalid.string' },
  S000715: { toast: 'export_format_unsupported.string' },
  S000716: { toast: 'import_no_file.string' },
  S000717: { toast: 'import_too_large.string' },
  S000718: { toast: 'import_parse_failed.string' },
  S000040: { contact_form: 'file_too_large.string', toast: 'file_too_large.string' },
  S000041: { contact_form: 'file_type_not_allowed.string', toast: 'file_type_not_allowed.string' },
  S000800: { toast: 'job_not_found.string' },
  S000801: { toast: 'job_forbidden.string' },
  S000802: { toast: 'job_not_ready.string' },
  S000803: { toast: 'job_no_result.string' },
  S000804: { toast: 'job_concurrent_limit.string' },
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

export function getContactApiNotificationMessageKey(error: unknown): string {
  return `contact_api_errors.${getContactApiErrorMessageKey(error, 'toast')}`
}

export function isContactConflictError(error: unknown): boolean {
  const code = resolveErrorCode(error)
  return code === 'S000702' || code === 'S000704' || code === 'S000711'
}

export function shouldSuppressContactMutationToast(error: unknown): boolean {
  return isContactConflictError(error)
}
