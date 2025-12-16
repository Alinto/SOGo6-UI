'use client'

import {
  removeNotification,
  selectAllNotifications,
} from '@/features/notifications'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { toast } from 'sonner'

export const NotificationProvider = () => {
  const dispatch = useAppDispatch()
  const notifications = useAppSelector(selectAllNotifications)
  const t = useTranslations('NOTIFICATIONS')

  useEffect(() => {
    notifications.forEach((notification) => {
      const { id, type, title, message, duration } = notification

      // Show toast with appropriate type
      const showToast = () => {
        switch (type) {
          case 'error':
            toast.error(t(title), {
              description: t(message),
              duration: duration || undefined,
              onDismiss: () => {
                dispatch(removeNotification(id))
              },
            })
            break
          case 'success':
            toast.success(t(title), {
              description: t(message),
              duration: duration || undefined,
              onDismiss: () => {
                dispatch(removeNotification(id))
              },
            })
            break
          case 'info':
            toast.info(t(title), {
              description: t(message),
              duration: duration || undefined,
              onDismiss: () => {
                dispatch(removeNotification(id))
              },
            })
            break
          default:
            toast.message(t(title), {
              description: t(message),
              duration: duration || undefined,
              onDismiss: () => {
                dispatch(removeNotification(id))
              },
            })
        }
      }

      showToast()

      // Auto-remove from Redux state after duration
      if (duration && duration > 0) {
        const timeout = setTimeout(() => {
          dispatch(removeNotification(id))
        }, duration)

        return () => clearTimeout(timeout)
      }
    })
  }, [notifications, dispatch, t])

  return null
}
