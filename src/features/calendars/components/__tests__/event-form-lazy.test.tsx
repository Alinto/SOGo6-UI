import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

jest.mock('@/components/dynamic-imports', () => ({
  createDynamicComponent: jest.fn(
    () =>
      function LazyEventFormStub() {
        return <div data-testid="lazy-event-form-stub">Event Form</div>
      }
  ),
}))

import { LazyEventForm } from '../event-form-lazy'

describe('event-form-lazy', () => {
  describe('basic rendering', () => {
    it('should export LazyEventForm as a component', () => {
      expect(LazyEventForm).toBeDefined()
      expect(typeof LazyEventForm).toBe('function')
    })

    it('should render the lazy event form stub', () => {
      render(<LazyEventForm calendarKey="cal-1" onCancel={jest.fn()} />)

      expect(screen.getByTestId('lazy-event-form-stub')).toBeInTheDocument()
    })
  })

  describe('component stability', () => {
    it('should render consistently across re-renders', () => {
      const { rerender } = render(
        <LazyEventForm calendarKey="cal-1" onCancel={jest.fn()} />
      )
      rerender(<LazyEventForm calendarKey="cal-1" onCancel={jest.fn()} />)

      expect(screen.getByTestId('lazy-event-form-stub')).toBeInTheDocument()
    })
  })
})
