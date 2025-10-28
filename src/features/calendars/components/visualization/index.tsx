import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Bell,
  Calendar,
  Clock,
  FileText,
  MapPin,
  Users,
  Video,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'
import { CalendarEvent } from '../../calendars-types'

interface VisualizationProps {
  data: CalendarEvent
}

const Visualization: React.FC<VisualizationProps> = ({ data }) => {
  const t = useTranslations('CALENDARS')

  const startDate = new Date(data.start_date)
  const endDate = new Date(data.end_date)
  const dateStr = startDate.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const timeStr = `${startDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })} - ${endDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`

  return (
    <Card className="h-full w-full">
      <CardHeader>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">{data.title}</h2>
          <div className="text-muted-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <div>
              <p className="text-lg">{dateStr}</p>
              <p className="text-sm">{timeStr}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.location && (
          <>
            <div className="flex items-start gap-3">
              <MapPin className="text-muted-foreground mt-1 h-5 w-5 shrink-0" />
              <div>
                <h3 className="font-semibold">
                  {t('visualization.location.string')}
                </h3>
                <p className="text-muted-foreground">{data.location}</p>
              </div>
            </div>
            <Separator />
          </>
        )}

        {data.description && (
          <>
            <div className="flex items-start gap-3">
              <FileText className="text-muted-foreground mt-1 h-5 w-5 shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold">
                  {t('visualization.description.string')}
                </h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {data.description}
                </p>
              </div>
            </div>
            <Separator />
          </>
        )}

        {data.attendees && data.attendees.length > 0 && (
          <>
            <div className="flex items-start gap-3">
              <Users className="text-muted-foreground mt-1 h-5 w-5 shrink-0" />
              <div className="flex-1">
                <h3 className="mb-2 font-semibold">
                  {t('visualization.attendees.string')}
                </h3>
                <div className="space-y-2">
                  {data.attendees.map((attendee, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
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
                        <Badge
                          variant={
                            attendee.status === 'accepted'
                              ? 'default'
                              : attendee.status === 'declined'
                                ? 'destructive'
                                : 'secondary'
                          }
                        >
                          {attendee.status}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <Separator />
          </>
        )}

        {data.conference_data && (
          <>
            <div className="flex items-start gap-3">
              <Video className="text-muted-foreground mt-1 h-5 w-5 shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold">
                  {t('visualization.conference.string')}
                </h3>
                <a
                  href={data.conference_data.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {data.conference_data.type}{' '}
                  {t('visualization.joinMeeting.string')}
                </a>
              </div>
            </div>
            <Separator />
          </>
        )}

        {data.reminders && data.reminders.length > 0 && (
          <>
            <div className="flex items-start gap-3">
              <Bell className="text-muted-foreground mt-1 h-5 w-5 shrink-0" />
              <div className="flex-1">
                <h3 className="mb-2 font-semibold">
                  {t('visualization.reminders.string')}
                </h3>
                <div className="space-y-1">
                  {data.reminders.map((reminder, index) => {
                    const minutes = reminder.minutes_before
                    const hours = Math.floor(minutes / 60)
                    const days = Math.floor(hours / 24)

                    let timeStr = ''
                    if (days > 0) {
                      timeStr = t('visualization.daysBefore.string', {
                        count: days,
                      })
                    } else if (hours > 0) {
                      timeStr = t('visualization.hoursBefore.string', {
                        count: hours,
                      })
                    } else {
                      timeStr = t('visualization.minutesBefore.string', {
                        count: minutes,
                      })
                    }
                    const reminderText = `${reminder.method} ${timeStr}`

                    return (
                      <p key={index} className="text-muted-foreground text-sm">
                        {reminderText}
                      </p>
                    )
                  })}
                </div>
              </div>
            </div>
            <Separator />
          </>
        )}

        {data.recurrence && (
          <div className="flex items-start gap-3">
            <Clock className="text-muted-foreground mt-1 h-5 w-5 shrink-0" />
            <div>
              <h3 className="font-semibold">
                {t('visualization.recurrence.string')}
              </h3>
              <p className="text-muted-foreground">
                {t(`visualization.frequency.${data.recurrence.frequency}`)}
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
        )}
      </CardContent>
    </Card>
  )
}

export default Visualization
