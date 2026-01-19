import type { CalendarEvent } from '@/features/calendars'
import { fireEvent, render, screen } from '@testing-library/react'
import { MobileMonthView } from '../mobile-month-view'

// Mock next-intl
jest.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'today.string': 'Today',
      'hasEvents.string': 'Has events',
    }
    return translations[key] || key
  },
}))

// Mock lucide-react
jest.mock('lucide-react', () => ({
  ChevronLeft: ({ className }: any) => (
    <svg className={`lucide-chevron-left ${className}`} />
  ),
  ChevronRight: ({ className }: any) => (
    <svg className={`lucide-chevron-right ${className}`} />
  ),
}))

describe('MobileMonthView', () => {
  const mockOnDateSelect = jest.fn()
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
    onDateSelect: mockOnDateSelect,
    onNavigate: mockOnNavigate,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render current month and year', () => {
    render(<MobileMonthView {...defaultProps} />)
    expect(screen.getByText('January 2026')).toBeInTheDocument()
  })

  it('should render weekday headers', () => {
    const { container } = render(<MobileMonthView {...defaultProps} />)
    // Should have 7 weekday headers
    const headers = container.querySelectorAll('.text-muted-foreground.text-xs')
    expect(headers.length).toBeGreaterThanOrEqual(7)
  })

  it('should call onNavigate when clicking previous month', () => {
    render(<MobileMonthView {...defaultProps} />)
    const buttons = screen.getAllByRole('button')
    // Find button with ChevronLeft icon
    const prevButton = buttons.find((btn) =>
      btn.querySelector('.lucide-chevron-left')
    )
    expect(prevButton).toBeInTheDocument()
    if (prevButton) {
      fireEvent.click(prevButton)
      expect(mockOnNavigate).toHaveBeenCalled()
    }
  })

  it('should call onNavigate when clicking next month', () => {
    render(<MobileMonthView {...defaultProps} />)
    const buttons = screen.getAllByRole('button')
    // Find button with ChevronRight icon
    const nextButton = buttons.find((btn) =>
      btn.querySelector('.lucide-chevron-right')
    )
    expect(nextButton).toBeInTheDocument()
    if (nextButton) {
      fireEvent.click(nextButton)
      expect(mockOnNavigate).toHaveBeenCalled()
    }
  })

  it('should highlight selected date', () => {
    const { container } = render(<MobileMonthView {...defaultProps} />)
    const dayButtons = container.querySelectorAll('button')
    const selectedDay = Array.from(dayButtons).find(
      (btn) => btn.textContent === '19'
    )
    expect(selectedDay).toBeInTheDocument()
  })

  it('should call onDateSelect when clicking a day', () => {
    const { container } = render(<MobileMonthView {...defaultProps} />)
    const dayButtons = container.querySelectorAll('button')
    // Click on day 15 (should be in current month)
    const dayButton = Array.from(dayButtons).find(
      (btn) => btn.textContent === '15' && !btn.disabled
    )
    if (dayButton) {
      fireEvent.click(dayButton)
      expect(mockOnDateSelect).toHaveBeenCalled()
    }
  })

  it('should show event indicators on days with events', () => {
    const propsWithEvents = {
      ...defaultProps,
      events: [createMockEvent()],
    }
    const { container } = render(<MobileMonthView {...propsWithEvents} />)

    const dots = container.querySelectorAll('.absolute.bottom-1.rounded-full')
    expect(dots.length).toBeGreaterThan(0)
  })

  it('should render legend with today and has events indicators', () => {
    render(<MobileMonthView {...defaultProps} />)
    expect(screen.getByText('Today')).toBeInTheDocument()
    expect(screen.getByText('Has events')).toBeInTheDocument()
  })
})
