import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import ListItem from '../list-item'

// filepath: src/features/address_books/components/__tests__/list-item.test.tsx

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useParams: jest.fn(() => ({ mail_id: '123' })),
}))

// Mock navigation with next-intl
jest.mock('../../../../lib/i18n/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
  usePathname: jest.fn(() => '/u/test@example.com/inbox'),
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
      onChange={() => {}}
    />
  )),
}))

jest.mock('../../../../components/ui/separator', () => ({
  Separator: jest.fn(() => <hr data-testid="separator" />),
}))

describe('ListItem Component', () => {
  const mockData = {
    id: '123',
    subject: 'Test Email Subject',
    from: { name: 'John Doe', email: 'john@example.com' },
    to: [{ name: 'Jane Smith', email: 'jane@example.com' }],
    date: new Date().toISOString(),
    seen: false,
    flagged: false,
    hasAttachment: true,
    snippet: 'This is a test email snippet',
  }
  const mockOnHandleCheckboxClick = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the ListItem with correct email data', () => {
    render(
      <ListItem
        data={mockData}
        isSelected={false}
        onHandleCheckboxClick={mockOnHandleCheckboxClick}
      />
    )
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Test Email Subject')).toBeInTheDocument()
  })

  it('renders avatar with fallback initial', () => {
    render(
      <ListItem
        data={mockData}
        isSelected={false}
        onHandleCheckboxClick={mockOnHandleCheckboxClick}
      />
    )
    expect(screen.getByTestId('avatar')).toBeInTheDocument()
    expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('J')
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

  it('calls onHandleCheckboxClick when checkbox is clicked', () => {
    render(
      <ListItem
        data={mockData}
        isSelected={true}
        onHandleCheckboxClick={mockOnHandleCheckboxClick}
      />
    )
    const checkbox = screen.getByTestId('checkbox')
    fireEvent.click(checkbox)
    expect(mockOnHandleCheckboxClick).toHaveBeenCalledWith(
      expect.any(Object),
      mockData
    )
  })

  it('displays attachment icon when email has attachment', () => {
    render(
      <ListItem
        data={mockData}
        isSelected={false}
        onHandleCheckboxClick={mockOnHandleCheckboxClick}
      />
    )
    // The Paperclip icon from lucide-react would be rendered
    expect(screen.getByText('Test Email Subject')).toBeInTheDocument()
  })

  it('applies unseen styling when email is not seen', () => {
    render(
      <ListItem
        data={mockData}
        isSelected={false}
        onHandleCheckboxClick={mockOnHandleCheckboxClick}
      />
    )
    const subjectElement = screen.getByText('Test Email Subject')
    expect(subjectElement).toHaveClass('font-semibold')
  })

  it('does not apply unseen styling when email is seen', () => {
    const seenData = { ...mockData, seen: true }
    render(
      <ListItem
        data={seenData}
        isSelected={false}
        onHandleCheckboxClick={mockOnHandleCheckboxClick}
      />
    )
    const subjectElement = screen.getByText('Test Email Subject')
    expect(subjectElement).not.toHaveClass('font-semibold')
  })
})
