import { SerializedError } from '@reduxjs/toolkit'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query'

interface BackendErrorResponse {
  error_msg?: string
  error_code?: string
  message?: string
  detail?: string
  [key: string]: unknown
}

export function isFetchBaseQueryError(
  error: unknown
): error is FetchBaseQueryError {
  return typeof error === 'object' && error != null && 'status' in error
}

export function isSerializedError(error: unknown): error is SerializedError {
  return (
    typeof error === 'object' &&
    error != null &&
    'name' in error &&
    'message' in error
  )
}

function isBackendErrorResponse(data: unknown): data is BackendErrorResponse {
  return (
    typeof data === 'object' &&
    data != null &&
    ('error_msg' in data || 'message' in data || 'detail' in data)
  )
}

export function getExistingErrorMessage(error: unknown): string | null {
  if (error == null) {
    return null
  }
  return getErrorMessage(error)
}

export function getErrorMessage(error: unknown): string {
  console.error('getErrorMessage error object:', error)
  if (isFetchBaseQueryError(error)) {
    if ('error' in error && typeof error.error === 'string') {
      return error.error
    }

    if ('data' in error && error.data) {
      if (isBackendErrorResponse(error.data)) {
        return (
          error.data.error_msg ||
          error.data.message ||
          error.data.detail ||
          `Erreur ${error.status}`
        )
      }

      if (typeof error.data === 'string') {
        return error.data
      }
    }

    return `Erreur ${error.status}`
  }

  if (isSerializedError(error)) {
    return error.message || 'Erreur inconnue'
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Erreur inconnue'
}

export function getErrorStatus(error: unknown): number | null {
  if (isFetchBaseQueryError(error)) {
    return typeof error.status === 'number' ? error.status : null
  }
  return null
}

export function getErrorCode(error: unknown): string | null {
  if (isFetchBaseQueryError(error) && 'data' in error && error.data) {
    if (isBackendErrorResponse(error.data)) {
      return error.data.error_code || null
    }
  }
  return null
}
