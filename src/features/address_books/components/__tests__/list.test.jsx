import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import AddressBookList from '../list'

// filepath: src/features/address_books/components/list.test.tsx

jest.mock('../list-item', () => ({
  __esModule: true,
  default: jest.fn(({ data, isSelected, onHandleCheckboxClick }) => (
    <div
      data-testid="list-item"
      onClick={() =>
        onHandleCheckboxClick({ stopPropagation: jest.fn() }, data)
      }
    >
      {data.firstName} {data.lastName} {isSelected ? '(Selected)' : ''}
    </div>
  )),
}))

jest.mock('../skeletons/skeleton', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="skeleton">Loading...</div>),
}))

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key, params) => {
    if (key === 'contacts_number.string')
      return `${params?.number || 0} contacts`
    if (key === 'no_items.string') return 'No items available'
    if (key === 'filters.name.string') return 'Filter by name'
    return key
  }),
}))

describe('AddressBookList Component', () => {
  const mockItems = [
    { id: 1, firstName: 'John', lastName: 'Doe' },
    { id: 2, firstName: 'Jane', lastName: 'Smith' },
  ]

  it('renders the skeleton when isLoading is true', () => {
    render(<AddressBookList items={[]} isLoading={true} />)
    expect(screen.getByTestId('skeleton')).toBeInTheDocument()
  })

  it('renders "no items" message when items array is empty', () => {
    render(<AddressBookList items={[]} isLoading={false} />)
    expect(screen.getByText('No items available')).toBeInTheDocument()
  })

  it('renders the list of items when items are provided', () => {
    render(<AddressBookList items={mockItems} isLoading={false} />)
    const listItems = screen.getAllByTestId('list-item')
    expect(listItems).toHaveLength(mockItems.length)
    expect(listItems[0]).toHaveTextContent('John Doe')
    expect(listItems[1]).toHaveTextContent('Jane Smith')
  })

  it('updates selectedItems state when a checkbox is clicked', () => {
    const { getAllByTestId } = render(
      <AddressBookList items={mockItems} isLoading={false} />
    )
    const listItems = getAllByTestId('list-item')

    // Simulate clicking the first item
    fireEvent.click(listItems[0])
    expect(listItems[0]).toHaveTextContent('(Selected)')

    // Simulate clicking the first item again to deselect
    fireEvent.click(listItems[0])
    expect(listItems[0]).not.toHaveTextContent('(Selected)')
  })

  it('renders the correct number of contacts', () => {
    render(<AddressBookList items={mockItems} isLoading={false} />)
    expect(screen.getByText('2 contacts')).toBeInTheDocument()
  })
})
