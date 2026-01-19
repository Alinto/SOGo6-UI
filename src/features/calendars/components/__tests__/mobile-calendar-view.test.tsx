import type { CalendarEvent } from '@/features/calendars'
import { render, screen } from '@testing-library/react'
import { MobileCalendarView } from '../mobile-calendar-view'

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

// Mock @use-gesture/react
jest.mock('@use-gesture/react', () => ({
  useDrag: () => () => ({}),
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: any) => children,
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

describe('MobileCalendarView', () => {
  const mockOnNavigate = jest.fn()

  // Helper to create complete mock events
  const createMockEvent = (
    overrides = {}
  ): CalendarEvent & { start: Date; end: Date } => ({
    id: '1',
    title: 'Test Event',
    start: new Date('2026-01-19T10:00:00'),
    end: new Date('2026-01-19T11:00:00'),
    start_date: '2026-01-19T10:00:00',
    end_date: '2026-01-19T11:00:00',
    calendar_id: 'cal1',
    all_day: false,
    created_at: '2026-01-19T09:00:00',
    updated_at: '2026-01-19T09:00:00',
    description: '',
    location: '',
    status: 'confirmed',
    transparency: 'opaque',
    ...overrides,
  })

  const defaultProps = {
    date: new Date('2026-01-19'),
    events: [],
    calendarColorMap: {},
    defaultColor: '#3b82f6',
    onNavigate: mockOnNavigate,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render date header', () => {
    render(<MobileCalendarView {...defaultProps} />)
    expect(screen.getByText('19')).toBeInTheDocument()
    expect(screen.getByText(/Monday, January 2026/i)).toBeInTheDocument()
  })

  it('should show "No events" message when there are no events', () => {
    render(<MobileCalendarView {...defaultProps} />)
    expect(screen.getByText('No events')).toBeInTheDocument()
  })

  it('should show event count badge with correct number', () => {
    const propsWithEvent = {
      ...defaultProps,
      events: [createMockEvent()],
    }
    render(<MobileCalendarView {...propsWithEvent} />)
    expect(screen.getByText('1 event')).toBeInTheDocument()
  })

  it('should render event details when events exist', () => {
    const propsWithEvent = {
      ...defaultProps,
      events: [
        createMockEvent({
          title: 'Team Standup',
          start: new Date('2026-01-19T09:30:00'),
          end: new Date('2026-01-19T10:00:00'),
          start_date: '2026-01-19T09:30:00',
          end_date: '2026-01-19T10:00:00',
          description: 'Daily team sync',
        }),
      ],
    }
    render(<MobileCalendarView {...propsWithEvent} />)
    expect(screen.getByText('Team Standup')).toBeInTheDocument()
    expect(screen.getByText('Daily team sync')).toBeInTheDocument()
  })

  it('should show swipe hint', () => {
    render(<MobileCalendarView {...defaultProps} />)
    expect(screen.getByText('← Swipe to navigate →')).toBeInTheDocument()
  })

  it('should display correct time format', () => {
    const propsWithEvent = {
      ...defaultProps,
      events: [
        createMockEvent({
          start: new Date('2026-01-19T09:30:00'),
          end: new Date('2026-01-19T10:00:00'),
          start_date: '2026-01-19T09:30:00',
          end_date: '2026-01-19T10:00:00',
        }),
      ],
    }
    render(<MobileCalendarView {...propsWithEvent} />)
    expect(screen.getByText(/09:30/)).toBeInTheDocument()
    expect(screen.getByText(/10:00/)).toBeInTheDocument()
  })
})
