import '@testing-library/jest-dom'
import {
  isFetchBaseQueryError,
  isSerializedError,
  getErrorMessage,
  getErrorStatus,
  getErrorCode,
} from '../error-handlers'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import type { SerializedError } from '@reduxjs/toolkit'

describe('Error Handlers', () => {
  it('should export all error handler functions without crashing', () => {
    expect(isFetchBaseQueryError).toBeDefined()
    expect(isSerializedError).toBeDefined()
    expect(getErrorMessage).toBeDefined()
    expect(getErrorStatus).toBeDefined()
    expect(getErrorCode).toBeDefined()
  })

  it('should identify FetchBaseQueryError', () => {
    const error: FetchBaseQueryError = {
      status: 404,
      data: { error_msg: 'Not found' },
    }
    expect(isFetchBaseQueryError(error)).toBe(true)
  })

  it('should identify SerializedError', () => {
    const error: SerializedError = {
      name: 'Error',
      message: 'Test error',
    }
    expect(isSerializedError(error)).toBe(true)
  })

  it('should get error message from FetchBaseQueryError', () => {
    const error: FetchBaseQueryError = {
      status: 400,
      data: { error_msg: 'Bad request' },
    }
    expect(getErrorMessage(error)).toBe('Bad request')
  })

  it('should get error status from FetchBaseQueryError', () => {
    const error: FetchBaseQueryError = {
      status: 500,
      data: {},
    }
    expect(getErrorStatus(error)).toBe(500)
  })

  it('should get error code from FetchBaseQueryError', () => {
    const error: FetchBaseQueryError = {
      status: 400,
      data: { error_code: 'INVALID_INPUT', error_msg: 'Invalid input' },
    }
    expect(getErrorCode(error)).toBe('INVALID_INPUT')
  })

  it('should handle unknown error types', () => {
    expect(getErrorMessage('string error')).toBe('Erreur inconnue')
    expect(getErrorStatus('string error')).toBeNull()
    expect(getErrorCode('string error')).toBeNull()
  })
})
