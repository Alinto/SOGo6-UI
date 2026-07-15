import type {
  AttendanceStatus,
  CalendarEvent,
} from '@/features/calendars/calendars-types'
import { usePostEventAttendanceMutation } from '@/features/calendars/store/calendars-api'
import { useAppSelector } from '@/lib/redux/hooks'
import { useCallback } from 'react'

export const RSVP_STATUSES: AttendanceStatus[] = [
  'accepted',
  'tentative',
  'declined',
]

export function useEventAttendance(event: CalendarEvent | null | undefined) {
  const currentUserEmail = useAppSelector((state) => state.auth.user?.email)
  const [postAttendance, { isLoading: isAttendanceLoading }] =
    usePostEventAttendanceMutation()

  const normalizedUserEmail = currentUserEmail?.trim().toLowerCase() ?? ''

  const rawAttendeeStatus = event?.attendees?.find(
    (a) => a.email.trim().toLowerCase() === normalizedUserEmail
  )?.status

  /** Map ICS needs-action to no highlighted RSVP button until user responds. */
  const currentAttendeeStatus =
    rawAttendeeStatus === 'needs-action' ? undefined : rawAttendeeStatus

  const isAttendee = Boolean(
    normalizedUserEmail &&
    event?.attendees?.some(
      (a) => a.email.trim().toLowerCase() === normalizedUserEmail
    )
  )

  const eventKey =
    typeof event?.key === 'string' && event.key.length > 0
      ? event.key
      : typeof event?.id === 'string' && event.id.length > 0
        ? event.id
        : undefined

  const handleAttendance = useCallback(
    async (status: AttendanceStatus, recurrenceId?: string) => {
      if (!eventKey) return
      await postAttendance({
        eventKey,
        status,
        recurrence_id: recurrenceId ?? event?.recurrence_id ?? undefined,
      }).unwrap()
    },
    [event?.recurrence_id, eventKey, postAttendance]
  )

  return {
    currentUserEmail,
    normalizedUserEmail,
    currentAttendeeStatus,
    isAttendee,
    eventKey,
    handleAttendance,
    isAttendanceLoading,
  }
}
