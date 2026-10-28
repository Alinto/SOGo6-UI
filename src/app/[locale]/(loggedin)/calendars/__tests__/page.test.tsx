import '@testing-library/jest-dom'
import { render } from '@testing-library/react'

const mockDispatch = jest.fn()

// Mock next-intl
jest.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string) => key,
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (
    selector: (state: {
      calendarUi: { createEventRequested: boolean }
    }) => unknown
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
    handleDeleteEvent: jest.fn(),
    handleEventDrop: jest.fn(),
    handleEventResize: jest.fn(),
    setTimezone: jest.fn(),
    calendarsData: [],
    defaultCalendar: undefined,
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

// Mock lazy calendar view (page imports calendar-view-lazy, not calendar-view directly)
jest.mock('@/features/calendars/components/calendar-view-lazy', () => ({
  LazyCalendarView: () => <div data-testid="calendar-view">Calendar View</div>,
}))

const mockDeleteCalendarEventUnwrap = jest.fn().mockResolvedValue(undefined)
const mockDeleteCalendarEvent = jest.fn(() => ({
  unwrap: mockDeleteCalendarEventUnwrap,
}))

jest.mock('@/features/calendars', () => {
  const actual = jest.requireActual<typeof import('@/features/calendars')>(
    '@/features/calendars'
  )
  return {
    ...actual,
    useGetCalendarEventByIdQuery: () => ({
      data: undefined,
      isFetching: false,
      isSuccess: false,
    }),
    useDeleteCalendarEventMutation: () => [
      mockDeleteCalendarEvent,
      { isLoading: false },
    ],
  }
})

import CalendarPage from '../page'

describe('CalendarPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('should render without crashing', () => {
    const { container } = render(<CalendarPage />)
    expect(container).toBeInTheDocument()
  })

  it('should render the page layout with correct classes', () => {
    const { container } = render(<CalendarPage />)
    const layout = container.querySelector(
      'div.flex.h-full.w-full.flex-col.overflow-hidden'
    )
    expect(layout).toBeInTheDocument()
    expect(layout).toHaveClass(
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

    const layout = container.querySelector(
      'div.flex.h-full.w-full.flex-col.overflow-hidden'
    )
    expect(layout?.children.length).toBe(2)

    const toolbarWrapper = layout?.children[0]
    expect(toolbarWrapper).toHaveClass('shrink-0')

    const viewWrapper = layout?.children[1]
    expect(viewWrapper).toHaveClass('flex-1', 'overflow-hidden')
  })
})
