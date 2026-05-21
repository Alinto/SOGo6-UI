'use client'

import {
  removeNotification,
  selectAllNotifications,
} from '@/features/notifications'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { useTranslations } from 'next-intl'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

export const NotificationProvider = () => {
  const dispatch = useAppDispatch()
  const notifications = useAppSelector(selectAllNotifications)
  const t = useTranslations('NOTIFICATIONS')
  const tRef = useRef(t)

  /** IDs already passed to Sonner — prevents duplicate toasts on effect re-runs. */
  const shownIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    tRef.current = t
  }, [t])

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = []
    const translate = tRef.current

    for (const notification of notifications) {
      if (shownIdsRef.current.has(notification.id)) {
        continue
      }
      shownIdsRef.current.add(notification.id)

      const { id, type, title, message, duration } = notification

      const toastOptions = {
        id,
        description: translate(message),
        duration: duration || undefined,
        onDismiss: () => {
          shownIdsRef.current.delete(id)
          dispatch(removeNotification(id))
        },
      }

      switch (type) {
        case 'error':
          toast.error(translate(title), toastOptions)
          break
        case 'success':
          toast.success(translate(title), toastOptions)
          break
        case 'info':
          toast.info(translate(title), toastOptions)
          break
        default:
          toast.message(translate(title), toastOptions)
      }

      if (duration && duration > 0) {
        timeouts.push(
          setTimeout(() => {
            shownIdsRef.current.delete(id)
            dispatch(removeNotification(id))
          }, duration)
        )
      }
    }

    const activeIds = new Set(notifications.map((n) => n.id))
    for (const shownId of shownIdsRef.current) {
      if (!activeIds.has(shownId)) {
        shownIdsRef.current.delete(shownId)
      }
    }

    return () => {
      timeouts.forEach(clearTimeout)
    }
  }, [notifications, dispatch])

  return null
}
