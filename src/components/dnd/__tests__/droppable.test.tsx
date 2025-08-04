import { render, screen } from '@testing-library/react'
import Droppable from '../droppable'

// Mock next/navigation
const mockUseParams = jest.fn()

jest.mock('next/navigation', () => ({
  useParams: () => mockUseParams(),
}))

// Mock @dnd-kit/core
const mockSetNodeRef = jest.fn()

jest.mock('@dnd-kit/core', () => ({
  useDroppable: jest.fn(() => ({
    isOver: false,
    active: null,
    setNodeRef: mockSetNodeRef,
  })),
}))

describe('Droppable Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseParams.mockReturnValue({ book_id: 'test-book-id' })
  })

  describe('basic rendering', () => {
    it('should render children correctly', () => {
      render(
        <Droppable id="test-droppable">
          <div data-testid="child-content">Droppable Content</div>
        </Droppable>
      )

      expect(screen.getByTestId('child-content')).toBeInTheDocument()
      expect(screen.getByText('Droppable Content')).toBeInTheDocument()
    })

    it('should render with correct droppable structure', () => {
      const { container } = render(
        <Droppable id="test-droppable">
          <span>Test Content</span>
        </Droppable>
      )

      const droppableDiv = container.firstChild
      expect(droppableDiv).toBeInTheDocument()
      expect(droppableDiv).toContainHTML('<span>Test Content</span>')
    })

    it('should handle multiple children', () => {
      render(
        <Droppable id="test-droppable">
          <div data-testid="child-1">First Child</div>
          <div data-testid="child-2">Second Child</div>
        </Droppable>
      )

      expect(screen.getByTestId('child-1')).toBeInTheDocument()
      expect(screen.getByTestId('child-2')).toBeInTheDocument()
    })
  })

  describe('useDroppable integration', () => {
    it('should call useDroppable with correct id', () => {
      const { useDroppable } = require('@dnd-kit/core')

      render(
        <Droppable id="unique-droppable-id">
          <div>Content</div>
        </Droppable>
      )

      expect(useDroppable).toHaveBeenCalledWith({
        id: 'unique-droppable-id',
      })
    })

    it('should call setNodeRef when component mounts', () => {
      render(
        <Droppable id="test-droppable">
          <div>Content</div>
        </Droppable>
      )

      expect(mockSetNodeRef).toHaveBeenCalled()
    })
  })

  describe('styling based on drag state', () => {
    it('should apply default styling when no active drag', () => {
      const { useDroppable } = require('@dnd-kit/core')
      useDroppable.mockReturnValue({
        isOver: false,
        active: null,
        setNodeRef: mockSetNodeRef,
      })

      const { container } = render(
        <Droppable id="test-droppable">
          <div>Content</div>
        </Droppable>
      )

      const droppableDiv = container.firstChild
      expect(droppableDiv).not.toHaveClass('bg-primary/50')
      expect(droppableDiv).not.toHaveClass('hover:bg-primary/70')
      expect(droppableDiv).not.toHaveClass('hover:cursor-no-drop')
    })

    it('should apply active styling when item is being dragged and book_id differs from id', () => {
      const { useDroppable } = require('@dnd-kit/core')
      useDroppable.mockReturnValue({
        isOver: false,
        active: { id: 'some-item' },
        setNodeRef: mockSetNodeRef,
      })

      mockUseParams.mockReturnValue({ book_id: 'different-book-id' })

      const { container } = render(
        <Droppable id="test-droppable">
          <div>Content</div>
        </Droppable>
      )

      const droppableDiv = container.firstChild
      expect(droppableDiv).toHaveClass('bg-primary/50', 'rounded-xl')
    })

    it('should apply no-drop cursor when item is being dragged and book_id matches id', () => {
      const { useDroppable } = require('@dnd-kit/core')
      useDroppable.mockReturnValue({
        isOver: false,
        active: { id: 'some-item' },
        setNodeRef: mockSetNodeRef,
      })

      mockUseParams.mockReturnValue({ book_id: 'test-droppable' })

      const { container } = render(
        <Droppable id="test-droppable">
          <div>Content</div>
        </Droppable>
      )

      const droppableDiv = container.firstChild
      expect(droppableDiv).toHaveClass('hover:cursor-no-drop')
      expect(droppableDiv).not.toHaveClass('bg-primary/50')
    })

    it('should apply over styling when item is hovering over drop zone', () => {
      const { useDroppable } = require('@dnd-kit/core')
      useDroppable.mockReturnValue({
        isOver: true,
        active: { id: 'some-item' },
        setNodeRef: mockSetNodeRef,
      })

      const { container } = render(
        <Droppable id="test-droppable">
          <div>Content</div>
        </Droppable>
      )

      const droppableDiv = container.firstChild
      expect(droppableDiv).toHaveClass('hover:bg-primary/70')
    })

    it('should apply both active and over styling when both conditions are met', () => {
      const { useDroppable } = require('@dnd-kit/core')
      useDroppable.mockReturnValue({
        isOver: true,
        active: { id: 'some-item' },
        setNodeRef: mockSetNodeRef,
      })

      mockUseParams.mockReturnValue({ book_id: 'different-book-id' })

      const { container } = render(
        <Droppable id="test-droppable">
          <div>Content</div>
        </Droppable>
      )

      const droppableDiv = container.firstChild
      expect(droppableDiv).toHaveClass(
        'bg-primary/50',
        'rounded-xl',
        'hover:bg-primary/70'
      )
    })
  })

  describe('book_id parameter handling', () => {
    it('should handle missing book_id parameter', () => {
      mockUseParams.mockReturnValue({})

      const { useDroppable } = require('@dnd-kit/core')
      useDroppable.mockReturnValue({
        isOver: false,
        active: { id: 'some-item' },
        setNodeRef: mockSetNodeRef,
      })

      expect(() => {
        render(
          <Droppable id="test-droppable">
            <div>Content</div>
          </Droppable>
        )
      }).not.toThrow()
    })

    it('should handle null book_id parameter', () => {
      mockUseParams.mockReturnValue({ book_id: null })

      const { useDroppable } = require('@dnd-kit/core')
      useDroppable.mockReturnValue({
        isOver: false,
        active: { id: 'some-item' },
        setNodeRef: mockSetNodeRef,
      })

      const { container } = render(
        <Droppable id="test-droppable">
          <div>Content</div>
        </Droppable>
      )

      const droppableDiv = container.firstChild
      expect(droppableDiv).toHaveClass('bg-primary/50', 'rounded-xl')
    })

    it('should handle undefined book_id parameter', () => {
      mockUseParams.mockReturnValue({ book_id: undefined })

      const { useDroppable } = require('@dnd-kit/core')
      useDroppable.mockReturnValue({
        isOver: false,
        active: { id: 'some-item' },
        setNodeRef: mockSetNodeRef,
      })

      const { container } = render(
        <Droppable id="test-droppable">
          <div>Content</div>
        </Droppable>
      )

      const droppableDiv = container.firstChild
      expect(droppableDiv).toHaveClass('bg-primary/50', 'rounded-xl')
    })
  })

  describe('prop validation', () => {
    it('should work with string id', () => {
      expect(() => {
        render(
          <Droppable id="string-id">
            <div>Content</div>
          </Droppable>
        )
      }).not.toThrow()
    })

    it('should work with numeric string id', () => {
      expect(() => {
        render(
          <Droppable id="123">
            <div>Content</div>
          </Droppable>
        )
      }).not.toThrow()
    })

    it('should render with React fragment as children', () => {
      render(
        <Droppable id="test-droppable">
          <>
            <span>Fragment Child 1</span>
            <span>Fragment Child 2</span>
          </>
        </Droppable>
      )

      expect(screen.getByText('Fragment Child 1')).toBeInTheDocument()
      expect(screen.getByText('Fragment Child 2')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should handle empty children gracefully', () => {
      expect(() => {
        render(<Droppable id="test-droppable">{null}</Droppable>)
      }).not.toThrow()
    })

    it('should handle undefined children gracefully', () => {
      expect(() => {
        render(<Droppable id="test-droppable">{undefined}</Droppable>)
      }).not.toThrow()
    })

    it('should render with complex nested children', () => {
      render(
        <Droppable id="test-droppable">
          <div>
            <h1>Drop Zone Title</h1>
            <div>
              <span data-testid="nested-content">Nested Drop Area</span>
              <button>Drop Action</button>
            </div>
          </div>
        </Droppable>
      )

      expect(screen.getByText('Drop Zone Title')).toBeInTheDocument()
      expect(screen.getByTestId('nested-content')).toBeInTheDocument()
      expect(screen.getByText('Drop Action')).toBeInTheDocument()
    })
  })

  describe('performance', () => {
    it('should not cause unnecessary re-renders with same props', () => {
      const { rerender } = render(
        <Droppable id="performance-test">
          <div>Content</div>
        </Droppable>
      )

      const initialCallCount = mockSetNodeRef.mock.calls.length

      // Re-render with same props
      rerender(
        <Droppable id="performance-test">
          <div>Content</div>
        </Droppable>
      )

      // setNodeRef should not be called again with same props
      expect(mockSetNodeRef).toHaveBeenCalledTimes(initialCallCount)
    })
  })

  describe('integration scenarios', () => {
    it('should work within address book context', () => {
      mockUseParams.mockReturnValue({ book_id: 'address-book-123' })

      const { useDroppable } = require('@dnd-kit/core')
      useDroppable.mockReturnValue({
        isOver: false,
        active: { id: 'contact-item' },
        setNodeRef: mockSetNodeRef,
      })

      expect(() => {
        render(
          <Droppable id="different-book-456">
            <div>Address Book Drop Zone</div>
          </Droppable>
        )
      }).not.toThrow()

      expect(screen.getByText('Address Book Drop Zone')).toBeInTheDocument()
    })

    it('should handle rapid state changes', () => {
      const { useDroppable } = require('@dnd-kit/core')
      const { rerender } = render(
        <Droppable id="test-droppable">
          <div>Content</div>
        </Droppable>
      )

      // Simulate rapid state changes
      useDroppable.mockReturnValue({
        isOver: true,
        active: { id: 'item1' },
        setNodeRef: mockSetNodeRef,
      })

      rerender(
        <Droppable id="test-droppable">
          <div>Content</div>
        </Droppable>
      )

      useDroppable.mockReturnValue({
        isOver: false,
        active: null,
        setNodeRef: mockSetNodeRef,
      })

      rerender(
        <Droppable id="test-droppable">
          <div>Content</div>
        </Droppable>
      )

      expect(screen.getByText('Content')).toBeInTheDocument()
    })
  })

  describe('CSS class combinations', () => {
    it('should handle complex className combinations correctly', () => {
      const { useDroppable } = require('@dnd-kit/core')

      // Test scenario: active item, different book_id, and isOver
      useDroppable.mockReturnValue({
        isOver: true,
        active: { id: 'some-item' },
        setNodeRef: mockSetNodeRef,
      })

      mockUseParams.mockReturnValue({ book_id: 'book-1' })

      const { container } = render(
        <Droppable id="book-2">
          <div>Content</div>
        </Droppable>
      )

      const droppableDiv = container.firstChild as HTMLElement
      const classNames = droppableDiv.className

      expect(classNames).toContain('bg-primary/50')
      expect(classNames).toContain('rounded-xl')
      expect(classNames).toContain('hover:bg-primary/70')
      expect(classNames).not.toContain('hover:cursor-no-drop')
    })

    it('should handle no-drop scenario with isOver', () => {
      const { useDroppable } = require('@dnd-kit/core')

      // Test scenario: active item, same book_id (no drop), but isOver
      useDroppable.mockReturnValue({
        isOver: true,
        active: { id: 'some-item' },
        setNodeRef: mockSetNodeRef,
      })

      mockUseParams.mockReturnValue({ book_id: 'same-book' })

      const { container } = render(
        <Droppable id="same-book">
          <div>Content</div>
        </Droppable>
      )

      const droppableDiv = container.firstChild as HTMLElement
      const classNames = droppableDiv.className

      expect(classNames).toContain('hover:cursor-no-drop')
      expect(classNames).toContain('hover:bg-primary/70')
      expect(classNames).not.toContain('bg-primary/50')
    })
  })
})
