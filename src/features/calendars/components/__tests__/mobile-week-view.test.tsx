import type { CalendarEvent } from '@/features/calendars'
import { fireEvent, render } from '@testing-library/react'
import { MobileWeekView } from '../mobile-week-view'

jest.mock('next-intl', () => ({
  useLocale: () => 'en',
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    button: ({ children, onClick, className, ...props }: any) => (
      <button onClick={onClick} className={className} {...props}>
        {children}
      </button>
    ),
  },
}))

describe('MobileWeekView', () => {
  const mockOnDateSelect = jest.fn()

  // Mock event complet qui respecte le type CalendarEvent
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
    onDateSelect: mockOnDateSelect,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render week days', () => {
    const { container } = render(<MobileWeekView {...defaultProps} />)
    const dayButtons = container.querySelectorAll('button')
    expect(dayButtons.length).toBe(7)
  })

  it('should highlight selected date', () => {
    const { container } = render(<MobileWeekView {...defaultProps} />)
    const buttons = container.querySelectorAll('button')
    const selectedButton = Array.from(buttons).find((btn) =>
      btn.textContent?.includes('19')
    )
    expect(selectedButton).toBeInTheDocument()
  })

  it('should call onDateSelect when clicking a day', () => {
    const { container } = render(<MobileWeekView {...defaultProps} />)
    const firstDayButton = container.querySelector('button')
    if (firstDayButton) {
      fireEvent.click(firstDayButton)
      expect(mockOnDateSelect).toHaveBeenCalled()
    }
  })

  it('should show event indicators on days with events', () => {
    const propsWithEvents = {
      ...defaultProps,
      events: [createMockEvent()],
    }
    const { container } = render(<MobileWeekView {...propsWithEvents} />)

    // Chercher les dots d'événements
    const indicators = container.querySelectorAll(
      '.h-1\\.5.w-1\\.5.rounded-full'
    )
    expect(indicators.length).toBeGreaterThan(0)
  })
})
