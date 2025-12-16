import { addNotification } from '@/features/notifications'
import { AppDispatch } from '@/lib/redux/store'

/**
 * Notification strings for API operations
 */
export interface ApiNotificationStrings {
  successTitle: string
  successMessage: string
  errorTitle: string
  errorMessage: string
}

/**
 * Creates an onQueryStarted handler for RTK Query that dispatches notifications
 * @param dispatch Redux dispatch function
 * @param notificationStrings Object containing success and error notification strings
 * @returns Function to be used as onQueryStarted handler
 */
export const createApiNotificationHandler = (
  dispatch: AppDispatch,
  notificationStrings: ApiNotificationStrings
) => {
  return async (
    _: unknown,
    { queryFulfilled }: { queryFulfilled: Promise<unknown> }
  ) => {
    try {
      await queryFulfilled
      dispatch(
        addNotification({
          type: 'success',
          title: notificationStrings.successTitle,
          message: notificationStrings.successMessage,
          duration: 3000,
        })
      )
    } catch {
      dispatch(
        addNotification({
          type: 'error',
          title: notificationStrings.errorTitle,
          message: notificationStrings.errorMessage,
          duration: 5000,
        })
      )
    }
  }
}
