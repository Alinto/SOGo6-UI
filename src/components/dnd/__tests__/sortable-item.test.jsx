import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import SortableItem from '../sortable-item'

// filepath: src/components/dnd/sortable-item.test.jsx

jest.mock('@dnd-kit/sortable', () => ({
  useSortable: jest.fn(),
}))

jest.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: jest.fn(),
    },
  },
}))

describe('SortableItem Component', () => {
  const mockUseSortable = {
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: { x: 0, y: 0, scaleX: 1, scaleY: 1 },
    transition: 'transform 250ms ease',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    useSortable.mockReturnValue(mockUseSortable)
    CSS.Transform.toString.mockReturnValue('translate3d(0px, 0px, 0)')
  })

  it('renders the SortableItem with children', () => {
    render(
      <SortableItem id="item1">
        <div>Child Element</div>
      </SortableItem>
    )

    expect(screen.getByText('Child Element')).toBeInTheDocument()
  })

  it('applies the correct styles to the SortableItem', () => {
    render(
      <SortableItem id="item1">
        <div>Child Element</div>
      </SortableItem>
    )

    const sortableItem = screen.getByText('Child Element').parentElement
    expect(sortableItem).toHaveStyle('transform: translate3d(0px, 0px, 0)')
    expect(sortableItem).toHaveStyle('transition: transform 250ms ease')
  })

  it('sets the node reference correctly', () => {
    render(
      <SortableItem id="item1">
        <div>Child Element</div>
      </SortableItem>
    )

    const sortableItem = screen.getByText('Child Element').parentElement
    expect(mockUseSortable.setNodeRef).toHaveBeenCalledWith(sortableItem)
  })
})
