import '@testing-library/jest-dom'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { selectCalendarEventFromSearch } from '@/features/calendars/calendar-event-selection-bridge'
import { CalendarEventsSearch } from '../calendar-events-search'

const mockSearchEventsQuery = jest.fn()

jest.mock('@/features/calendars/calendar-event-selection-bridge', () => ({
  selectCalendarEventFromSearch: jest.fn(),
}))

jest.mock('@/features/calendars/store/calendars-api', () => ({
  useGetCalendarsQuery: () => ({
    data: [{ id: 'cal-1', key: 'cal-1', name: 'Work' }],
  }),
  useSearchEventsQuery: (...args: unknown[]) => mockSearchEventsQuery(...args),
}))

jest.mock('@/features/calendars/hooks/useCalendarVisibility', () => ({
  useCalendarVisibility: () => ({
    isCalendarVisible: () => true,
  }),
}))

jest.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'search.string': 'Search events...',
      'search.no_results.string': 'No events found',
      'search.loading.string': 'Searching...',
    }
    return translations[key] || key
  },
}))

jest.mock('@/components/ui/popover', () => ({
  Popover: ({
    children,
    open,
  }: {
    children: React.ReactNode
    open?: boolean
  }) => (
    <div data-testid="popover" data-open={open ? 'true' : 'false'}>
      {children}
    </div>
  ),
  PopoverAnchor: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  PopoverContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover-content">{children}</div>
  ),
}))

describe('CalendarEventsSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSearchEventsQuery.mockReturnValue({
      data: [],
      isFetching: false,
    })
  })

  it('renders search placeholder overlay like mails header search', () => {
    render(<CalendarEventsSearch />)

    expect(screen.getByText('Search events...')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveClass('placeholder:text-transparent')
  })

  it('calls selectCalendarEventFromSearch when a result is clicked', () => {
    jest.useFakeTimers()
    const event = {
      id: 'e1',
      key: 'e1',
      title: 'Team standup',
      calendar_id: 'cal-1',
      date_start: '2024-06-23T09:00:00.000Z',
    }

    mockSearchEventsQuery.mockReturnValue({
      data: [event],
      isFetching: false,
    })

    render(<CalendarEventsSearch />)

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'team' },
    })

    act(() => {
      jest.advanceTimersByTime(300)
    })

    fireEvent.click(screen.getByRole('button', { name: /Team standup/i }))

    expect(selectCalendarEventFromSearch).toHaveBeenCalledWith(event)

    jest.useRealTimers()
  })
})
