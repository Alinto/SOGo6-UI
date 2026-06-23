import { getContactApiErrorMessageKey, isContactConflictError } from '../map-contact-api-error'

describe('map-contact-api-error', () => {
  it('maps list member invalid error to list form message', () => {
    const error = {
      status: 422,
      data: { error_code: 'S000714', error_msg: 'Invalid member' },
    }

    expect(getContactApiErrorMessageKey(error, 'list_form')).toBe(
      'list_member_invalid.string'
    )
  })

  it('maps contact duplicate to toast message', () => {
    const error = {
      status: 409,
      data: { error_code: 'S000704', error_msg: 'Duplicate' },
    }

    expect(getContactApiErrorMessageKey(error, 'toast')).toBe(
      'contact_duplicate.string'
    )
  })

  it('falls back to generic message for unknown codes', () => {
    expect(getContactApiErrorMessageKey({}, 'toast')).toBe('generic.string')
  })

  it('detects conflict errors', () => {
    const error = {
      status: 409,
      data: { error_code: 'S000711', error_msg: 'Duplicate' },
    }

    expect(isContactConflictError(error)).toBe(true)
    expect(isContactConflictError({ status: 400 })).toBe(false)
  })
})
