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
import { useIsMobile } from '@/hooks/useMediaQuery'
import { getDateFnsLocale } from '@/lib/i18n/date-locales'
import { cn } from '@/lib/utils'
import { addDays, format, isSameMonth, startOfWeek } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { View, Views } from 'react-big-calendar'

export interface CalendarToolbarProps {
  view: View
  date: Date
  onViewChange: (view: View) => void
  onNavigatePrevious: () => void
  onNavigateToday: () => void
  onNavigateNext: () => void
  timezone: string
  onTimezoneChange: (timezone: string) => void
  className?: string
}

export function CalendarToolbar({
  view,
  date,
  onViewChange,
  onNavigatePrevious,
  onNavigateToday,
  onNavigateNext,
  timezone,
  onTimezoneChange,
  className,
}: CalendarToolbarProps) {
  const t = useTranslations('CALENDARS.toolbar')
  const locale = useLocale()
  const isMobile = useIsMobile()

  // Get date-fns locale for current user locale
  const dateFnsLocale = useMemo(() => getDateFnsLocale(locale), [locale])

  // Calculate date displays (memoized for performance)
  const weekMonthDisplay = useMemo(() => {
    const weekStart = startOfWeek(date, {
      weekStartsOn: 1,
      locale: dateFnsLocale,
    })
    const weekEnd = addDays(weekStart, 6)

    if (isSameMonth(weekStart, weekEnd)) {
      return format(weekStart, 'MMMM yyyy', { locale: dateFnsLocale })
    } else {
      return `${format(weekStart, 'MMM', { locale: dateFnsLocale })} – ${format(weekEnd, 'MMM yyyy', { locale: dateFnsLocale })}`
    }
  }, [date, dateFnsLocale])

  const dayDisplay = useMemo(() => {
    return format(date, 'd MMM. yyyy', { locale: dateFnsLocale })
  }, [date, dateFnsLocale])

  const monthDisplay = useMemo(() => {
    return format(date, 'MMMM yyyy', { locale: dateFnsLocale })
  }, [date, dateFnsLocale])

  return (
    <div
      className={cn(
        'mb-4 flex flex-wrap items-center justify-between gap-2 border-b p-2',
        isMobile && 'gap-2',
        className
      )}
    >
      {/* Navigation and date display */}
      <div className={cn('flex items-center gap-2', isMobile && 'flex-1')}>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size={isMobile ? 'sm' : 'icon'}
            onClick={onNavigatePrevious}
            aria-label={t('previous.string')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size={isMobile ? 'sm' : 'default'}
            onClick={onNavigateToday}
          >
            {t('today.string')}
          </Button>
          <Button
            variant="outline"
            size={isMobile ? 'sm' : 'icon'}
            onClick={onNavigateNext}
            aria-label={t('next.string')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {!isMobile && (
          <>
            {view === Views.WEEK && (
              <div className="font-bold">{weekMonthDisplay}</div>
            )}
            {view === Views.DAY && (
              <div className="font-bold">{dayDisplay}</div>
            )}
            {view === Views.MONTH && (
              <div className="font-bold">{monthDisplay}</div>
            )}
          </>
        )}
      </div>

      {/* Right side controls */}
      <div className={cn('flex items-center gap-2', isMobile && 'flex-wrap')}>
        <Select
          value={view}
          onValueChange={(value) => onViewChange(value as View)}
        >
          <SelectTrigger className={cn(isMobile ? 'w-[90px]' : 'w-[100px]')}>
            <SelectValue placeholder={t('selectView.string')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={Views.MONTH}>
              {t('views.month.string')}
            </SelectItem>
            <SelectItem value={Views.WEEK}>
              {t('views.week.string')}
            </SelectItem>
            <SelectItem value={Views.DAY}>{t('views.day.string')}</SelectItem>
            <SelectItem value={Views.AGENDA}>
              {t('views.schedule.string')}
            </SelectItem>
          </SelectContent>
        </Select>

        {!isMobile && (
          <TimezoneSelect
            value={timezone}
            onValueChange={onTimezoneChange}
            className="w-[280px]"
          />
        )}
      </div>

      {/* Mobile: Date display on second row */}
      {isMobile && (
        <div className="w-full text-center text-sm font-bold">
          {view === Views.WEEK && weekMonthDisplay}
          {view === Views.DAY && dayDisplay}
          {view === Views.MONTH && monthDisplay}
        </div>
      )}
    </div>
  )
}

export default CalendarToolbar
