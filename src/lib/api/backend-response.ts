export interface BackendResponse<T> {
  data: T
  error_code: string
  error_msg: string
}

export function unwrapBackendResponse<T>(raw: T | BackendResponse<T>): T {
  if (raw && typeof raw === 'object' && 'data' in raw) {
    return (raw as BackendResponse<T>).data
  }
  return raw as T
}
