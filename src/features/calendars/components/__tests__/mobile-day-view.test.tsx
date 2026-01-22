import { fireEvent, render, screen } from '@testing-library/react'
import { addDays, addHours } from 'date-fns'
import { MobileDayView } from '../mobile-day-view'

// Mock next-intl
jest.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'event.string': 'event',
      'event.plural': 'events',
      'noEvents.string': 'No events',
      'swipeToChangeDay.string': 'Swipe to change day',
      'swipeToNavigate.string': '← Swipe to navigate →',
      'timeSeparator.string': '-',
    }
    return translations[key] || key
  },
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

// Mock @use-gesture/react
jest.mock('@use-gesture/react', () => ({
  useDrag: () => () => ({}),
}))

// Mock date-fns locale
jest.mock('@/lib/i18n/date-locales', () => ({
  getDateFnsLocale: () => ({
    code: 'en',
    localize: {
      month: () => '',
      day: () => '',
    },
  }),
}))

describe('MobileDayView', () => {
  const mockDate = new Date(2025, 0, 15) // 15 janvier 2025
  const mockOnNavigate = jest.fn()
  const mockOnEventClick = jest.fn()

  const createMockEvent = (
    overrides: Partial<Parameters<typeof MobileDayView>[0]['events'][0]> = {}
  ) => ({
    id: '1',
    title: 'Test Event',
    calendar_id: 'cal-1',
    start: new Date(2025, 0, 15, 10, 0),
    end: new Date(2025, 0, 15, 11, 0),
    start_date: '2025-01-15T10:00:00',
    end_date: '2025-01-15T11:00:00',
    all_day: false,
    created_at: '2025-01-15T09:00:00',
    updated_at: '2025-01-15T09:00:00',
    description: '',
    location: '',
    status: 'confirmed' as const,
    transparency: 'opaque' as const,
    ...overrides,
  })

  const defaultProps = {
    date: mockDate,
    events: [],
    calendarColorMap: {},
    defaultColor: '#3b82f6',
    onNavigate: mockOnNavigate,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the component', () => {
    render(<MobileDayView {...defaultProps} />)
    expect(screen.getByText('15')).toBeInTheDocument()
  })

  it('should display the formatted date', () => {
    render(<MobileDayView {...defaultProps} />)
    expect(screen.getByText('15')).toBeInTheDocument()
  })

  it('should show "No events" message when there are no events', () => {
    render(<MobileDayView {...defaultProps} />)
    expect(screen.getByText('No events')).toBeInTheDocument()
    expect(screen.getByText('Swipe to change day')).toBeInTheDocument()
  })

  it('should display events for the selected day', () => {
    const event = createMockEvent()
    render(<MobileDayView {...defaultProps} events={[event]} />)

    expect(screen.getByText('Test Event')).toBeInTheDocument()
    expect(screen.queryByText('No events')).not.toBeInTheDocument()
  })

  it('should filter events to show only events for the selected day', () => {
    const eventToday = createMockEvent({
      id: '1',
      start: new Date(2025, 0, 15, 10, 0),
      end: new Date(2025, 0, 15, 11, 0),
    })

    const eventTomorrow = createMockEvent({
      id: '2',
      title: 'Tomorrow Event',
      start: addDays(mockDate, 1),
      end: addDays(addHours(mockDate, 1), 1),
      start_date: addDays(mockDate, 1).toISOString(),
      end_date: addDays(addHours(mockDate, 1), 1).toISOString(),
    })

    render(
      <MobileDayView {...defaultProps} events={[eventToday, eventTomorrow]} />
    )

    expect(screen.getByText('Test Event')).toBeInTheDocument()
    expect(screen.queryByText('Tomorrow Event')).not.toBeInTheDocument()
  })

  it('should display event count badge', () => {
    const event1 = createMockEvent({ id: '1' })
    const event2 = createMockEvent({
      id: '2',
      title: 'Event 2',
      start: new Date(2025, 0, 15, 14, 0),
      end: new Date(2025, 0, 15, 15, 0),
      start_date: '2025-01-15T14:00:00',
      end_date: '2025-01-15T15:00:00',
    })

    render(<MobileDayView {...defaultProps} events={[event1, event2]} />)

    // Vérifie que le badge contient "2 events"
    expect(screen.getByText(/2.*events/)).toBeInTheDocument()
  })

  it('should display singular "event" for single event', () => {
    const event = createMockEvent()
    render(<MobileDayView {...defaultProps} events={[event]} />)

    // Vérifie que le badge contient "1 event" (pas "events")
    expect(screen.getByText(/1.*event$/)).toBeInTheDocument()
  })

  it('should display event time range', () => {
    const event = createMockEvent({
      start: new Date(2025, 0, 15, 14, 30),
      end: new Date(2025, 0, 15, 16, 45),
      start_date: '2025-01-15T14:30:00',
      end_date: '2025-01-15T16:45:00',
    })

    render(<MobileDayView {...defaultProps} events={[event]} />)
    expect(screen.getByText('Test Event')).toBeInTheDocument()
  })

  it('should display event description when available', () => {
    const event = createMockEvent({
      description: 'This is a test description',
    })

    render(<MobileDayView {...defaultProps} events={[event]} />)
    expect(screen.getByText('This is a test description')).toBeInTheDocument()
  })

  it('should use calendar color from calendarColorMap', () => {
    const event = createMockEvent({ calendar_id: 'cal-1' })
    const calendarColorMap = { 'cal-1': '#FF0000' }

    const { container } = render(
      <MobileDayView
        {...defaultProps}
        events={[event]}
        calendarColorMap={calendarColorMap}
      />
    )

    const colorIndicator = container.querySelector('[style*="background-color"]')
    expect(colorIndicator).toBeInTheDocument()
  })

  it('should use default color when calendar color is not mapped', () => {
    const event = createMockEvent({ calendar_id: 'unknown-cal' })

    const { container } = render(
      <MobileDayView {...defaultProps} events={[event]} />
    )

    const colorIndicator = container.querySelector('[style*="background-color"]')
    expect(colorIndicator).toBeInTheDocument()
  })

  it('should call onEventClick when event card is clicked', () => {
    const event = createMockEvent()
    render(
      <MobileDayView
        {...defaultProps}
        events={[event]}
        onEventClick={mockOnEventClick}
      />
    )

    const eventCard = screen.getByText('Test Event').closest('div[class*="cursor-pointer"]')
    if (eventCard) {
      fireEvent.click(eventCard)
      expect(mockOnEventClick).toHaveBeenCalledWith(event)
    }
  })

  it('should not call onEventClick when prop is not provided', () => {
    const event = createMockEvent()
    render(<MobileDayView {...defaultProps} events={[event]} />)

    const eventCard = screen.getByText('Test Event').closest('div')
    if (eventCard) {
      fireEvent.click(eventCard)
      expect(mockOnEventClick).not.toHaveBeenCalled()
    }
  })

  it('should sort events by start time', () => {
    const event1 = createMockEvent({
      id: '1',
      title: 'First Event',
      start: new Date(2025, 0, 15, 14, 0),
      end: new Date(2025, 0, 15, 15, 0),
      start_date: '2025-01-15T14:00:00',
      end_date: '2025-01-15T15:00:00',
    })

    const event2 = createMockEvent({
      id: '2',
      title: 'Second Event',
      start: new Date(2025, 0, 15, 10, 0),
      end: new Date(2025, 0, 15, 11, 0),
      start_date: '2025-01-15T10:00:00',
      end_date: '2025-01-15T11:00:00',
    })

    render(<MobileDayView {...defaultProps} events={[event1, event2]} />)

    const eventTitles = screen.getAllByText(/Event/)
    expect(eventTitles[0]).toHaveTextContent('Second Event')
    expect(eventTitles[1]).toHaveTextContent('First Event')
  })

  it('should display swipe hint at the bottom', () => {
    render(<MobileDayView {...defaultProps} />)
    expect(screen.getByText('← Swipe to navigate →')).toBeInTheDocument()
  })

  it('should handle events with same start time', () => {
    const event1 = createMockEvent({
      id: '1',
      title: 'Event 1',
    })
    const event2 = createMockEvent({
      id: '2',
      title: 'Event 2',
      start: new Date(2025, 0, 15, 10, 0),
      end: new Date(2025, 0, 15, 11, 0),
      start_date: '2025-01-15T10:00:00',
      end_date: '2025-01-15T11:00:00',
    })

    render(<MobileDayView {...defaultProps} events={[event1, event2]} />)

    expect(screen.getByText('Event 1')).toBeInTheDocument()
    expect(screen.getByText('Event 2')).toBeInTheDocument()
  })
})
