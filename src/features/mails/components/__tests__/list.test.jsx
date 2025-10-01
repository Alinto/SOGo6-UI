import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import MessagesList from '../list'

// filepath: src/features/mails/components/__tests__/list.test.jsx

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useParams: jest.fn(() => ({ folder: 'inbox' })),
}))

jest.mock('../list-item', () => ({
  __esModule: true,
  default: jest.fn(({ data, isSelected, onHandleCheckboxClick }) => (
    <div
      data-testid="list-item"
      onClick={() =>
        onHandleCheckboxClick({ stopPropagation: jest.fn() }, data)
      }
    >
      {data.subject} {isSelected ? '(Selected)' : ''}
    </div>
  )),
}))

jest.mock('../list-item-classic', () => ({
  __esModule: true,
  default: jest.fn(({ data, isSelected, onHandleCheckboxClick }) => (
    <div
      data-testid="list-item-classic"
      onClick={() =>
        onHandleCheckboxClick({ stopPropagation: jest.fn() }, data)
      }
    >
      {data.subject} {isSelected ? '(Selected)' : ''}
    </div>
  )),
}))

jest.mock('../list/list-filter', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="list-filter">Filter</div>),
}))

jest.mock('../list/list-pagination', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="list-pagination">Pagination</div>),
}))

jest.mock('../list/list-sort', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="list-sort">Sort</div>),
}))

jest.mock('../skeletons/skeleton', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="skeleton">Loading...</div>),
}))

jest.mock('../utils', () => ({
  nameSelector: jest.fn((item) => item.subject),
}))

jest.mock('@/components/dnd/draggable', () => ({
  __esModule: true,
  default: jest.fn(({ children }) => (
    <div data-testid="draggable">{children}</div>
  )),
}))

jest.mock('@/components/ui/checkbox', () => ({
  Checkbox: jest.fn(({ checked, onClick }) => (
    <input
      type="checkbox"
      data-testid="checkbox"
      checked={checked}
      onClick={onClick}
      onChange={() => {}}
    />
  )),
}))

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key, params) => {
    if (key === 'messages_number.string' && params)
      return `${params.number} messages`
    if (key === 'no_items.string') return 'No items available'
    return key
  }),
}))

describe('MessagesList Component', () => {
  const mockItems = [
    {
      id: '1',
      subject: 'Test Email 1',
      from: { name: 'John Doe', email: 'john@example.com' },
      to: [{ name: 'Jane Smith', email: 'jane@example.com' }],
      date: new Date().toISOString(),
      seen: false,
      flagged: false,
      hasAttachment: false,
      snippet: 'This is a test email',
    },
    {
      id: '2',
      subject: 'Test Email 2',
      from: { name: 'Jane Smith', email: 'jane@example.com' },
      to: [{ name: 'John Doe', email: 'john@example.com' }],
      date: new Date().toISOString(),
      seen: true,
      flagged: true,
      hasAttachment: true,
      snippet: 'Another test email',
    },
  ]

  it('renders the skeleton when isLoading is true', () => {
    render(
      <MessagesList
        items={[]}
        total={0}
        page={1}
        totalPages={1}
        hasNextPage={false}
        hasPreviousPage={false}
        isLoading={true}
        type={'modern'}
      />
    )
    expect(screen.getByTestId('skeleton')).toBeInTheDocument()
  })

  it('renders "no items" message when items array is empty', () => {
    render(
      <MessagesList
        items={[]}
        total={0}
        page={1}
        totalPages={1}
        hasNextPage={false}
        hasPreviousPage={false}
        isLoading={false}
        type={'modern'}
      />
    )
    expect(screen.getByText('No items available')).toBeInTheDocument()
  })

  it('renders the list of items when items are provided', () => {
    render(
      <MessagesList
        items={mockItems}
        total={2}
        page={1}
        totalPages={1}
        hasNextPage={false}
        hasPreviousPage={false}
        isLoading={false}
        type={'modern'}
      />
    )
    const listItems = screen.getAllByTestId('list-item')
    expect(listItems).toHaveLength(mockItems.length)
    expect(listItems[0]).toHaveTextContent('Test Email 1')
    expect(listItems[1]).toHaveTextContent('Test Email 2')
  })

  it('updates selectedItems state when a checkbox is clicked', () => {
    const { getAllByTestId } = render(
      <MessagesList
        items={mockItems}
        total={2}
        page={1}
        totalPages={1}
        hasNextPage={false}
        hasPreviousPage={false}
        isLoading={false}
        type={'modern'}
      />
    )
    const listItems = getAllByTestId('list-item')

    // Simulate clicking the first item
    fireEvent.click(listItems[0])
    expect(listItems[0]).toHaveTextContent('(Selected)')

    // Simulate clicking the first item again to deselect
    fireEvent.click(listItems[0])
    expect(listItems[0]).not.toHaveTextContent('(Selected)')
  })

  it('renders the correct number of messages', () => {
    render(
      <MessagesList
        items={mockItems}
        total={2}
        page={1}
        totalPages={1}
        hasNextPage={false}
        hasPreviousPage={false}
        isLoading={false}
        type={'modern'}
      />
    )
    expect(screen.getByText('2 messages')).toBeInTheDocument()
  })
})
