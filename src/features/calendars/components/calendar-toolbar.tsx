'use client'

import { Button } from '@/components/ui/button'
import { TimezoneSelect } from '@/components/ui/dates/timezones'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { addDays, format, isSameMonth, startOfWeek } from 'date-fns'
import * as locales from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { View, Views } from 'react-big-calendar'

export interface CalendarToolbarProps {
  view: View
  date: Date
  locale?: string
  onViewChange: (_view: View) => void
  onNavigatePrevious: () => void
  onNavigateToday: () => void
  onNavigateNext: () => void
  onCreateEvent: () => void
  timezone: string
  onTimezoneChange: (_timezone: string) => void
  className?: string
}

function getWeekMonthDisplay(date: Date, locale?: string): string {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 })
  const weekEnd = addDays(weekStart, 6)
  const dateLocale =
    locale && locales[locale as keyof typeof locales]
      ? locales[locale as keyof typeof locales]
      : undefined

  if (isSameMonth(weekStart, weekEnd)) {
    return format(weekStart, 'MMMM yyyy', { locale: dateLocale })
  } else {
    return `${format(weekStart, 'MMM', { locale: dateLocale })} – ${format(weekEnd, 'MMM yyyy', { locale: dateLocale })}`
  }
}

function getDayDisplay(date: Date, locale?: string): string {
  const dateLocale =
    locale && locales[locale as keyof typeof locales]
      ? locales[locale as keyof typeof locales]
      : undefined
  return format(date, 'd MMM. yyyy', { locale: dateLocale })
}

function getMonthDisplay(date: Date, locale?: string): string {
  const dateLocale =
    locale && locales[locale as keyof typeof locales]
      ? locales[locale as keyof typeof locales]
      : undefined
  return format(date, 'MMMM yyyy', { locale: dateLocale })
}

export function CalendarToolbar({
  view,
  date,
  locale,
  onViewChange,
  onNavigatePrevious,
  onNavigateToday,
  onNavigateNext,
  onCreateEvent,
  timezone,
  onTimezoneChange,
  className,
}: CalendarToolbarProps) {
  const createEventLabel = 'Create Event'
  const todayLabel = 'Today'
  const monthLabel = 'Month'
  const weekLabel = 'Week'
  const dayLabel = 'Day'
  const scheduleLabel = 'Schedule'
  const weekMonthDisplay = getWeekMonthDisplay(date, locale)
  const dayDisplay = getDayDisplay(date, locale)
  const monthDisplay = getMonthDisplay(date, locale)

  return (
    <div
      className={`mb-4 flex flex-wrap items-center justify-between gap-4 ${className || ''}`}
    >
      <div className="flex items-center gap-4">
        <Button onClick={onCreateEvent}>
          <Plus className="mr-2 size-5" />
          {createEventLabel}
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={onNavigatePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={onNavigateToday}>
            {todayLabel}
          </Button>
          <Button variant="outline" size="icon" onClick={onNavigateNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {view === Views.WEEK && (
          <div className="font-bold">{weekMonthDisplay}</div>
        )}
        {view === Views.DAY && <div className="font-bold">{dayDisplay}</div>}
        {view === Views.MONTH && (
          <div className="font-bold">{monthDisplay}</div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Select
          value={view}
          onValueChange={(value) => onViewChange(value as View)}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Select view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={Views.MONTH}>{monthLabel}</SelectItem>
            <SelectItem value={Views.WEEK}>{weekLabel}</SelectItem>
            <SelectItem value={Views.DAY}>{dayLabel}</SelectItem>
            <SelectItem value={Views.AGENDA}>{scheduleLabel}</SelectItem>
          </SelectContent>
        </Select>

        <TimezoneSelect
          value={timezone}
          onValueChange={onTimezoneChange}
          className="w-[280px]"
        />
      </div>
    </div>
  )
}

export default CalendarToolbar
