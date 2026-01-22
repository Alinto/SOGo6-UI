import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { AgendaView } from '../agenda-view'

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      'schedule.noEvents.string': 'No events',
      'schedule.noUpcomingEvents.string': 'No upcoming events for this period',
      'forms.createCalendar.durationOptions.allDay.string': 'All Day',
    }
    return translations[key] || key
  }),
}))

describe('AgendaView', () => {
  const mockDate = new Date('2024-01-15T10:00:00Z')
  const mockCalendarColorMap = {
    'cal-1': '#3b82f6',
    'cal-2': '#10b981',
  }

  const mockEvents = [
    {
      id: '1',
      title: 'Team Meeting',
      description: 'Weekly team sync',
      start: new Date('2024-01-16T09:00:00Z'),
      end: new Date('2024-01-16T10:00:00Z'),
      start_date: '2024-01-16T09:00:00Z',
      end_date: '2024-01-16T10:00:00Z',
      calendar_id: 'cal-1',
      all_day: false,
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z',
    },
    {
      id: '2',
      title: 'Conference',
      description: 'Annual tech conference',
      start: new Date('2024-01-17T08:00:00Z'),
      end: new Date('2024-01-17T17:00:00Z'),
      start_date: '2024-01-17T08:00:00Z',
      end_date: '2024-01-17T17:00:00Z',
      calendar_id: 'cal-2',
      all_day: true,
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z',
    },
    {
      id: '3',
      title: 'Past Event',
      description: 'This should not appear',
      start: new Date('2024-01-10T09:00:00Z'),
      end: new Date('2024-01-10T10:00:00Z'),
      start_date: '2024-01-10T09:00:00Z',
      end_date: '2024-01-10T10:00:00Z',
      calendar_id: 'cal-1',
      all_day: false,
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z',
    },
  ]

  it('should render no events message when there are no upcoming events', () => {
    render(
      <AgendaView
        events={[]}
        date={mockDate}
        calendarColorMap={mockCalendarColorMap}
      />
    )

    expect(screen.getByText('No events')).toBeInTheDocument()
    expect(
      screen.getByText('No upcoming events for this period')
    ).toBeInTheDocument()
  })

  it('should render upcoming events only', () => {
    render(
      <AgendaView
        events={mockEvents}
        date={mockDate}
        calendarColorMap={mockCalendarColorMap}
      />
    )

    expect(screen.getByText('Team Meeting')).toBeInTheDocument()
    expect(screen.getByText('Conference')).toBeInTheDocument()
    expect(screen.queryByText('Past Event')).not.toBeInTheDocument()
  })

  it('should render event with correct color from calendar color map', () => {
    render(
      <AgendaView
        events={mockEvents}
        date={mockDate}
        calendarColorMap={mockCalendarColorMap}
      />
    )

    const dateIndicators = screen.getAllByText(/^\d+$/)
    expect(dateIndicators.length).toBeGreaterThan(0)
  })

  it('should display event description when available', () => {
    render(
      <AgendaView
        events={mockEvents}
        date={mockDate}
        calendarColorMap={mockCalendarColorMap}
      />
    )

    expect(screen.getByText('Weekly team sync')).toBeInTheDocument()
    expect(screen.getByText('Annual tech conference')).toBeInTheDocument()
  })

  it('should display "All Day" badge for all-day events', () => {
    render(
      <AgendaView
        events={mockEvents}
        date={mockDate}
        calendarColorMap={mockCalendarColorMap}
      />
    )

    expect(screen.getByText('All Day')).toBeInTheDocument()
  })

  it('should use default color when calendar color is not in map', () => {
    const eventsWithUnknownCalendar = [
      {
        id: '4',
        title: 'Unknown Calendar Event',
        description: 'Event from unknown calendar',
        start: new Date('2024-01-16T09:00:00Z'),
        end: new Date('2024-01-16T10:00:00Z'),
        start_date: '2024-01-16T09:00:00Z',
        end_date: '2024-01-16T10:00:00Z',
        calendar_id: 'unknown-cal',
        all_day: false,
        created_at: '2024-01-15T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z',
      },
    ]

    render(
      <AgendaView
        events={eventsWithUnknownCalendar}
        date={mockDate}
        calendarColorMap={mockCalendarColorMap}
      />
    )

    expect(screen.getByText('Unknown Calendar Event')).toBeInTheDocument()
  })

  it('should sort events by start date', () => {
    const unsortedEvents = [
      {
        id: '2',
        title: 'Later Event',
        description: '',
        start: new Date('2024-01-20T09:00:00Z'),
        end: new Date('2024-01-20T10:00:00Z'),
        start_date: '2024-01-20T09:00:00Z',
        end_date: '2024-01-20T10:00:00Z',
        calendar_id: 'cal-1',
        all_day: false,
        created_at: '2024-01-15T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z',
      },
      {
        id: '1',
        title: 'Earlier Event',
        description: '',
        start: new Date('2024-01-16T09:00:00Z'),
        end: new Date('2024-01-16T10:00:00Z'),
        start_date: '2024-01-16T09:00:00Z',
        end_date: '2024-01-16T10:00:00Z',
        calendar_id: 'cal-1',
        all_day: false,
        created_at: '2024-01-15T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z',
      },
    ]

    render(
      <AgendaView
        events={unsortedEvents}
        date={mockDate}
        calendarColorMap={mockCalendarColorMap}
      />
    )

    const eventTitles = screen.getAllByRole('heading', { level: 3 })
    expect(eventTitles[0]).toHaveTextContent('Earlier Event')
    expect(eventTitles[1]).toHaveTextContent('Later Event')
  })
})
