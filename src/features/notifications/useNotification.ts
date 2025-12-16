import { useAppDispatch } from '@/lib/redux/hooks'
import { addNotification } from './notifications-slice'
import type { NotificationPayload } from './notifications-types'

export const useNotification = () => {
  const dispatch = useAppDispatch()

  const notify = (payload: NotificationPayload) => {
    dispatch(addNotification(payload))
  }

  const error = (title: string, message: string, duration?: number) => {
    dispatch(
      addNotification({
        type: 'error',
        title,
        message,
        duration: duration ?? 5000,
      })
    )
  }

  const success = (title: string, message: string, duration?: number) => {
    dispatch(
      addNotification({
        type: 'success',
        title,
        message,
        duration: duration ?? 5000,
      })
    )
  }

  const info = (title: string, message: string, duration?: number) => {
    dispatch(
      addNotification({
        type: 'info',
        title,
        message,
        duration: duration ?? 5000,
      })
    )
  }

  return { notify, error, success, info }
}
