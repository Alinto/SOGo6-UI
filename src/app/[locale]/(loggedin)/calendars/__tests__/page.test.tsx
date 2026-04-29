import { render } from '@testing-library/react'

const mockDispatch = jest.fn()

// Mock next-intl
jest.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string) => key,
}))

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (
    selector: (state: { calendarUi: { createEventRequested: boolean } }) => unknown
  ) =>
    selector({
      calendarUi: { createEventRequested: false },
    }),
}))

// Mock calendar hooks
jest.mock('@/features/calendars/hooks/useCalendarState', () => ({
  useCalendarState: () => ({
    view: 'month',
    date: new Date('2026-01-19'),
    events: [],
    selectedSlot: null,
    calendarColorMap: {},
    defaultColor: '#3b82f6',
    timezone: 'UTC',
    handleViewChange: jest.fn(),
    navigateToPrevious: jest.fn(),
    navigateToToday: jest.fn(),
    navigateToNext: jest.fn(),
    setSelectedSlot: jest.fn(),
    handleNavigate: jest.fn(),
    handleSelectSlot: jest.fn(),
    handleCreateEvent: jest.fn(),
    handleEventDrop: jest.fn(),
    handleEventResize: jest.fn(),
    setTimezone: jest.fn(),
  }),
}))

jest.mock('@/features/calendars/hooks/useCalendarVisibility', () => ({
  useCalendarVisibility: () => ({
    isCalendarVisible: jest.fn(() => true),
  }),
}))

// Mock useMediaQuery
jest.mock('@/hooks/useMediaQuery', () => ({
  useIsMobile: () => false,
}))

// Mock CalendarToolbar component
jest.mock('@/features/calendars/components/calendar-toolbar', () => ({
  CalendarToolbar: () => <div data-testid="calendar-toolbar">Toolbar</div>,
}))

// Mock CalendarView component
jest.mock('@/features/calendars/components/calendar-view', () => ({
  __esModule: true,
  default: () => <div data-testid="calendar-view">Calendar View</div>,
}))

import CalendarPage from '../page'

describe('CalendarPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('should render without crashing', () => {
    const { container } = render(<CalendarPage />)
    expect(container).toBeInTheDocument()
  })

  it('should render main element with correct classes', () => {
    const { container } = render(<CalendarPage />)
    const main = container.querySelector('main')
    expect(main).toBeInTheDocument()
    expect(main).toHaveClass(
      'flex',
      'h-full',
      'w-full',
      'flex-col',
      'overflow-hidden'
    )
  })

  it('should render CalendarToolbar', () => {
    const { getByTestId } = render(<CalendarPage />)
    expect(getByTestId('calendar-toolbar')).toBeInTheDocument()
  })

  it('should render CalendarView in flex-1 container', () => {
    const { getByTestId, container } = render(<CalendarPage />)
    expect(getByTestId('calendar-view')).toBeInTheDocument()

    // Verify it's wrapped in flex-1 container
    const viewContainer = container.querySelector('.flex-1')
    expect(viewContainer).toBeInTheDocument()
  })

  it('should have correct layout structure', () => {
    const { container } = render(<CalendarPage />)

    // Main should have exactly 2 children: toolbar wrapper + view wrapper
    const main = container.querySelector('main')
    expect(main?.children.length).toBe(2)

    // First child should be shrink-0 (toolbar)
    const toolbarWrapper = main?.children[0]
    expect(toolbarWrapper).toHaveClass('shrink-0')

    // Second child should be flex-1 (calendar view)
    const viewWrapper = main?.children[1]
    expect(viewWrapper).toHaveClass('flex-1', 'overflow-hidden')
  })
})
