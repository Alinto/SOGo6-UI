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
      'createEvent.string': 'Create Event',
      'selectView.string': 'Select View',
      'views.month.string': 'Month',
      'views.week.string': 'Week',
      'views.day.string': 'Day',
      'views.schedule.string': 'Schedule',
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
  Plus: jest.fn(() => <span data-testid="plus">+</span>),
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
    timezone: 'UTC',
    onTimezoneChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the toolbar with all elements', () => {
    render(<CalendarToolbar {...mockProps} />)

    expect(screen.queryByText('Create Event')).not.toBeInTheDocument()
    expect(screen.getByText('Today')).toBeInTheDocument()
    expect(screen.getByTestId('chevron-left')).toBeInTheDocument()
    expect(screen.getByTestId('chevron-right')).toBeInTheDocument()
    expect(screen.getByTestId('timezone-select')).toBeInTheDocument()
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

  it('should call onNavigateToday when today button is clicked', () => {
    render(<CalendarToolbar {...mockProps} />)

    const todayButton = screen.getByText('Today').closest('button')
    fireEvent.click(todayButton!)

    expect(mockProps.onNavigateToday).toHaveBeenCalledTimes(1)
  })

  it('should call onNavigateNext when next button is clicked', () => {
    render(<CalendarToolbar {...mockProps} />)

    const buttons = screen.getAllByRole('button')
    const nextButton = buttons.find((btn) =>
      btn.querySelector('[data-testid="chevron-right"]')
    )
    fireEvent.click(nextButton!)

    expect(mockProps.onNavigateNext).toHaveBeenCalledTimes(1)
  })

  it('should display month name when view is MONTH', () => {
    render(<CalendarToolbar {...mockProps} view={Views.MONTH} />)

    expect(screen.getByText(/January 2024/i)).toBeInTheDocument()
  })

  it('should display week range when view is WEEK', () => {
    render(<CalendarToolbar {...mockProps} view={Views.WEEK} />)

    // Week view shows month range
    expect(screen.getByText(/January 2024/i)).toBeInTheDocument()
  })

  it('should display day when view is DAY', () => {
    render(<CalendarToolbar {...mockProps} view={Views.DAY} />)

    expect(screen.getByText(/15 Jan/i)).toBeInTheDocument()
  })

  it('should call onTimezoneChange when timezone is changed', () => {
    render(<CalendarToolbar {...mockProps} />)

    const timezoneSelect = screen.getByTestId('timezone-select')
    fireEvent.change(timezoneSelect, { target: { value: 'America/New_York' } })

    expect(mockProps.onTimezoneChange).toHaveBeenCalledWith('America/New_York')
  })

  it('should apply custom className when provided', () => {
    const { container } = render(
      <CalendarToolbar {...mockProps} className="custom-class" />
    )

    const toolbar = container.firstChild as HTMLElement
    expect(toolbar.className).toContain('custom-class')
  })

  it('should render with correct view value in select', () => {
    render(<CalendarToolbar {...mockProps} view={Views.WEEK} />)

    const select = screen.getByTestId('select')
    expect(select).toHaveAttribute('data-value', Views.WEEK)
  })
})
