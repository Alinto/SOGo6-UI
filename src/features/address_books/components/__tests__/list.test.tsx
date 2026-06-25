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

jest.mock('@/components/dnd/draggable', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

jest.mock('../skeletons/skeleton', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="skeleton">Loading...</div>),
}))

jest.mock('../address-book-empty-state', () => ({
  __esModule: true,
  default: ({ variant }: { variant: string }) => (
    <div
      data-testid={
        variant === 'search' ? 'address-book-search-empty' : 'address-book-empty-state'
      }
    />
  ),
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

jest.mock('next/navigation', () => ({
  useParams: () => ({ book_id: 'work' }),
}))

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => jest.fn(),
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({
      addressBooksUi: { searchQuery: '', sortOrder: 'asc' },
    }),
}))

jest.mock('../../store/address-books-api', () => ({
  useDeleteVCardFromAddressBookMutation: () => [jest.fn().mockReturnValue({ unwrap: jest.fn() })],
  useGetAddressBooksQuery: () => ({ data: undefined }),
}))

jest.mock('../../hooks/use-active-address-book', () => ({
  useActiveAddressBookWritable: () => ({ writable: true, bookId: 'work' }),
}))

import { VCard } from '../../address-books-types'

describe('AddressBookList Component', () => {
  const mockItems: VCard[] = [
    {
      id: '1',
      version: '4.0',
      firstName: 'John',
      lastName: 'Doe',
      middleName: '',
      prefix: '',
      suffix: '',
      nickname: '',
      title: '',
      organization: '',
      department: '',
      jobTitle: '',
      note: '',
      categories: [],
      urls: [],
      photos: [],
      emails: [],
      phoneNumbers: [],
      addresses: [],
      impp: [],
      geo: '',
      birthday: '',
      anniversary: '',
      sound: '',
      uid: '',
      key: '',
    },
    {
      id: '2',
      version: '4.0',
      firstName: 'Jane',
      lastName: 'Smith',
      middleName: '',
      prefix: '',
      suffix: '',
      nickname: '',
      title: '',
      organization: '',
      department: '',
      jobTitle: '',
      note: '',
      categories: [],
      urls: [],
      photos: [],
      emails: [],
      phoneNumbers: [],
      addresses: [],
      impp: [],
      geo: '',
      birthday: '',
      anniversary: '',
      sound: '',
      uid: '',
      key: '',
    },
  ]

  it('renders the skeleton when isLoading is true', () => {
    render(<AddressBookList items={[]} isLoading={true} />)
    expect(screen.getByTestId('skeleton')).toBeInTheDocument()
  })

  it('renders empty state when items array is empty', () => {
    render(<AddressBookList items={[]} isLoading={false} />)
    expect(screen.getByTestId('address-book-empty-state')).toBeInTheDocument()
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
    expect(screen.getAllByText('2 contacts')).toHaveLength(2)
  })
})
