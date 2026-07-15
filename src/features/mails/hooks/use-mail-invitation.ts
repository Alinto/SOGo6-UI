import type { CalendarEvent } from '@/features/calendars/calendars-types'
import {
  useGetCalendarEventByIdQuery,
  useGetEventsQuery,
} from '@/features/calendars/store/calendars-api'
import type { ImapMessages } from '@/features/mails/mails-types'
import {
  extractEventKeyFromMail,
  extractIcsFromMail,
  mailHasEventType,
} from '@/features/mails/utils/extract-mail-ics'
import {
  parseMailIcs,
  type ParsedMailInvitation,
} from '@/features/mails/utils/parse-mail-ics'
import { useCallback, useEffect, useMemo, useState } from 'react'

export type MailInvitationState =
  | { kind: 'none' }
  | { kind: 'loading'; parsed: ParsedMailInvitation }
  | {
      kind: 'invitation'
      parsed: ParsedMailInvitation
      event: CalendarEvent
      eventKey: string
      canRsvp: boolean
    }
  | { kind: 'cancel'; parsed: ParsedMailInvitation }
  | {
      kind: 'reply'
      parsed: ParsedMailInvitation
      attendeeLabel: string
      status: string
    }
  | {
      kind: 'event-not-found'
      parsed: ParsedMailInvitation
      retry: () => void
    }

function buildDateRange(dtStart: string): {
  startDate: string
  endDate: string
} {
  const anchor = new Date(dtStart)
  if (Number.isNaN(anchor.getTime())) {
    const now = new Date()
    return { startDate: now.toISOString(), endDate: now.toISOString() }
  }
  const start = new Date(anchor)
  start.setDate(start.getDate() - 1)
  const end = new Date(anchor)
  end.setDate(end.getDate() + 2)
  return { startDate: start.toISOString(), endDate: end.toISOString() }
}

function resolveEventKey(event: CalendarEvent): string | null {
  if (typeof event.key === 'string' && event.key.length > 0) return event.key
  if (typeof event.id === 'string' && event.id.length > 0) return event.id
  return null
}

function canUserRsvp(
  event: CalendarEvent,
  userEmail: string | undefined,
  method: ParsedMailInvitation['method']
): boolean {
  if (method !== 'REQUEST' || event.status === 'cancelled') return false
  if (!userEmail?.trim()) return false
  const normalized = userEmail.trim().toLowerCase()
  return Boolean(
    event.attendees?.some((a) => a.email.trim().toLowerCase() === normalized)
  )
}

/**
 * Resolves calendar invitation metadata for a mail detail view.
 *
 * The backend processes inbound iMIP when GET mail detail runs (side-effect).
 * Event lookup may lag briefly — a single retry refetches events after 500ms.
 */
export function useMailInvitation(
  mail: ImapMessages | undefined,
  currentUserEmail: string | undefined
): MailInvitationState {
  const icsRaw = useMemo(() => extractIcsFromMail(mail), [mail])
  const backendEventKey = useMemo(() => extractEventKeyFromMail(mail), [mail])

  const parsed = useMemo(
    () => (icsRaw ? parseMailIcs(icsRaw, { currentUserEmail }) : null),
    [icsRaw, currentUserEmail]
  )

  const hasEventHint = mailHasEventType(mail) || Boolean(icsRaw)

  const dateRange = useMemo(
    () => (parsed?.dtStart ? buildDateRange(parsed.dtStart) : null),
    [parsed]
  )

  const [retryCount, setRetryCount] = useState(0)

  const {
    data: eventByKey,
    isFetching: isFetchingByKey,
    isLoading: isLoadingByKey,
  } = useGetCalendarEventByIdQuery(
    { eventKey: backendEventKey ?? '' },
    { skip: !backendEventKey }
  )

  const shouldScanByUid =
    Boolean(parsed?.uid && dateRange) &&
    !backendEventKey &&
    parsed?.method === 'REQUEST'

  const {
    data: eventsInRange,
    isFetching: isFetchingEvents,
    isLoading: isLoadingEvents,
    refetch: refetchEvents,
  } = useGetEventsQuery(dateRange ?? { startDate: '', endDate: '' }, {
    skip: !shouldScanByUid,
  })

  const matchedEvent = useMemo(() => {
    if (backendEventKey && eventByKey) return eventByKey
    if (!parsed?.uid || !eventsInRange?.length) return null
    return (
      eventsInRange.find((e) => e.uid === parsed.uid) ??
      eventsInRange.find((e) => e.key === parsed.uid || e.id === parsed.uid) ??
      null
    )
  }, [backendEventKey, eventByKey, eventsInRange, parsed])

  const retry = useCallback(() => {
    setRetryCount((c) => c + 1)
    if (shouldScanByUid) void refetchEvents()
  }, [refetchEvents, shouldScanByUid])

  useEffect(() => {
    if (
      parsed?.method !== 'REQUEST' ||
      matchedEvent ||
      backendEventKey ||
      !shouldScanByUid ||
      retryCount > 0
    ) {
      return
    }
    const timer = window.setTimeout(() => {
      setRetryCount(1)
      void refetchEvents()
    }, 500)
    return () => window.clearTimeout(timer)
  }, [
    backendEventKey,
    matchedEvent,
    parsed?.method,
    refetchEvents,
    retryCount,
    shouldScanByUid,
  ])

  if (!mail || !hasEventHint || !parsed) {
    return { kind: 'none' }
  }

  if (parsed.method === 'CANCEL') {
    return { kind: 'cancel', parsed }
  }

  if (parsed.method === 'REPLY') {
    const email = parsed.replyAttendeeEmail ?? ''
    const status = parsed.replyAttendeeStatus ?? 'accepted'
    return {
      kind: 'reply',
      parsed,
      attendeeLabel: email,
      status,
    }
  }

  const isResolving =
    (backendEventKey && (isLoadingByKey || isFetchingByKey)) ||
    (shouldScanByUid && (isLoadingEvents || isFetchingEvents))

  if (parsed.method === 'REQUEST' && isResolving && !matchedEvent) {
    return { kind: 'loading', parsed }
  }

  if (parsed.method === 'REQUEST' && matchedEvent) {
    const eventKey = resolveEventKey(matchedEvent)
    if (!eventKey) {
      return { kind: 'event-not-found', parsed, retry }
    }
    return {
      kind: 'invitation',
      parsed,
      event: matchedEvent,
      eventKey,
      canRsvp: canUserRsvp(matchedEvent, currentUserEmail, parsed.method),
    }
  }

  if (parsed.method === 'REQUEST') {
    return { kind: 'event-not-found', parsed, retry }
  }

  return { kind: 'none' }
}
