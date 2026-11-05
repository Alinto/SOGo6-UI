'use client'

import {
  useGetCalendarsQuery,
  useGetFolderPreferencesQuery,
  useUpdateFolderPreferencesMutation,
} from '@/features/calendars/store/calendars-api'
import { getCalendarFolderScope } from '@/features/calendars/utils/calendar-source-type'
import { useIsOtherOwner } from '@/hooks/use-is-other-owner'
import { useCallback, useMemo } from 'react'

/**
 * Which calendars' events are displayed, persisted in the `display` field of
 * /preferences/folders (CALENDAR.OWNER / CALENDAR.SUBS, keyed by calendar key).
 * A calendar missing from the preferences is visible.
 */
export function useCalendarVisibility() {
  const { data: calendarsData } = useGetCalendarsQuery()
  const { data: folderPreferences } = useGetFolderPreferencesQuery()
  const [updateFolderPreferences] = useUpdateFolderPreferencesMutation()
  const isOtherOwner = useIsOtherOwner()

  const hiddenCalendars = useMemo(() => {
    const hiddenIds = new Set<string>()
    const { OWNER = {}, SUBS = {} } = folderPreferences?.CALENDAR ?? {}
    for (const entries of [OWNER, SUBS]) {
      for (const [key, preference] of Object.entries(entries)) {
        if (preference?.display === false) hiddenIds.add(key)
      }
    }
    return hiddenIds
  }, [folderPreferences])

  // Calendars still in the list, matched by key or id like findCalendarByRef.
  // Events of an unsubscribed or deleted calendar are then hidden.
  const knownCalendars = useMemo(() => {
    if (!calendarsData) return null

    const refs = new Set<string>()
    calendarsData.forEach((calendar) => {
      if (calendar.key) refs.add(calendar.key)
      if (calendar.id) refs.add(calendar.id)
    })
    return refs
  }, [calendarsData])

  const setCalendarVisibility = useCallback(
    async (calendarId: string, isVisible: boolean) => {
      const calendar = calendarsData?.find(
        (cal) => cal.key === calendarId || cal.id === calendarId
      )
      const key = calendar?.key ?? calendar?.id ?? calendarId
      const scope = calendar
        ? getCalendarFolderScope(calendar, isOtherOwner)
        : 'OWNER'
      await updateFolderPreferences({
        CALENDAR: { [scope]: { [key]: { display: isVisible } } },
      })
    },
    [calendarsData, isOtherOwner, updateFolderPreferences]
  )

  // Visible when the calendar is in the list and not hidden (all visible until the list loads)
  const isCalendarVisible = useCallback(
    (calendarId: string): boolean => {
      if (knownCalendars && !knownCalendars.has(calendarId)) return false
      return !hiddenCalendars.has(calendarId)
    },
    [hiddenCalendars, knownCalendars]
  )

  return {
    setCalendarVisibility,
    isCalendarVisible,
    hiddenCalendars,
  }
}
