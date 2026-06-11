import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: { number?: number }) => {
    if (key === 'contacts_number.string') {
      return `${params?.number ?? 0} contacts`
    }
    if (key === 'lists_count.string') {
      return `${params?.number ?? 0} lists`
    }
    return key
  },
}))

jest.mock('@/components/dnd/draggable', () => ({
  __esModule: true,
  default: ({
    children,
    id,
  }: {
    children: React.ReactNode
    id: string
  }) => <div data-testid={`draggable-${id}`}>{children}</div>,
}))

jest.mock('../list-item', () => ({
  __esModule: true,
  default: ({
    data,
    isSelected,
    isActive,
    onHandleCheckboxClick,
  }: {
    data: { id: string; firstName: string; lastName: string }
    isSelected: boolean
    isActive?: boolean
    onHandleCheckboxClick: (e: React.MouseEvent, item: unknown) => void
  }) => (
    <div
      data-testid={`list-item-${data.id}`}
      data-selected={isSelected}
      data-active={isActive}
      onClick={(e) => onHandleCheckboxClick(e, data)}
    >
      {data.firstName} {data.lastName}
    </div>
  ),
}))

import type { VCard } from '../../address-books-types'
import ListSection from '../list-section'

const items: VCard[] = [
  { id: 'c1', version: '4.0', firstName: 'John', lastName: 'Doe' },
  { id: 'c2', version: '4.0', firstName: 'Jane', lastName: 'Smith' },
]

describe('ListSection', () => {
  const onHandleCheckboxClick = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('renders section with title and item count', () => {
      render(
        <ListSection
          title="Contacts"
          items={items}
          bookId="work"
          selectedItems={[]}
          showCheckboxes={false}
          onHandleCheckboxClick={onHandleCheckboxClick}
        />
      )

      expect(screen.getByTestId('list-section-contacts')).toBeInTheDocument()
      expect(screen.getByText('Contacts')).toBeInTheDocument()
      expect(screen.getByText('2 contacts')).toBeInTheDocument()
    })

    it('returns null when items array is empty', () => {
      const { container } = render(
        <ListSection
          title="Contacts"
          items={[]}
          bookId="work"
          selectedItems={[]}
          showCheckboxes={false}
          onHandleCheckboxClick={onHandleCheckboxClick}
        />
      )
      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('configuration', () => {
    it('uses lists variant test id', () => {
      render(
        <ListSection
          title="Lists"
          items={items}
          bookId="work"
          variant="lists"
          selectedItems={[]}
          showCheckboxes={false}
          onHandleCheckboxClick={onHandleCheckboxClick}
        />
      )
      expect(screen.getByTestId('list-section-lists')).toBeInTheDocument()
    })

    it('marks active and selected items', () => {
      render(
        <ListSection
          title="Contacts"
          items={items}
          bookId="work"
          contactId="c1"
          selectedItems={[items[0]]}
          showCheckboxes
          onHandleCheckboxClick={onHandleCheckboxClick}
        />
      )

      expect(screen.getByTestId('list-item-c1')).toHaveAttribute('data-active', 'true')
      expect(screen.getByTestId('list-item-c1')).toHaveAttribute('data-selected', 'true')
      expect(screen.getByTestId('draggable-c1')).toBeInTheDocument()
    })
  })

  describe('integration', () => {
    it('forwards checkbox clicks to handler', () => {
      render(
        <ListSection
          title="Contacts"
          items={items}
          bookId="work"
          selectedItems={[]}
          showCheckboxes
          onHandleCheckboxClick={onHandleCheckboxClick}
        />
      )

      fireEvent.click(screen.getByTestId('list-item-c1'))
      expect(onHandleCheckboxClick).toHaveBeenCalled()
    })
  })
})
