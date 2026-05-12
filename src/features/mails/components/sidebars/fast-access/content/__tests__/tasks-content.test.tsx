import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import TasksContent from '../tasks-content'

jest.mock('../feature-incoming', () => ({
  __esModule: true,
  default: () => <div data-testid="feature-incoming" />,
}))

describe('TasksContent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('renders FeatureIncoming', () => {
      render(<TasksContent />)
      expect(screen.getByTestId('feature-incoming')).toBeInTheDocument()
    })
  })

  describe('component stability', () => {
    it('renders consistently after rerender', () => {
      const { rerender } = render(<TasksContent />)
      rerender(<TasksContent />)
      expect(screen.getByTestId('feature-incoming')).toBeInTheDocument()
    })
  })
})
