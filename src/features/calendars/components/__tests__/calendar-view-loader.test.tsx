import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

import { CalendarViewLoader } from '../calendar-view-loader'

describe('CalendarViewLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('should render the loader container', () => {
      render(<CalendarViewLoader />)

      expect(screen.getByTestId('calendar-view-loader')).toBeInTheDocument()
    })
  })

  describe('configuration', () => {
    it('should mark the container as busy while loading', () => {
      render(<CalendarViewLoader />)

      expect(screen.getByTestId('calendar-view-loader')).toHaveAttribute(
        'aria-busy',
        'true'
      )
    })
  })

  describe('custom styling', () => {
    it('should apply layout and spinner classes', () => {
      render(<CalendarViewLoader />)

      const container = screen.getByTestId('calendar-view-loader')
      expect(container).toHaveClass('flex', 'h-full', 'min-h-[200px]', 'flex-1')

      const spinner = container.querySelector('div[class*="animate-spin"]')
      expect(spinner).toHaveClass('border-primary', 'h-10', 'w-10', 'rounded-full')
    })
  })

  describe('component stability', () => {
    it('should render consistently across re-renders', () => {
      const { rerender } = render(<CalendarViewLoader />)
      rerender(<CalendarViewLoader />)

      expect(screen.getByTestId('calendar-view-loader')).toBeInTheDocument()
    })
  })
})
