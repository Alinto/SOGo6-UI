import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

jest.mock('@/components/dynamic-imports', () => ({
  createDynamicComponent: jest.fn(
    () =>
      function LazyCalendarViewStub() {
        return <div data-testid="lazy-calendar-view-stub">Calendar View</div>
      }
  ),
}))

import { LazyCalendarView } from '../calendar-view-lazy'

describe('calendar-view-lazy', () => {
  describe('basic rendering', () => {
    it('should export LazyCalendarView as a component', () => {
      expect(LazyCalendarView).toBeDefined()
      expect(typeof LazyCalendarView).toBe('function')
    })

    it('should render the lazy calendar view stub', () => {
      render(
        <LazyCalendarView
          view="month"
          date={new Date()}
          events={[]}
          selectedSlot={null}
          calendarColorMap={{}}
          defaultColor="#3174ad"
          calendars={[]}
          onViewChange={jest.fn()}
          onNavigate={jest.fn()}
          onSelectSlot={jest.fn()}
          onSelectedSlotClose={jest.fn()}
          onEventDrop={jest.fn()}
          onEventResize={jest.fn()}
        />
      )

      expect(screen.getByTestId('lazy-calendar-view-stub')).toBeInTheDocument()
    })
  })

  describe('component stability', () => {
    it('should render consistently across re-renders', () => {
      const props = {
        view: 'month' as const,
        date: new Date(),
        events: [],
        selectedSlot: null,
        calendarColorMap: {},
        defaultColor: '#3174ad',
        calendars: [],
        onViewChange: jest.fn(),
        onNavigate: jest.fn(),
        onSelectSlot: jest.fn(),
        onSelectedSlotClose: jest.fn(),
        onEventDrop: jest.fn(),
        onEventResize: jest.fn(),
      }

      const { rerender } = render(<LazyCalendarView {...props} />)
      rerender(<LazyCalendarView {...props} />)

      expect(screen.getByTestId('lazy-calendar-view-stub')).toBeInTheDocument()
    })
  })
})
