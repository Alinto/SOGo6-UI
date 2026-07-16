import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'

const mockPush = jest.fn()

jest.mock('@/lib/i18n/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

jest.mock('next/navigation', () => ({
  useParams: () => ({ book_id: 'test-book-id' }),
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="avatar">{children}</div>
  ),
  AvatarImage: ({ src, alt }: { src?: string; alt?: string }) => (
    <img data-testid="avatar-image" src={src} alt={alt} />
  ),
  AvatarFallback: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="avatar-fallback">{children}</div>
  ),
}))

jest.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({
    checked,
    onClick,
    'aria-label': ariaLabel,
  }: {
    checked?: boolean
    onClick?: (e: React.MouseEvent) => void
    'aria-label'?: string
  }) => (
    <input
      type="checkbox"
      data-testid="checkbox"
      checked={checked}
      onClick={onClick}
      aria-label={ariaLabel}
    />
  ),
}))

jest.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))

jest.mock('../../store/address-books-api', () => ({
  useGetAddressBooksQuery: () => ({ data: undefined }),
}))

import type { VCard } from '../../address-books-types'
import ListItem from '../list-item'

describe('ListItem', () => {
  const contact: VCard = {
    id: '1',
    version: '4.0',
    firstName: 'John',
    lastName: 'Doe',
  }

  const distributionList: VCard = {
    id: 'list-1',
    version: '4.0',
    kind: 'group',
    firstName: 'Team',
    lastName: '',
    members: [{ email: 'a@example.com' }, { email: 'b@example.com' }],
  }

  const mockOnHandleCheckboxClick = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('renders contact with avatar fallback initials', () => {
      render(
        <ListItem
          data={contact}
          isSelected={false}
          onHandleCheckboxClick={mockOnHandleCheckboxClick}
        />
      )
      expect(screen.getByTestId('avatar')).toBeInTheDocument()
      expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('JD')
      expect(screen.queryByTestId('avatar-image')).not.toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('renders contact photo when available', () => {
      render(
        <ListItem
          data={{
            ...contact,
            photo: 'data:image/jpeg;base64,abc',
          }}
          isSelected={false}
          onHandleCheckboxClick={mockOnHandleCheckboxClick}
        />
      )
      expect(screen.getByTestId('avatar-image')).toHaveAttribute(
        'src',
        'data:image/jpeg;base64,abc'
      )
    })

    it('renders distribution list with member count', () => {
      render(
        <ListItem
          data={distributionList}
          isSelected={false}
          onHandleCheckboxClick={mockOnHandleCheckboxClick}
        />
      )
      expect(screen.getByText('list_member_count.string')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('shows checkbox when selected', () => {
      render(
        <ListItem
          data={contact}
          isSelected
          onHandleCheckboxClick={mockOnHandleCheckboxClick}
        />
      )
      expect(screen.getByTestId('checkbox')).toBeChecked()
    })

    it('shows checkbox on hover', () => {
      render(
        <ListItem
          data={contact}
          isSelected={false}
          onHandleCheckboxClick={mockOnHandleCheckboxClick}
        />
      )
      const listItem = screen.getByText('John Doe').closest('div')
      fireEvent.mouseEnter(listItem!)
      expect(screen.getByTestId('checkbox')).toBeInTheDocument()
    })

    it('navigates to contact page when clicked', () => {
      render(
        <ListItem
          data={contact}
          isSelected={false}
          onHandleCheckboxClick={mockOnHandleCheckboxClick}
        />
      )
      fireEvent.click(screen.getByRole('button', { name: 'John Doe' }))
      expect(mockPush).toHaveBeenCalledWith('/address_books/test-book-id/1')
    })

    it('appends kind query for distribution lists', () => {
      render(
        <ListItem
          data={distributionList}
          isSelected={false}
          onHandleCheckboxClick={mockOnHandleCheckboxClick}
        />
      )
      fireEvent.click(screen.getByRole('button', { name: 'Team' }))
      expect(mockPush).toHaveBeenCalledWith(
        '/address_books/test-book-id/list-1?kind=group'
      )
    })
  })

  describe('custom styling', () => {
    it('applies active and selected styles', () => {
      const { container } = render(
        <ListItem
          data={contact}
          isSelected
          isActive
          onHandleCheckboxClick={mockOnHandleCheckboxClick}
        />
      )
      const item = container.querySelector('.border-primary')
      expect(item).toBeInTheDocument()
      expect(item).toHaveClass('bg-primary/10')
    })
  })
})
