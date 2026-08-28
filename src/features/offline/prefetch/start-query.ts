import type { AppDispatch } from '@/lib/redux/store'

export interface QuerySubscription<T> {
  unwrap: () => Promise<T>
  unsubscribe: () => void
}

export function startQuery<T>(
  dispatch: AppDispatch,
  action: unknown
): QuerySubscription<T> {
  return dispatch(action as never) as QuerySubscription<T>
}
