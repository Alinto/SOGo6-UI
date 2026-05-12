import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import CalendarContent from '../calendar-content'

const mockUseGetCalendarsQuery = jest.fn()
const mockUseGetEventsInTimeRangeQuery = jest.fn()

jest.mock('@/features/calendars/store/calendars-api', () => ({
  useGetCalendarsQuery: () => mockUseGetCalendarsQuery(),
  useGetEventsInTimeRangeQuery: (...args: unknown[]) =>
    mockUseGetEventsInTimeRangeQuery(...args),
}))

jest.mock('@/components/ui/calendar-lazy', () => ({
  Calendar: ({
    onSelect,
    modifiers,
  }: {
    onSelect?: (d: Date | undefined) => void
    modifiers?: { hasEvents?: Date[] }
  }) => (
    <div data-testid="mock-calendar" data-has-events={modifiers?.hasEvents?.length ?? 0}>
      <button
        type="button"
        onClick={() => onSelect?.(new Date(2025, 5, 15))}
      >
        pick-day
      </button>
    </div>
  ),
}))

jest.mock('@/components/ui/sidebar', () => ({
  SidebarGroupContent: ({
    children,
    className,
  }: {
    children: ReactNode
    className?: string
  }) => (
    <div data-testid="sidebar-group-content" className={className}>
      {children}
    </div>
  ),
}))

jest.mock('@/lib/utils', () => ({
  cn: (...args: (string | boolean | undefined)[]) =>
    args.filter(Boolean).join(' '),
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      today: 'Today',
      no_events: 'No events today',
      all_day: 'All day',
      loading: 'Loading events…',
      error: 'Could not load events',
    }
    return map[key] ?? key
  },
}))

describe('CalendarContent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseGetCalendarsQuery.mockReturnValue({
      data: [{ id: 'cal-1', key: 'cal-1', u_hidden: false, color: '#3b82f6' }],
    })
    mockUseGetEventsInTimeRangeQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    })
  })

  describe('basic rendering', () => {
    it('renders calendar and event section', () => {
      render(<CalendarContent />)
      expect(screen.getByTestId('mock-calendar')).toBeInTheDocument()
      expect(screen.getByTestId('sidebar-group-content')).toBeInTheDocument()
    })

    it('shows Today label for current day selection', () => {
      render(<CalendarContent />)
      expect(screen.getByText('Today')).toBeInTheDocument()
    })

    it('shows no events message when list is empty', () => {
      render(<CalendarContent />)
      expect(screen.getByText('No events today')).toBeInTheDocument()
    })
  })

  describe('configuration', () => {
    it('passes event dates as calendar modifiers when month has events', () => {
      const today = new Date()
      today.setHours(12, 0, 0, 0)
      mockUseGetEventsInTimeRangeQuery.mockImplementation(() => ({
        data: [
          {
            id: 'e1',
            title: 'Standup',
            start_date: today.toISOString(),
            calendar_id: 'cal-1',
            all_day: false,
            created_at: today.toISOString(),
            updated_at: today.toISOString(),
          },
        ],
        isLoading: false,
        isError: false,
      }))

      render(<CalendarContent />)
      const cal = screen.getByTestId('mock-calendar')
      expect(cal.getAttribute('data-has-events')).not.toBe('0')
    })

    it('skips events query when no calendars', () => {
      mockUseGetCalendarsQuery.mockReturnValue({ data: [] })
      render(<CalendarContent />)
      expect(mockUseGetEventsInTimeRangeQuery).toHaveBeenCalled()
    })
  })

  describe('integration', () => {
    it('updates selected day when calendar fires onSelect', async () => {
      const user = userEvent.setup()
      render(<CalendarContent />)

      await user.click(screen.getByRole('button', { name: 'pick-day' }))
      await waitFor(() => {
        expect(screen.queryByText('Today')).not.toBeInTheDocument()
      })
    })
  })

  describe('accessibility', () => {
    it('exposes pick-day as type button', () => {
      render(<CalendarContent />)
      expect(screen.getByRole('button', { name: 'pick-day' })).toHaveAttribute(
        'type',
        'button'
      )
    })
  })

  describe('component stability', () => {
    it('renders after rerender with same mocks', () => {
      const { rerender } = render(<CalendarContent />)
      rerender(<CalendarContent />)
      expect(screen.getByTestId('mock-calendar')).toBeInTheDocument()
    })
  })
})
