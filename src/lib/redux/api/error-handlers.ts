// src/lib/api/error-handlers.ts

import { SerializedError } from '@reduxjs/toolkit'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query'

/**
 * Interface pour le format d'erreur standard du backend
 */
interface BackendErrorResponse {
  error_msg?: string
  error_code?: string
  message?: string
  detail?: string
  [key: string]: unknown  // Autres champs possibles
}

/**
 * Type guard pour vérifier si c'est une erreur HTTP (FetchBaseQueryError)
 */
export function isFetchBaseQueryError(
  error: unknown
): error is FetchBaseQueryError {
  return typeof error === 'object' && error != null && 'status' in error
}

/**
 * Type guard pour vérifier si c'est une SerializedError
 */
export function isSerializedError(
  error: unknown
): error is SerializedError {
  return (
    typeof error === 'object' &&
    error != null &&
    'name' in error &&
    'message' in error
  )
}

/**
 * Type guard pour vérifier si data est un BackendErrorResponse
 */
function isBackendErrorResponse(data: unknown): data is BackendErrorResponse {
  return (
    typeof data === 'object' &&
    data != null &&
    ('error_msg' in data || 'message' in data || 'detail' in data)
  )
}

/**
 * Extraire le message d'erreur peu importe le type
 */
export function getErrorMessage(error: unknown): string {
  if (isFetchBaseQueryError(error)) {
    // Cas 1 : error.error est une string
    if ('error' in error && typeof error.error === 'string') {
      return error.error
    }
    
    // Cas 2 : error.data contient le message
    if ('data' in error && error.data) {
      // Vérifier que data est un objet avec les champs attendus
      if (isBackendErrorResponse(error.data)) {
        // Priorité : error_msg > message > detail
        return (
          error.data.error_msg ||
          error.data.message ||
          error.data.detail ||
          `Erreur ${error.status}`
        )
      }
      
      // Si data est une string
      if (typeof error.data === 'string') {
        return error.data
      }
    }
    
    // Cas 3 : Message par défaut avec le status
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

/**
 * Extraire le status HTTP de l'erreur
 */
export function getErrorStatus(error: unknown): number | null {
  if (isFetchBaseQueryError(error)) {
    return typeof error.status === 'number' ? error.status : null
  }
  return null
}

/**
 * Extraire le code d'erreur du backend
 */
export function getErrorCode(error: unknown): string | null {
  if (isFetchBaseQueryError(error) && 'data' in error && error.data) {
    if (isBackendErrorResponse(error.data)) {
      return error.data.error_code || null
    }
  }
  return null
}
