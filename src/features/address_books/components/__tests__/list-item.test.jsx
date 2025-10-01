import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import ListItem from '../list-item'

// filepath: src/features/address_books/components/__tests__/list-item.test.tsx

// Create mock functions that can be accessed in tests
const mockPush = jest.fn()
const mockReplace = jest.fn()
const mockBack = jest.fn()

// Mock next-intl navigation
jest.mock('../../../../lib/i18n/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
  }),
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useParams: () => ({
    book_id: 'test-book-id',
  }),
}))

jest.mock('../../../../components/ui/avatar', () => ({
  Avatar: jest.fn(({ children }) => <div data-testid="avatar">{children}</div>),
  AvatarImage: jest.fn(() => <img data-testid="avatar-image" />),
  AvatarFallback: jest.fn(({ children }) => (
    <div data-testid="avatar-fallback">{children}</div>
  )),
}))

jest.mock('../../../../components/ui/checkbox', () => ({
  Checkbox: jest.fn(({ checked, onClick }) => (
    <input
      type="checkbox"
      data-testid="checkbox"
      checked={checked}
      onClick={onClick}
    />
  )),
}))

describe('ListItem Component', () => {
  const mockData = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
  }
  const mockOnHandleCheckboxClick = jest.fn()

  it('renders the ListItem with avatar fallback initials', () => {
    render(
      <ListItem
        data={mockData}
        isSelected={false}
        onHandleCheckboxClick={mockOnHandleCheckboxClick}
      />
    )
    expect(screen.getByTestId('avatar')).toBeInTheDocument()
    expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('JD')
  })

  it('shows the checkbox when hovered', () => {
    render(
      <ListItem
        data={mockData}
        isSelected={false}
        onHandleCheckboxClick={mockOnHandleCheckboxClick}
      />
    )
    const listItem = screen.getByText('John Doe').closest('div')
    fireEvent.mouseEnter(listItem)
    expect(screen.getByTestId('checkbox')).toBeInTheDocument()
  })

  it('shows the checkbox when selected', () => {
    render(
      <ListItem
        data={mockData}
        isSelected={true}
        onHandleCheckboxClick={mockOnHandleCheckboxClick}
      />
    )
    expect(screen.getByTestId('checkbox')).toBeInTheDocument()
    expect(screen.getByTestId('checkbox')).toBeChecked()
  })

  it('navigates to contact page when clicked', () => {
    mockPush.mockClear() // Clear previous calls

    render(
      <ListItem
        data={mockData}
        isSelected={false}
        onHandleCheckboxClick={mockOnHandleCheckboxClick}
      />
    )
    const listItem = screen.getByText('John Doe').closest('div')
    fireEvent.click(listItem)
    expect(mockPush).toHaveBeenCalledWith('/address_books/test-book-id/1')
  })
})
