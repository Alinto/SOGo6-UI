import type { ApiDataResponse } from '../address-books-api-types'

export function unwrapApiData<T>(response: ApiDataResponse<T> | T): T {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as ApiDataResponse<T>).data
  }
  return response as T
}

export function isBackendWrappedResponse(
  response: unknown
): response is ApiDataResponse<unknown> {
  return (
    response !== null &&
    typeof response === 'object' &&
    'data' in response &&
    ('error_code' in response || 'error_msg' in response)
  )
}
