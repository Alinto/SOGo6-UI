'use client'

import { useGetRemindersQuery } from '@/features/calendars/store/calendars-api'
import { collectNewReminders } from '@/features/calendars/utils/reminder-dedupe'
import { addNotification } from '@/features/notifications'
import { useAppDispatch } from '@/lib/redux/hooks'
import { useEffect } from 'react'

const STORAGE_KEY = 'sogo.reminder.notified'
const MAX_SEEN = 200

function readSeen(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return new Set(Array.isArray(parsed) ? parsed.map(String) : [])
  } catch {
    return new Set()
  }
}

function writeSeen(seen: Set<string>) {
  if (typeof window === 'undefined') return
  const keys = Array.from(seen).slice(-MAX_SEEN)
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(keys))
}

export default function ReminderPoller() {
  const dispatch = useAppDispatch()
  const { data } = useGetRemindersQuery(
    { method: 'popup', lookahead: 15 },
    { pollingInterval: 60_000 }
  )

  useEffect(() => {
    if (!data?.length) return
    try {
      const seen = readSeen()
      const fresh = collectNewReminders(data, seen)
      writeSeen(seen)
      for (const reminder of fresh) {
        dispatch(
          addNotification({
            type: 'info',
            title: 'calendar_reminder.title.string',
            message: 'calendar_reminder.message.string',
            details: reminder.title || reminder.event_key,
            duration: 10000,
          })
        )
      }
    } catch {
      // A failed poll or storage access must not break the calendar.
    }
  }, [data, dispatch])

  return null
}
