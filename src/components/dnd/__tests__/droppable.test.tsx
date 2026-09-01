import { render, screen } from '@testing-library/react'
import Droppable from '../droppable'

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
  })

  it('renders children', () => {
    render(
      <Droppable id="folder:INBOX">
        <div data-testid="child-content">Droppable Content</div>
      </Droppable>
    )

    expect(screen.getByTestId('child-content')).toBeInTheDocument()
  })

  it('calls useDroppable with id, data and disabled', () => {
    const { useDroppable } = require('@dnd-kit/core')
    const data = { type: 'folder' as const, folderPath: 'INBOX' }

    render(
      <Droppable id="folder:INBOX" data={data} disabled>
        <div>Content</div>
      </Droppable>
    )

    expect(useDroppable).toHaveBeenCalledWith({
      id: 'folder:INBOX',
      data,
      disabled: true,
    })
  })

  it('applies isOverClassName only when hovering a enabled target', () => {
    const { useDroppable } = require('@dnd-kit/core')
    useDroppable.mockReturnValue({
      isOver: true,
      active: { id: 'mail:1' },
      setNodeRef: mockSetNodeRef,
    })

    const { container, rerender } = render(
      <Droppable
        id="folder:Archive"
        isOverClassName="ring-2"
        className="rounded"
      >
        <div>Content</div>
      </Droppable>
    )

    expect(container.firstChild).toHaveClass('ring-2', 'rounded')
    expect(container.firstChild).toHaveAttribute('data-over', 'true')

    useDroppable.mockReturnValue({
      isOver: true,
      active: { id: 'mail:1' },
      setNodeRef: mockSetNodeRef,
    })
    rerender(
      <Droppable
        id="folder:Archive"
        disabled
        isOverClassName="ring-2"
        className="rounded"
      >
        <div>Content</div>
      </Droppable>
    )

    expect(container.firstChild).not.toHaveClass('ring-2')
    expect(container.firstChild).not.toHaveAttribute('data-over')
  })

  it('calls setNodeRef on mount', () => {
    render(
      <Droppable id="folder:INBOX">
        <div>Content</div>
      </Droppable>
    )

    expect(mockSetNodeRef).toHaveBeenCalled()
  })
})
