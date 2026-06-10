'use client'

import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/components/ui/popover'
import type { CalendarEvent } from '@/features/calendars/calendars-types'
import { useCalendarVisibility } from '@/features/calendars/hooks/useCalendarVisibility'
import {
  useGetCalendarsQuery,
  useSearchEventsQuery,
} from '@/features/calendars/store/calendars-api'
import { selectCalendarEventFromSearch } from '@/features/calendars/calendar-event-selection-bridge'
import { getDateFnsLocale } from '@/lib/i18n/date-locales'
import { format, parseISO } from 'date-fns'
import { SearchIcon } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { memo, useEffect, useMemo, useState } from 'react'

const SEARCH_RESULT_LIMIT = 8

function eventResultKey(event: CalendarEvent): string {
  return (
    event.key ??
    event.id ??
    event.uid ??
    `${event.calendar_id}-${event.date_start}`
  )
}

function formatEventSearchDate(
  event: CalendarEvent,
  dateFnsLocale: ReturnType<typeof getDateFnsLocale>
): string {
  const raw = event.date_start
  if (!raw) return ''
  try {
    return format(parseISO(raw), 'EEE d MMM yyyy · HH:mm', {
      locale: dateFnsLocale,
    })
  } catch {
    return raw
  }
}

export function CalendarEventsSearch() {
  const t = useTranslations('CALENDARS.toolbar')
  const locale = useLocale()
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const { data: calendarsData } = useGetCalendarsQuery()
  const { isCalendarVisible } = useCalendarVisibility()

  const visibleCalendarIds = useMemo(() => {
    return (calendarsData ?? [])
      .map((cal) => cal.key ?? cal.id)
      .filter((key): key is string => {
        if (!key) return false
        return isCalendarVisible(key)
      })
  }, [calendarsData, isCalendarVisible])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const isSearchOpen = debouncedSearch.length >= 2

  const { data: searchResults = [], isFetching: isSearchFetching } =
    useSearchEventsQuery(
      { calendarIds: visibleCalendarIds, search: debouncedSearch },
      { skip: !isSearchOpen || visibleCalendarIds.length === 0 }
    )

  const displayResults = useMemo(() => {
    const seen = new Set<string>()
    const unique: CalendarEvent[] = []
    for (const event of searchResults) {
      const key = eventResultKey(event)
      if (seen.has(key)) continue
      seen.add(key)
      unique.push(event)
      if (unique.length >= SEARCH_RESULT_LIMIT) break
    }
    return unique
  }, [searchResults])

  const dateFnsLocale = useMemo(() => getDateFnsLocale(locale), [locale])

  const handleSelectSearchResult = (event: CalendarEvent) => {
    selectCalendarEventFromSearch(event)
    setSearchInput('')
    setDebouncedSearch('')
  }

  return (
    <Popover open={isSearchOpen}>
      <PopoverAnchor asChild>
        <div className="relative w-full">
          <Input
            type="text"
            className="text-foreground caret-foreground placeholder:text-transparent"
            placeholder={t('search.string')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-expanded={isSearchOpen}
            aria-controls="calendar-event-search-results"
            autoComplete="off"
          />
          {!searchInput && (
            <div className="text-muted-foreground pointer-events-none absolute inset-0 flex items-center gap-2 px-3 text-sm">
              <SearchIcon className="size-4 shrink-0 opacity-70" />
              {t('search.string')}
            </div>
          )}
        </div>
      </PopoverAnchor>
      <PopoverContent
        id="calendar-event-search-results"
        side="bottom"
        align="start"
        className="z-50 w-80 p-0"
        modal={false}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {isSearchFetching ? (
          <p className="text-muted-foreground p-3 text-sm">
            {t('search.loading.string')}
          </p>
        ) : displayResults.length === 0 ? (
          <p className="text-muted-foreground p-3 text-sm">
            {t('search.no_results.string')}
          </p>
        ) : (
          <ul className="max-h-64 overflow-y-auto py-1">
            {displayResults.map((event) => (
              <li key={eventResultKey(event)}>
                <button
                  type="button"
                  className="hover:bg-accent focus:bg-accent w-full px-3 py-2 text-left text-sm outline-none"
                  onClick={() => handleSelectSearchResult(event)}
                >
                  <p className="truncate font-medium">{event.title}</p>
                  <p className="text-muted-foreground truncate text-xs">
                    {formatEventSearchDate(event, dateFnsLocale)}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  )
}

export default memo(CalendarEventsSearch)
