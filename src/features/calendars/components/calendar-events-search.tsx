'use client'

import { Input } from '@/components/ui/input'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import { CALENDAR_TEXT_SEARCH_MAX_LENGTH } from '@/features/calendars/calendar-constants'
import { selectCalendarEventFromSearch } from '@/features/calendars/calendar-event-selection-bridge'
import type { CalendarEvent } from '@/features/calendars/calendars-types'
import { useCalendarVisibility } from '@/features/calendars/hooks/useCalendarVisibility'
import {
  useGetCalendarsQuery,
  useSearchEventsQuery,
} from '@/features/calendars/store/calendars-api'
import { getDateFnsLocale } from '@/lib/i18n/date-locales'
import { format, parseISO } from 'date-fns'
import { SearchIcon } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { memo, useEffect, useMemo, useState, type KeyboardEvent } from 'react'

const SEARCH_RESULT_LIMIT = 8
const SEARCH_LISTBOX_ID = 'calendar-event-search-results'

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
  const [dismissed, setDismissed] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

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

  const isSearchOpen = debouncedSearch.length >= 2 && !dismissed

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
    setDismissed(false)
    setActiveIndex(0)
  }

  const optionCount = displayResults.length
  const highlightedIndex =
    optionCount === 0 ? -1 : Math.min(activeIndex, optionCount - 1)

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      if (!isSearchOpen) return
      event.preventDefault()
      setDismissed(true)
      return
    }

    if (optionCount === 0 || !isSearchOpen) return

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const step = event.key === 'ArrowDown' ? 1 : -1
      setActiveIndex((current) => {
        const base = Math.min(current, optionCount - 1)
        return (base + step + optionCount) % optionCount
      })
      return
    }

    if (event.key === 'Enter' && highlightedIndex >= 0) {
      event.preventDefault()
      const selected = displayResults[highlightedIndex]
      if (selected) handleSelectSearchResult(selected)
    }
  }

  return (
    <Popover open={isSearchOpen}>
      <PopoverAnchor asChild>
        <div className="relative w-full">
          <Input
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-label={t('search.label.string')}
            className="text-foreground caret-foreground placeholder:text-transparent"
            placeholder={t('search.string')}
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value)
              setDismissed(false)
              setActiveIndex(0)
            }}
            onKeyDown={handleKeyDown}
            aria-expanded={isSearchOpen}
            aria-controls={
              optionCount > 0 && isSearchOpen ? SEARCH_LISTBOX_ID : undefined
            }
            aria-activedescendant={
              highlightedIndex >= 0 && isSearchOpen
                ? `${SEARCH_LISTBOX_ID}-option-${highlightedIndex}`
                : undefined
            }
            autoComplete="off"
            maxLength={CALENDAR_TEXT_SEARCH_MAX_LENGTH}
          />
          {!searchInput && (
            <div className="text-muted-foreground pointer-events-none absolute inset-0 flex items-center gap-2 px-3 text-sm">
              <SearchIcon className="size-4 shrink-0 opacity-70" aria-hidden />
              {t('search.string')}
            </div>
          )}
        </div>
      </PopoverAnchor>
      <PopoverContent
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
          <ul
            id={SEARCH_LISTBOX_ID}
            role="listbox"
            className="max-h-64 overflow-y-auto py-1"
          >
            {displayResults.map((event, index) => (
              <li key={eventResultKey(event)} role="presentation">
                <button
                  type="button"
                  id={`${SEARCH_LISTBOX_ID}-option-${index}`}
                  role="option"
                  aria-selected={index === highlightedIndex}
                  className={`hover:bg-accent focus:bg-accent w-full px-3 py-2 text-left text-sm outline-none ${
                    index === highlightedIndex ? 'bg-accent' : ''
                  }`}
                  onMouseEnter={() => setActiveIndex(index)}
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
