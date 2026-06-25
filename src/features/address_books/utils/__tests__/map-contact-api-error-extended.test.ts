import { getContactApiErrorMessageKey, isContactConflictError } from '../map-contact-api-error'

describe('map-contact-api-error extended', () => {
  const error = (code: string) => ({
    data: { error_code: code, error_msg: 'msg' },
    status: 400,
  })

  it('maps import and job errors', () => {
    expect(getContactApiErrorMessageKey(error('S000716'), 'toast')).toBe(
      'import_no_file.string'
    )
    expect(getContactApiErrorMessageKey(error('S000804'), 'toast')).toBe(
      'job_concurrent_limit.string'
    )
  })

  it('maps read-only errors in form context', () => {
    expect(getContactApiErrorMessageKey(error('S000708'), 'contact_form')).toBe(
      'read_only.string'
    )
  })

  it('includes addressbook duplicate in conflict detection', () => {
    expect(isContactConflictError(error('S000702'))).toBe(true)
  })
})
