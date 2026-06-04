import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import { Views } from 'react-big-calendar'
import { CalendarToolbar } from '../calendar-toolbar'

jest.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'today.string': 'Today',
      'previous.string': 'Previous',
      'next.string': 'Next',
      'selectView.string': 'Select View',
      'views.month.string': 'Month',
      'views.week.string': 'Week',
      'views.day.string': 'Day',
      'views.schedule.string': 'Schedule',
      'pickDate.string': 'Pick a date',
    }
    return translations[key] || key
  },
}))

jest.mock('@/components/ui/button', () => ({
  Button: jest.fn(({ children, onClick, ...props }) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  )),
}))

jest.mock('@/components/ui/select', () => ({
  Select: jest.fn(({ children, value, onValueChange }) => (
    <div
      data-testid="select"
      data-value={value}
      onClick={() => onValueChange?.(Views.WEEK)}
    >
      {children}
    </div>
  )),
  SelectTrigger: jest.fn(({ children }) => <div>{children}</div>),
  SelectValue: jest.fn(() => <div>Select value</div>),
  SelectContent: jest.fn(({ children }) => <div>{children}</div>),
  SelectItem: jest.fn(({ children, value }) => (
    <div data-value={value}>{children}</div>
  )),
}))

jest.mock('@/components/ui/dates/timezones', () => ({
  TimezoneSelect: jest.fn(({ value, onValueChange }) => (
    <select
      data-testid="timezone-select"
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
    >
      <option value="UTC">UTC</option>
      <option value="America/New_York">America/New_York</option>
    </select>
  )),
}))

jest.mock('lucide-react', () => ({
  ChevronLeft: jest.fn(() => <span data-testid="chevron-left">←</span>),
  ChevronRight: jest.fn(() => <span data-testid="chevron-right">→</span>),
  CalendarIcon: jest.fn(() => <span data-testid="calendar-icon">📅</span>),
}))

jest.mock('../calendar-day-date-picker', () => ({
  CalendarDayDatePicker: ({
    label,
    onDateSelect,
  }: {
    label: React.ReactNode
    onDateSelect: (date: Date) => void
  }) => (
    <div data-testid="day-date-picker">
      {label}
      <button
        type="button"
        aria-label="Pick a date"
        onClick={() => onDateSelect(new Date('2024-02-01'))}
      >
        pick
      </button>
    </div>
  ),
}))

jest.mock('@/hooks/useMediaQuery', () => ({
  useIsMobile: () => false,
}))

describe('CalendarToolbar', () => {
  const mockProps = {
    view: Views.MONTH,
    date: new Date('2024-01-15T10:00:00Z'),
    onViewChange: jest.fn(),
    onNavigatePrevious: jest.fn(),
    onNavigateToday: jest.fn(),
    onNavigateNext: jest.fn(),
    onNavigateDate: jest.fn(),
    timezone: 'UTC',
    onTimezoneChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render navigation and timezone controls', () => {
    render(<CalendarToolbar {...mockProps} />)

    expect(screen.getByText('Today')).toBeInTheDocument()
    expect(screen.getByTestId('chevron-left')).toBeInTheDocument()
    expect(screen.getByTestId('chevron-right')).toBeInTheDocument()
    expect(screen.getByTestId('timezone-select')).toBeInTheDocument()
    expect(
      screen.queryByPlaceholderText('Search events...')
    ).not.toBeInTheDocument()
  })

  it('should call onNavigatePrevious when previous button is clicked', () => {
    render(<CalendarToolbar {...mockProps} />)

    const buttons = screen.getAllByRole('button')
    const prevButton = buttons.find((btn) =>
      btn.querySelector('[data-testid="chevron-left"]')
    )
    fireEvent.click(prevButton!)

    expect(mockProps.onNavigatePrevious).toHaveBeenCalledTimes(1)
  })

  it('should display month name when view is MONTH', () => {
    render(<CalendarToolbar {...mockProps} view={Views.MONTH} />)

    expect(screen.getByText(/January 2024/i)).toBeInTheDocument()
  })

  it('should show day date picker in day view and navigate on select', () => {
    render(<CalendarToolbar {...mockProps} view={Views.DAY} />)

    expect(screen.getByTestId('day-date-picker')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Pick a date' }))
    expect(mockProps.onNavigateDate).toHaveBeenCalledWith(
      new Date('2024-02-01')
    )
  })
})
