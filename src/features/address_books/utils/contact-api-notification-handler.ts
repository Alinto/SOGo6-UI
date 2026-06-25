import { addNotification } from '@/features/notifications'
import type { ApiNotificationProps } from '@/features/notifications/api-notification-handler'
import type { AppDispatch } from '@/lib/redux/store'
import {
  getContactApiNotificationMessageKey,
  shouldSuppressContactMutationToast,
} from './map-contact-api-error'

export function createContactApiNotificationHandler(
  dispatch: AppDispatch,
  notificationStrings: ApiNotificationProps
) {
  const {
    displayNotificationOnSuccess = true,
    displayNotificationOnError = true,
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
    } catch (error) {
      if (
        !displayNotificationOnError ||
        shouldSuppressContactMutationToast(error)
      ) {
        return
      }

      dispatch(
        addNotification({
          type: 'error',
          title: rest.errorTitle || '',
          message: getContactApiNotificationMessageKey(error),
          duration: 5000,
        })
      )
    }
  }
}
