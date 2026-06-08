import { addNotification } from '@/features/notifications'
import { AppDispatch } from '@/lib/redux/store'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query'
/**
 * Notification strings for API operations
 */
export interface ApiNotificationProps {
  displayNotificationOnSuccess?: boolean
  successTitle?: string | null
  successMessage?: string | null
  successDetails?: string | null
  displayNotificationOnError?: boolean
  errorTitle?: string | null
  errorMessage?: string | null
  displayErrorDetails?: boolean
}

function extractApiError(e: unknown): {
  errorStatus: number | string
  errorMessage: string
} {
  const { error } = e as { error: FetchBaseQueryError }

  const status = error?.status

  const data = error?.data as
    | { error_code?: string; error_msg?: string }
    | undefined
  const error_code = data?.error_code
  const error_msg = data?.error_msg

  return {
    errorStatus: status,
    errorMessage: `${error_code ?? ''} ${error_msg ?? ''}`.trim(),
  }
}

/**
 * Creates an onQueryStarted handler for RTK Query that dispatches notifications
 * @param dispatch Redux dispatch function
 * @param notificationStrings Object containing success and error notification strings
 * @returns Function to be used as onQueryStarted handler
 */
export const createApiNotificationHandler = (
  dispatch: AppDispatch,
  notificationStrings: ApiNotificationProps
) => {
  const {
    displayNotificationOnSuccess = true,
    displayNotificationOnError = true,
    displayErrorDetails = true,
    ...rest
  } = notificationStrings

  return async (
    _: unknown,
    { queryFulfilled }: { queryFulfilled: Promise<unknown> }
  ) => {
    try {
      await queryFulfilled
      if (
        displayNotificationOnSuccess &&
        (rest.successTitle || rest.successMessage)
      ) {
        dispatch(
          addNotification({
            type: 'success',
            title: rest.successTitle || '',
            message: rest.successMessage || '',
            details: rest.successDetails || '',
            duration: 3000,
          })
        )
      }
    } catch (e) {
      if (
        displayNotificationOnError &&
        (rest.errorTitle || rest.errorMessage)
      ) {
        const { errorStatus, errorMessage } = extractApiError(e)
        dispatch(
          addNotification({
            type: 'error',
            title: rest.errorTitle || '',
            message: rest.errorMessage || '',
            details:
              displayErrorDetails && errorStatus && errorMessage
                ? errorStatus + ': ' + errorMessage
                : '',
            duration: 5000,
          })
        )
      }
    }
  }
}
