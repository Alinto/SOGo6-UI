import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import NotesContent from '../notes-content'

jest.mock('../feature-incoming', () => ({
  __esModule: true,
  default: () => <div data-testid="feature-incoming" />,
}))

describe('NotesContent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('renders FeatureIncoming', () => {
      render(<NotesContent />)
      expect(screen.getByTestId('feature-incoming')).toBeInTheDocument()
    })
  })

  describe('component stability', () => {
    it('renders consistently after rerender', () => {
      const { rerender } = render(<NotesContent />)
      rerender(<NotesContent />)
      expect(screen.getByTestId('feature-incoming')).toBeInTheDocument()
    })
  })
})
