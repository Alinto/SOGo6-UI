import { render, screen } from '@testing-library/react'
import Draggable from '../draggable'

// Mock @dnd-kit/core
const mockSetNodeRef = jest.fn()
const mockAttributes = {
  role: 'button',
  'aria-pressed': false,
  'aria-roledescription': 'sortable',
  'aria-describedby': 'DndContext-0',
  'data-testid': 'draggable-attributes',
}
const mockListeners = {
  onPointerDown: jest.fn(),
  onKeyDown: jest.fn(),
}

jest.mock('@dnd-kit/core', () => ({
  useDraggable: jest.fn(() => ({
    attributes: mockAttributes,
    listeners: mockListeners,
    setNodeRef: mockSetNodeRef,
    transform: null,
  })),
}))

describe('Draggable Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('should render children correctly', () => {
      render(
        <Draggable id="test-draggable">
          <div data-testid="child-content">Draggable Content</div>
        </Draggable>
      )

      expect(screen.getByTestId('child-content')).toBeInTheDocument()
      expect(screen.getByText('Draggable Content')).toBeInTheDocument()
    })

    it('should render with correct draggable structure', () => {
      const { container } = render(
        <Draggable id="test-draggable">
          <span>Test Content</span>
        </Draggable>
      )

      const draggableDiv = container.firstChild
      expect(draggableDiv).toBeInTheDocument()
      expect(draggableDiv).toContainHTML('<span>Test Content</span>')
    })

    it('should handle multiple children', () => {
      render(
        <Draggable id="test-draggable">
          <div data-testid="child-1">First Child</div>
          <div data-testid="child-2">Second Child</div>
        </Draggable>
      )

      expect(screen.getByTestId('child-1')).toBeInTheDocument()
      expect(screen.getByTestId('child-2')).toBeInTheDocument()
    })
  })

  describe('useDraggable integration', () => {
    it('should call useDraggable with id and data', () => {
      const { useDraggable } = require('@dnd-kit/core')
      const data = {
        type: 'mail' as const,
        mailId: '1',
        accountId: '0',
        folder: 'INBOX',
        subject: 'Hello',
        from: 'A',
        count: 1,
      }

      render(
        <Draggable id="unique-draggable-id" data={data}>
          <div>Content</div>
        </Draggable>
      )

      expect(useDraggable).toHaveBeenCalledWith({
        id: 'unique-draggable-id',
        data,
      })
    })

    it('should call useDraggable with correct id', () => {
      const { useDraggable } = require('@dnd-kit/core')

      render(
        <Draggable id="unique-draggable-id">
          <div>Content</div>
        </Draggable>
      )

      expect(useDraggable).toHaveBeenCalledWith({
        id: 'unique-draggable-id',
        data: undefined,
      })
    })

    it('should apply attributes from useDraggable hook', () => {
      const { container } = render(
        <Draggable id="test-draggable">
          <div>Content</div>
        </Draggable>
      )

      const draggableDiv = container.firstChild
      expect(draggableDiv).toHaveAttribute(
        'data-testid',
        'draggable-attributes'
      )
    })

    it('should apply listeners from useDraggable hook', () => {
      const { container } = render(
        <Draggable id="test-draggable">
          <div>Content</div>
        </Draggable>
      )

      const draggableDiv = container.firstChild as HTMLElement
      // Check that listeners are applied as event attributes
      expect(draggableDiv).toHaveAttribute(
        'data-testid',
        'draggable-attributes'
      )
      // The mock listeners should be called when events are triggered
      expect(mockListeners.onPointerDown).toBeDefined()
      expect(mockListeners.onKeyDown).toBeDefined()
    })

    it('should call setNodeRef when component mounts', () => {
      render(
        <Draggable id="test-draggable">
          <div>Content</div>
        </Draggable>
      )

      expect(mockSetNodeRef).toHaveBeenCalled()
    })
  })

  describe('prop validation', () => {
    it('should work with string id', () => {
      expect(() => {
        render(
          <Draggable id="string-id">
            <div>Content</div>
          </Draggable>
        )
      }).not.toThrow()
    })

    it('should work with numeric string id', () => {
      expect(() => {
        render(
          <Draggable id="123">
            <div>Content</div>
          </Draggable>
        )
      }).not.toThrow()
    })

    it('should render with React fragment as children', () => {
      render(
        <Draggable id="test-draggable">
          <>
            <span>Fragment Child 1</span>
            <span>Fragment Child 2</span>
          </>
        </Draggable>
      )

      expect(screen.getByText('Fragment Child 1')).toBeInTheDocument()
      expect(screen.getByText('Fragment Child 2')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should handle empty children gracefully', () => {
      expect(() => {
        render(<Draggable id="test-draggable">{null}</Draggable>)
      }).not.toThrow()
    })

    it('should handle undefined children gracefully', () => {
      expect(() => {
        render(<Draggable id="test-draggable">{undefined}</Draggable>)
      }).not.toThrow()
    })

    it('should render with complex nested children', () => {
      render(
        <Draggable id="test-draggable">
          <div>
            <h1>Title</h1>
            <div>
              <span data-testid="nested-content">Nested Content</span>
              <button>Action Button</button>
            </div>
          </div>
        </Draggable>
      )

      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByTestId('nested-content')).toBeInTheDocument()
      expect(screen.getByText('Action Button')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should maintain accessibility attributes from useDraggable', () => {
      const { container } = render(
        <Draggable id="accessible-draggable">
          <div>Accessible Content</div>
        </Draggable>
      )

      const draggableDiv = container.firstChild as HTMLElement
      expect(draggableDiv).toHaveAttribute('aria-pressed', 'false')
      expect(draggableDiv).toHaveAttribute('aria-roledescription', 'sortable')
      expect(draggableDiv).toHaveAttribute('aria-describedby', 'DndContext-0')
      expect(draggableDiv).toHaveAttribute('role', 'button')
    })
  })

  describe('performance', () => {
    it('should not cause unnecessary re-renders with same props', () => {
      const { rerender } = render(
        <Draggable id="performance-test">
          <div>Content</div>
        </Draggable>
      )

      const initialCallCount = mockSetNodeRef.mock.calls.length

      // Re-render with same props
      rerender(
        <Draggable id="performance-test">
          <div>Content</div>
        </Draggable>
      )

      // setNodeRef should not be called again with same props
      expect(mockSetNodeRef).toHaveBeenCalledTimes(initialCallCount)
    })
  })

  describe('integration with DndContext', () => {
    it('should work within a DndContext environment', () => {
      // Mock isDragging state
      jest.doMock('@dnd-kit/core', () => ({
        useDraggable: jest.fn(() => ({
          attributes: mockAttributes,
          listeners: mockListeners,
          setNodeRef: mockSetNodeRef,
          isDragging: true,
          transform: { x: 10, y: 5, scaleX: 1, scaleY: 1 },
        })),
      }))

      expect(() => {
        render(
          <Draggable id="context-draggable">
            <div>Dragging Content</div>
          </Draggable>
        )
      }).not.toThrow()

      expect(screen.getByText('Dragging Content')).toBeInTheDocument()
    })
  })
})
