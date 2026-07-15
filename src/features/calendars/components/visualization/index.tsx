import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  Bell,
  Calendar,
  Clock,
  ExternalLink,
  FileText,
  MapPin,
  Users,
  Video,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { memo } from 'react'
import type {
  CalendarEvent,
  EventAttendee,
  EventReminder,
} from '../../calendars-types'
import {
  RSVP_STATUSES,
  useEventAttendance,
} from '../../hooks/use-event-attendance'

interface VisualizationProps {
  data: CalendarEvent
  /** Calendar color; events inherit color from their calendar, not per-event overrides. */
  accentColor?: string
}

const getStatusClassName = (status: NonNullable<CalendarEvent['status']>) =>
  cn(
    status === 'confirmed' && 'border-green-200 bg-green-100 text-green-800',
    status === 'tentative' && 'border-orange-200 bg-orange-100 text-orange-800',
    status === 'cancelled' && 'border-red-200 bg-red-100 text-red-800'
  )

function formatReminderTimeBefore(
  t: ReturnType<typeof useTranslations<'CALENDARS'>>,
  minutes: number
): string {
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return t('visualization.daysBefore.string', { count: days })
  }
  if (hours > 0) {
    return t('visualization.hoursBefore.string', { count: hours })
  }
  return t('visualization.minutesBefore.string', { count: minutes })
}

function getReminderMethodLabel(
  t: ReturnType<typeof useTranslations<'CALENDARS'>>,
  method: EventReminder['method']
): string {
  if (method === 'email') {
    return t('eventForm.reminders.methods.email.string')
  }
  return t('eventForm.reminders.methods.popup.string')
}

function AttendeeParticipationStatus({
  status,
  t,
}: {
  status: NonNullable<EventAttendee['status']>
  t: ReturnType<typeof useTranslations<'CALENDARS'>>
}) {
  const config =
    status === 'accepted'
      ? {
          dotClassName: 'bg-green-500',
          label: t('visualization.attendeeStatus.accepted.string'),
        }
      : status === 'declined'
        ? {
            dotClassName: 'bg-red-500',
            label: t('visualization.attendeeStatus.declined.string'),
          }
        : status === 'tentative'
          ? {
              dotClassName: 'bg-orange-500',
              label: t('visualization.attendeeStatus.tentative.string'),
            }
          : {
              dotClassName: 'bg-orange-500',
              label: t('visualization.attendeeStatus.pending.string'),
            }

  return (
    <span
      className={cn('text-muted-foreground flex items-center gap-1 text-xs')}
    >
      <span
        className={cn('h-2 w-2 rounded-full', config.dotClassName)}
        aria-hidden="true"
      />
      {config.label}
    </span>
  )
}

const Visualization: React.FC<VisualizationProps> = ({ data, accentColor }) => {
  const t = useTranslations('CALENDARS')
  const {
    currentAttendeeStatus,
    isAttendee,
    handleAttendance,
    isAttendanceLoading,
  } = useEventAttendance(data)

  const visibility = data.visibility ?? 'public'
  const showAs = data.show_as ?? 'busy'
  const status = data.status ?? 'confirmed'

  const visibilityLabel =
    visibility === 'private'
      ? t('visualization.visibility.values.private.string')
      : visibility === 'confidential'
        ? t('visualization.visibility.values.confidential.string')
        : t('visualization.visibility.values.public.string')

  const showAsLabel =
    showAs === 'free'
      ? t('visualization.showAs.values.free.string')
      : showAs === 'tentative'
        ? t('visualization.showAs.values.tentative.string')
        : showAs === 'out-of-office'
          ? t('visualization.showAs.values.outOfOffice.string')
          : t('visualization.showAs.values.busy.string')

  const statusLabel =
    status === 'tentative'
      ? t('visualization.status.values.tentative.string')
      : status === 'cancelled'
        ? t('visualization.status.values.cancelled.string')
        : t('visualization.status.values.confirmed.string')

  const recurrenceFrequencyLabel = data.recurrence
    ? data.recurrence.frequency === 'daily'
      ? t('visualization.frequency.daily.string')
      : data.recurrence.frequency === 'weekly'
        ? t('visualization.frequency.weekly.string')
        : data.recurrence.frequency === 'monthly'
          ? t('visualization.frequency.monthly.string')
          : t('visualization.frequency.yearly.string')
    : null

  const startDate = new Date(data.date_start ?? '')
  const endDate = new Date(data.date_end ?? '')
  const dateStr = startDate.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const timeStr = `${startDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })} – ${endDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`

  const organizer = data.organizer
  const otherAttendees = (data.attendees ?? []).filter(
    (attendee) =>
      !organizer ||
      attendee.email.toLowerCase() !== organizer.email.toLowerCase()
  )
  const showAttendeesSection =
    organizer !== undefined || otherAttendees.length > 0

  const dateTimeLabel = data.all_day ? dateStr : `${dateStr} · ${timeStr}`

  const sections = [
    data.location && (
      <div key="location" className="flex items-start gap-3">
        <MapPin className="text-muted-foreground mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <h3 className="font-semibold">
            {t('visualization.location.string')}
          </h3>
          <p className="text-muted-foreground">{data.location}</p>
        </div>
      </div>
    ),
    data.description && (
      <div key="description" className="flex items-start gap-3">
        <FileText className="text-muted-foreground mt-0.5 h-5 w-5 shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold">
            {t('visualization.description.string')}
          </h3>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {data.description}
          </p>
        </div>
      </div>
    ),
    showAttendeesSection && (
      <div key="attendees" className="flex items-start gap-3">
        <Users className="text-muted-foreground mt-0.5 h-5 w-5 shrink-0" />
        <div className="flex-1">
          <h3 className="mb-2 font-semibold">
            {t('visualization.attendees.string')}
          </h3>
          <div className="space-y-2">
            {organizer && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {organizer.name ?? organizer.email}
                  </p>
                  {organizer.name && (
                    <p className="text-muted-foreground text-sm">
                      {organizer.email}
                    </p>
                  )}
                </div>
                <span className="text-muted-foreground text-xs">
                  {t('visualization.organizerRole.string')}
                </span>
              </div>
            )}
            {otherAttendees.map((attendee, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {attendee.name || attendee.email}
                  </p>
                  {attendee.name && (
                    <p className="text-muted-foreground text-sm">
                      {attendee.email}
                    </p>
                  )}
                </div>
                {attendee.status && (
                  <AttendeeParticipationStatus status={attendee.status} t={t} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    data.conference_data && (
      <div key="conference" className="flex items-start gap-3">
        <Video className="text-muted-foreground mt-0.5 h-5 w-5 shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold">
            {t('visualization.conference.string')}
          </h3>
          <a
            href={data.conference_data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[hsl(var(--ring))] underline underline-offset-2 hover:opacity-80"
          >
            {data.conference_data.type} {t('visualization.joinMeeting.string')}
          </a>
        </div>
      </div>
    ),
    data.reminders && data.reminders.length > 0 && (
      <div key="reminders" className="flex items-start gap-3 pt-1">
        <Bell className="text-muted-foreground mt-0.5 h-5 w-5 shrink-0" />
        <div className="flex-1">
          <h3 className="mb-2 font-semibold">
            {t('visualization.reminders.string')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.reminders.map((reminder, index) => {
              const timeBefore = formatReminderTimeBefore(
                t,
                reminder.minutes_before
              )
              const methodLabel = getReminderMethodLabel(t, reminder.method)

              return (
                <span
                  key={index}
                  className={cn(
                    'border-border bg-muted inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs'
                  )}
                >
                  <span aria-hidden="true">🔔</span>
                  {methodLabel} · {timeBefore}
                </span>
              )
            })}
          </div>
        </div>
      </div>
    ),
    data.recurrence && (
      <div key="recurrence" className="flex items-start gap-3">
        <Clock className="text-muted-foreground mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <h3 className="font-semibold">
            {t('visualization.recurrence.string')}
          </h3>
          <p className="text-muted-foreground">
            {recurrenceFrequencyLabel}
            {data.recurrence.interval && data.recurrence.interval > 1 && (
              <>
                {' '}
                {t('visualization.every.string', {
                  count: data.recurrence.interval,
                })}
              </>
            )}
          </p>
        </div>
      </div>
    ),
    data.categories && data.categories.length > 0 && (
      <div key="categories" className="flex items-start gap-3">
        <FileText className="text-muted-foreground mt-0.5 h-5 w-5 shrink-0" />
        <div className="flex-1">
          <h3 className="mb-2 font-semibold">
            {t('visualization.categories.string')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.categories.map((category) => (
              <Badge key={category} variant="secondary">
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    ),
    data.url && (
      <div key="url" className="flex items-start gap-3">
        <ExternalLink className="text-muted-foreground mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <h3 className="font-semibold">{t('visualization.url.string')}</h3>
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm break-all text-[hsl(var(--ring))] underline underline-offset-2 hover:opacity-80"
          >
            {data.url}
          </a>
        </div>
      </div>
    ),
    status !== 'confirmed' && (
      <div key="status" className="flex items-start gap-3">
        <Calendar className="text-muted-foreground mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <h3 className="font-semibold">{t('visualization.status.string')}</h3>
          <Badge variant="outline" className={getStatusClassName(status)}>
            {statusLabel}
          </Badge>
        </div>
      </div>
    ),
  ].filter((section): section is React.ReactElement => Boolean(section))

  return (
    <div className="space-y-5">
      <div
        className="-mx-6 -mt-6 mb-5 h-1 rounded-t-lg"
        style={{
          backgroundColor: accentColor ?? 'hsl(var(--primary))',
        }}
      />
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">{data.title}</h2>
        <p className="text-muted-foreground text-sm">{dateTimeLabel}</p>
      </div>

      {sections.map((section, index) => (
        <React.Fragment key={section.key ?? index}>
          {index > 0 && <Separator className="opacity-50" />}
          {section}
        </React.Fragment>
      ))}

      {isAttendee && (
        <>
          <Separator className="opacity-50" />
          <div className="mt-4 flex flex-wrap gap-2">
            {RSVP_STATUSES.map((s) => (
              <Button
                key={s}
                type="button"
                variant={currentAttendeeStatus === s ? 'default' : 'outline'}
                size="sm"
                disabled={isAttendanceLoading}
                onClick={() => handleAttendance(s)}
              >
                {t(`attendance.${s}`)}
              </Button>
            ))}
          </div>
        </>
      )}

      <Separator className="opacity-50" />
      <p className="text-muted-foreground text-xs">
        {visibilityLabel} · {showAsLabel}
      </p>
    </div>
  )
}

export default memo(Visualization)
