import { DndContext } from '@dnd-kit/core'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import SortableContainer from '../sortable-container'

// filepath: src/components/dnd/sortable-container.test.tsx

jest.mock('@dnd-kit/core', () => ({
  ...jest.requireActual('@dnd-kit/core'),
  DndContext: jest.fn(({ children }) => <div>{children}</div>),
  useSensor: jest.fn(),
  useSensors: jest.fn(),
  PointerSensor: jest.fn(),
  KeyboardSensor: jest.fn(),
}))

jest.mock('@dnd-kit/sortable', () => ({
  ...jest.requireActual('@dnd-kit/sortable'),
  SortableContext: jest.fn(({ children }) => <div>{children}</div>),
  verticalListSortingStrategy: jest.fn(),
  sortableKeyboardCoordinates: jest.fn(),
}))

describe('SortableContainer Component', () => {
  const mockSetItem = jest.fn()
  const items = ['item1', 'item2', 'item3']

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the SortableContainer with children', () => {
    render(
      <SortableContainer items={items} setItem={mockSetItem}>
        <div>Child Element</div>
      </SortableContainer>
    )

    expect(screen.getByText('Child Element')).toBeInTheDocument()
  })

  it('calls setItem with correct indices on drag end', () => {
    const mockEvent = {
      active: { id: 'item1' },
      over: { id: 'item2' },
    }

    render(
      <SortableContainer items={items} setItem={mockSetItem}>
        <div>Child Element</div>
      </SortableContainer>
    )

    const dndContextProps = DndContext.mock.calls[0][0]
    dndContextProps.onDragEnd(mockEvent)

    expect(mockSetItem).toHaveBeenCalledWith(0, 1)
  })

  it('does not call setItem if active and over ids are the same', () => {
    const mockEvent = {
      active: { id: 'item1' },
      over: { id: 'item1' },
    }

    render(
      <SortableContainer items={items} setItem={mockSetItem}>
        <div>Child Element</div>
      </SortableContainer>
    )

    const dndContextProps = DndContext.mock.calls[0][0]
    dndContextProps.onDragEnd(mockEvent)

    expect(mockSetItem).not.toHaveBeenCalled()
  })
})
