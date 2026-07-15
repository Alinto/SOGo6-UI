'use client'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  RSVP_STATUSES,
  useEventAttendance,
} from '@/features/calendars/hooks/use-event-attendance'
import type { MailInvitationState } from '@/features/mails/hooks/use-mail-invitation'
import type { ParsedMailInvitation } from '@/features/mails/utils/parse-mail-ics'
import { Link } from '@/lib/i18n/navigation'
import { cn } from '@/lib/utils'
import { CalendarCheck, ChevronRight, MapPin, User } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { memo } from 'react'

interface MailInvitationWidgetProps {
  state: Exclude<MailInvitationState, { kind: 'none' }>
}

function formatInvitationDateTime(
  dtStart: string,
  dtEnd: string | undefined,
  allDay: boolean
): string {
  const start = new Date(dtStart)
  if (Number.isNaN(start.getTime())) return dtStart

  const dateStr = start.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  if (allDay) return dateStr

  const end = dtEnd ? new Date(dtEnd) : null
  const timeStart = start.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
  const timeEnd =
    end && !Number.isNaN(end.getTime())
      ? end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : null

  return timeEnd
    ? `${dateStr} · ${timeStart} – ${timeEnd}`
    : `${dateStr} · ${timeStart}`
}

function InvitationDetails({
  parsed,
  showSyncedBanner,
  eventKey,
  statusMessage,
  actions,
  variant = 'default',
}: {
  parsed: ParsedMailInvitation
  showSyncedBanner?: boolean
  eventKey?: string
  statusMessage?: React.ReactNode
  actions?: React.ReactNode
  variant?: 'default' | 'cancelled'
}) {
  const t = useTranslations('MAILS_COMMONS.invitation')
  const tCal = useTranslations('CALENDARS')

  const hasMeta = Boolean(parsed.location || parsed.organizer)
  const hasFooter = Boolean(actions || eventKey)

  return (
    <div
      className={cn(
        'border-border bg-card mb-4 overflow-hidden rounded-md border',
        variant === 'cancelled' && 'opacity-90'
      )}
    >
      <div
        className={cn(
          'h-0.5',
          variant === 'cancelled' ? 'bg-destructive/60' : 'bg-primary'
        )}
        aria-hidden="true"
      />

      <div className="p-4">
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs">{t('label.string')}</p>
          <h3
            className={cn(
              'text-base leading-snug font-semibold',
              variant === 'cancelled' && 'text-muted-foreground line-through'
            )}
          >
            {parsed.summary}
          </h3>
          <p className="text-muted-foreground text-sm">
            {formatInvitationDateTime(
              parsed.dtStart,
              parsed.dtEnd,
              parsed.allDay
            )}
          </p>
        </div>

        {hasMeta ? (
          <ul className="mt-3 space-y-2">
            {parsed.location ? (
              <li className="flex items-center gap-2 text-sm">
                <MapPin
                  className="text-muted-foreground h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                <span className="min-w-0">{parsed.location}</span>
              </li>
            ) : null}

            {parsed.organizer ? (
              <li className="flex items-center gap-2 text-sm">
                <User
                  className="text-muted-foreground h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                <span className="flex min-w-0 flex-1 items-baseline justify-between gap-3">
                  <span>{parsed.organizer.name ?? parsed.organizer.email}</span>
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {tCal('visualization.organizerRole.string')}
                  </span>
                </span>
              </li>
            ) : null}
          </ul>
        ) : null}

        {statusMessage ? <div className="mt-3">{statusMessage}</div> : null}

        {showSyncedBanner ? (
          <p className="text-muted-foreground mt-3 flex items-center gap-2 text-sm">
            <CalendarCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
            {t('synced_to_calendar.string')}
          </p>
        ) : null}

        {hasFooter ? (
          <>
            <Separator className="my-4 opacity-50" />
            <div className="flex flex-wrap items-center justify-between gap-3">
              {actions ? (
                <div className="flex flex-wrap gap-2">{actions}</div>
              ) : (
                <span />
              )}
              {eventKey ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground h-auto gap-0.5 px-2"
                  asChild
                >
                  <Link
                    href={`/calendars?event=${encodeURIComponent(eventKey)}`}
                  >
                    {t('view_in_calendar.string')}
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}

const MailInvitationWidget: React.FC<MailInvitationWidgetProps> = ({
  state,
}) => {
  const t = useTranslations('MAILS_COMMONS.invitation')
  const tCal = useTranslations('CALENDARS')

  const event = state.kind === 'invitation' ? state.event : undefined

  const { currentAttendeeStatus, handleAttendance, isAttendanceLoading } =
    useEventAttendance(event)

  if (state.kind === 'loading') {
    return (
      <div
        className="border-border bg-muted/30 mb-4 h-28 animate-pulse overflow-hidden rounded-md border"
        data-testid="mail-invitation-loading"
      >
        <div className="bg-muted h-0.5 w-full" aria-hidden="true" />
      </div>
    )
  }

  if (state.kind === 'cancel') {
    return (
      <InvitationDetails
        parsed={state.parsed}
        variant="cancelled"
        statusMessage={
          <p className="text-destructive text-sm font-medium">
            {t('event_cancelled.string')}
          </p>
        }
      />
    )
  }

  if (state.kind === 'reply') {
    const statusKey = state.status as 'accepted' | 'declined' | 'tentative'
    const statusLabel =
      statusKey === 'accepted'
        ? tCal('visualization.attendeeStatus.accepted.string')
        : statusKey === 'declined'
          ? tCal('visualization.attendeeStatus.declined.string')
          : tCal('visualization.attendeeStatus.tentative.string')

    return (
      <InvitationDetails
        parsed={state.parsed}
        statusMessage={
          <p className="text-muted-foreground text-sm">
            {t('reply_from_attendee.string', {
              name: state.attendeeLabel,
              status: statusLabel,
            })}
          </p>
        }
      />
    )
  }

  if (state.kind === 'event-not-found') {
    return (
      <InvitationDetails
        parsed={state.parsed}
        statusMessage={
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-muted-foreground text-sm">
              {t('sync_pending.string')}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={state.retry}
            >
              {t('retry.string')}
            </Button>
          </div>
        }
      />
    )
  }

  if (state.kind === 'invitation') {
    const { parsed, eventKey, canRsvp } = state

    return (
      <InvitationDetails
        parsed={parsed}
        showSyncedBanner
        eventKey={eventKey}
        actions={
          canRsvp
            ? RSVP_STATUSES.map((s) => (
                <Button
                  key={s}
                  type="button"
                  variant={currentAttendeeStatus === s ? 'default' : 'outline'}
                  size="sm"
                  disabled={isAttendanceLoading}
                  onClick={() => void handleAttendance(s, parsed.recurrenceId)}
                >
                  {tCal(`attendance.${s}.string`)}
                </Button>
              ))
            : undefined
        }
      />
    )
  }

  return null
}

export default memo(MailInvitationWidget)
