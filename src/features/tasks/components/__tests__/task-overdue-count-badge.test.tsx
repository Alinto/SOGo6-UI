import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

import {
  tasksOverdueCountBadgeClassName,
  tasksOverdueCountBadgeLabelClassName,
} from '../sidebar/sidebar-menu-button-classes'
import TaskOverdueCountBadge from '../task-overdue-count-badge'

describe('TaskOverdueCountBadge', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('renders the overdue count when positive', () => {
      render(<TaskOverdueCountBadge count={3} />)
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('renders double-digit counts', () => {
      render(<TaskOverdueCountBadge count={12} />)
      expect(screen.getByText('12')).toBeInTheDocument()
    })

    it('returns null when count is zero', () => {
      const { container } = render(<TaskOverdueCountBadge count={0} />)
      expect(container).toBeEmptyDOMElement()
    })

    it('returns null when count is negative', () => {
      const { container } = render(<TaskOverdueCountBadge count={-1} />)
      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('accessibility', () => {
    it('marks the badge as decorative', () => {
      render(<TaskOverdueCountBadge count={2} />)
      const badge = screen.getByText('2').parentElement
      expect(badge).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('custom styling', () => {
    it('applies overdue badge class names', () => {
      render(<TaskOverdueCountBadge count={5} />)
      const label = screen.getByText('5')
      expect(label).toHaveClass(
        ...tasksOverdueCountBadgeLabelClassName.split(' ')
      )
      expect(label.parentElement).toHaveClass(
        ...tasksOverdueCountBadgeClassName.split(' ')
      )
    })
  })

  describe('component stability', () => {
    it('updates the displayed count on re-render', () => {
      const { rerender } = render(<TaskOverdueCountBadge count={1} />)
      expect(screen.getByText('1')).toBeInTheDocument()

      rerender(<TaskOverdueCountBadge count={4} />)
      expect(screen.getByText('4')).toBeInTheDocument()
      expect(screen.queryByText('1')).not.toBeInTheDocument()
    })

    it('unmounts when count drops to zero', () => {
      const { rerender, container } = render(<TaskOverdueCountBadge count={2} />)
      expect(screen.getByText('2')).toBeInTheDocument()

      rerender(<TaskOverdueCountBadge count={0} />)
      expect(container).toBeEmptyDOMElement()
    })
  })
})
