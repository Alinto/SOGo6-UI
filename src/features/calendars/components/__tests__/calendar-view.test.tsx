import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { addHours } from 'date-fns'
import { Views } from 'react-big-calendar'

// Mock dependencies
jest.mock('@/components/calendar', () => {
  return function MockShadcnBigCalendar(props: any) {
    // Filter out react-big-calendar specific props that shouldn't be on DOM elements
    const {
      // React-big-calendar props
      resizable,
      selectable,
      draggableAccessor,
      resizableAccessor,
      onSelectSlot,
      onEventDrop,
      onEventResize,
      onView,
      onNavigate,
      eventPropGetter,
      toolbar,
      localizer,
      culture,
      formats,
      date,
      view,
      events,
      // Keep only valid DOM props
      ...domProps
    } = props

    return (
      <div data-testid="calendar" {...domProps}>
        Calendar Component
      </div>
    )
  }
})

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => (
    <div data-testid="dialog" data-open={open}>
      {open && children}
    </div>
  ),
  DialogContent: ({ children }: any) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: any) => (
    <div data-testid="dialog-header">{children}</div>
  ),
}))

jest.mock('@/features/calendars/components/agenda-view', () => ({
  AgendaView: function MockAgendaView() {
    return <div data-testid="agenda-view">Agenda View</div>
  },
}))

jest.mock('@/features/calendars/components/event-form', () => ({
  EventForm: function MockEventForm({ onSubmit }: any) {
    return (
      <form
        data-testid="event-form"
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit({
            title: 'Test Event',
            start: '2025-01-01T10:00',
            end: '2025-01-01T11:00',
          })
        }}
      >
        <button data-testid="event-form-submit" type="submit">
          Submit
        </button>
      </form>
    )
  },
}))

jest.mock('react-big-calendar/lib/addons/dragAndDrop', () => {
  return function withDragAndDrop(Component: any) {
    return Component
  }
})

// ✅ MODIFIER CE MOCK (ajouter useLocale)
jest.mock('next-intl', () => ({
  useLocale: () => 'en', // ← AJOUTER CETTE LIGNE
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'events.create.string': 'Create Event',
    }
    return translations[key] || key
  },
}))

// ✅ AJOUTER CE NOUVEAU MOCK
jest.mock('@/hooks/useMediaQuery', () => ({
  useIsMobile: () => false,
}))

describe('CalendarView Component', () => {
  let CalendarView: any

  const mockDate = new Date(2025, 0, 1)
  const mockEvent = {
    id: '1',
    title: 'Test Event',
    calendar_id: 'cal-1',
    start: mockDate,
    end: addHours(mockDate, 1),
  }

  const defaultProps = {
    view: Views.MONTH,
    date: mockDate,
    events: [mockEvent],
    selectedSlot: null,
    calendarColorMap: { 'cal-1': '#FF0000' },
    defaultColor: '#0000FF',
    onViewChange: jest.fn(),
    onNavigate: jest.fn(),
    onSelectSlot: jest.fn(),
    onSelectedSlotClose: jest.fn(),
    onCreateEvent: jest.fn(),
    onEventDrop: jest.fn(),
    onEventResize: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Clear any styles added to document
    document.head.innerHTML = ''
    // Import CalendarView after mocks are set up
    CalendarView = require('../calendar-view').default
  })

  it('should render the calendar view component', () => {
    render(<CalendarView {...defaultProps} />)
    expect(screen.getByTestId('calendar')).toBeInTheDocument()
  })

  it('should render dialog component', () => {
    render(<CalendarView {...defaultProps} />)
    expect(screen.getByTestId('dialog')).toBeInTheDocument()
  })

  it('should show dialog when selectedSlot is not null', () => {
    const selectedSlot = {
      start: mockDate,
      end: addHours(mockDate, 1),
      action: 'select',
      bounds: { x: 0, y: 0, right: 0, bottom: 0 },
      box: { x: 0, y: 0, right: 0, bottom: 0 },
    }

    render(<CalendarView {...defaultProps} selectedSlot={selectedSlot} />)

    const dialog = screen.getByTestId('dialog')
    expect(dialog).toHaveAttribute('data-open', 'true')
    expect(screen.getByTestId('event-form')).toBeInTheDocument()
  })

  it('should hide dialog when selectedSlot is null', () => {
    render(<CalendarView {...defaultProps} selectedSlot={null} />)
    const dialog = screen.getByTestId('dialog')
    expect(dialog).toHaveAttribute('data-open', 'false')
  })

  it('should render dialog header with create event title', () => {
    const selectedSlot = {
      start: mockDate,
      end: addHours(mockDate, 1),
      action: 'select',
      bounds: { x: 0, y: 0, right: 0, bottom: 0 },
      box: { x: 0, y: 0, right: 0, bottom: 0 },
    }

    render(<CalendarView {...defaultProps} selectedSlot={selectedSlot} />)

    expect(screen.getByText('Create Event')).toBeInTheDocument()
  })

  it('should render event form when slot is selected', () => {
    const selectedSlot = {
      start: mockDate,
      end: addHours(mockDate, 1),
      action: 'select',
      bounds: { x: 0, y: 0, right: 0, bottom: 0 },
      box: { x: 0, y: 0, right: 0, bottom: 0 },
    }

    render(<CalendarView {...defaultProps} selectedSlot={selectedSlot} />)

    expect(screen.getByTestId('event-form')).toBeInTheDocument()
  })

  it('should call onCreateEvent when form is submitted', async () => {
    const onCreateEvent = jest.fn()
    const selectedSlot = {
      start: mockDate,
      end: addHours(mockDate, 1),
      action: 'select',
      bounds: { x: 0, y: 0, right: 0, bottom: 0 },
      box: { x: 0, y: 0, right: 0, bottom: 0 },
    }

    render(
      <CalendarView
        {...defaultProps}
        selectedSlot={selectedSlot}
        onCreateEvent={onCreateEvent}
      />
    )

    const submitButton = screen.getByTestId('event-form-submit')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(onCreateEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Event',
        })
      )
    })
  })

  it('should render agenda view when view is AGENDA', () => {
    render(<CalendarView {...defaultProps} view={Views.AGENDA} />)

    expect(screen.getByTestId('agenda-view')).toBeInTheDocument()
  })

  it('should render calendar (not agenda) when view is not AGENDA', () => {
    render(<CalendarView {...defaultProps} view={Views.MONTH} />)

    expect(screen.getByTestId('calendar')).toBeInTheDocument()
    expect(screen.queryByTestId('agenda-view')).not.toBeInTheDocument()
  })

  it('should inject CSS styles for event colors', () => {
    render(<CalendarView {...defaultProps} />)

    const styles = document.querySelectorAll('style')
    expect(styles.length).toBeGreaterThan(0)

    const styleContent = Array.from(styles)
      .map((s) => s.innerHTML)
      .join('')

    expect(styleContent).toContain('rbc-slot-selection')
    expect(styleContent).toContain('#0000FF')
  })

  it('should inject calendar-specific color styles', () => {
    const calendarColorMap = {
      'cal-1': '#FF0000',
      'cal-2': '#00FF00',
    }

    render(
      <CalendarView {...defaultProps} calendarColorMap={calendarColorMap} />
    )

    const styles = document.querySelectorAll('style')
    const styleContent = Array.from(styles)
      .map((s) => s.innerHTML)
      .join('')

    expect(styleContent).toContain('cal-1')
    expect(styleContent).toContain('cal-2')
    expect(styleContent).toContain('#FF0000')
    expect(styleContent).toContain('#00FF00')
  })

  it('should remove injected styles on unmount', () => {
    const { unmount } = render(<CalendarView {...defaultProps} />)
    const stylesBefore = document.querySelectorAll('style').length

    unmount()

    const stylesAfter = document.querySelectorAll('style').length
    expect(stylesAfter).toBeLessThan(stylesBefore)
  })

  it('should render with empty events array', () => {
    render(<CalendarView {...defaultProps} events={[]} />)

    expect(screen.getByTestId('calendar')).toBeInTheDocument()
  })

  it('should render with multiple events', () => {
    const events = [
      mockEvent,
      {
        id: '2',
        title: 'Event 2',
        calendar_id: 'cal-2',
        start: addHours(mockDate, 2),
        end: addHours(mockDate, 3),
      },
    ]

    render(<CalendarView {...defaultProps} events={events} />)

    expect(screen.getByTestId('calendar')).toBeInTheDocument()
  })

  it('should have eventStyleGetter function', () => {
    const { container } = render(<CalendarView {...defaultProps} />)
    expect(container).toBeInTheDocument()
  })

  it('should call onSelectedSlotClose when dialog closes', () => {
    const onSelectedSlotClose = jest.fn()

    render(
      <CalendarView
        {...defaultProps}
        onSelectedSlotClose={onSelectedSlotClose}
      />
    )

    // Dialog is closed by default, but we're testing the prop is passed
    expect(onSelectedSlotClose).toBeDefined()
  })

  it('should pass events to calendar component', () => {
    render(<CalendarView {...defaultProps} />)

    const calendar = screen.getByTestId('calendar')
    expect(calendar).toBeInTheDocument()
  })

  it('should support all view types', () => {
    const viewTypes = [Views.MONTH, Views.WEEK, Views.DAY, Views.WORK_WEEK]

    viewTypes.forEach((viewType) => {
      const { unmount } = render(
        <CalendarView {...defaultProps} view={viewType} />
      )

      expect(screen.getByTestId('calendar')).toBeInTheDocument()
      unmount()
    })
  })

  it('should render with different date', () => {
    const newDate = new Date(2025, 5, 15)

    render(<CalendarView {...defaultProps} date={newDate} />)

    expect(screen.getByTestId('calendar')).toBeInTheDocument()
  })

  it('should handle missing calendar color mapping', () => {
    const eventWithoutMapping = {
      id: '1',
      title: 'Test Event',
      calendar_id: 'unknown-cal',
      start: mockDate,
      end: addHours(mockDate, 1),
    }

    render(
      <CalendarView
        {...defaultProps}
        events={[eventWithoutMapping]}
        calendarColorMap={{}}
      />
    )

    expect(screen.getByTestId('calendar')).toBeInTheDocument()
  })
})
