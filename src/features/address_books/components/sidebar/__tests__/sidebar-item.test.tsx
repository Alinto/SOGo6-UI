import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { useTranslations } from 'next-intl'
import React from 'react'
import { useParams } from 'next/navigation'
import SidebarItem from '../sidebar-item'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}))

const mockPush = jest.fn()

// Mock i18n navigation hooks
jest.mock('@/lib/i18n/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(() => ({
    push: mockPush,
  })),
}))

jest.mock('next/navigation', () => ({
  useParams: jest.fn(() => ({})),
}))

const mockUseProfile = jest.fn(() => ({ folderSharingDisabled: [] as string[] }))
jest.mock('@/features/user-profile', () => ({
  useProfile: () => mockUseProfile(),
}))

jest.mock('lucide-react/dynamic', () => ({
  DynamicIcon: ({ name, ...props }: any) => (
    <span data-testid={`dynamic-icon-${name}`} {...props}>
      {name}-icon
    </span>
  ),
}))

jest.mock('@/components/ui/sidebar', () => ({
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-menu-item">{children}</div>
  ),
  SidebarMenuAction: ({ children, className }: any) => (
    <div data-testid="sidebar-menu-action" className={className}>
      {children}
    </div>
  ),
}))

jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: jest.fn(() => false),
}))

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: any) => <div data-testid="dialog">{children}</div>,
  DialogContent: ({ children }: any) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogTrigger: ({ children }: any) => (
    <div data-testid="dialog-trigger">{children}</div>
  ),
}))

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: any) => (
    <div data-testid="dropdown-menu-trigger">{children}</div>
  ),
  DropdownMenuContent: ({ children }: any) => (
    <div data-testid="dropdown-menu-content">{children}</div>
  ),
  DropdownMenuItem: ({ children, ...props }: any) => (
    <div data-testid="dropdown-menu-item" {...props}>
      {children}
    </div>
  ),
  DropdownMenuSeparator: () => <div data-testid="dropdown-menu-separator" />,
}))

jest.mock('@/components/ui/sidebar', () => ({
  SidebarMenuItem: ({ children }: any) => (
    <div data-testid="sidebar-menu-item">{children}</div>
  ),
  SidebarMenuButton: ({ children, isActive, ...props }: any) => (
    <button
      data-testid="sidebar-menu-button"
      data-active={isActive}
      {...props}
    >
      {children}
    </button>
  ),
  SidebarMenuAction: ({ children, ...props }: any) => (
    <div data-testid="sidebar-menu-action" {...props}>
      {children}
    </div>
  ),
}))

jest.mock('lucide-react', () => ({
  MoreVertical: () => <span data-testid="more-vertical" />,
}))

// Mock action components
jest.mock('../forms/edit', () => ({
  __esModule: true,
  default: ({ id, name, color, onClose }: any) => (
    <div data-testid="edit-form">
      Edit Form for {name} (ID: {id})
    </div>
  ),
}))

jest.mock('../actions/delete', () => ({
  __esModule: true,
  default: ({ id }: any) => (
    <div data-testid="delete-action">Delete Action for {id}</div>
  ),
}))

jest.mock('../actions/link', () => ({
  __esModule: true,
  default: ({ id }: any) => (
    <div data-testid="link-action">Link Action for {id}</div>
  ),
}))

jest.mock('../actions/share', () => ({
  __esModule: true,
  default: ({ id, name }: any) => (
    <div data-testid="share-action">
      Share Action for {name} (ID: {id})
    </div>
  ),
}))

describe('SidebarItem', () => {
  const defaultProps = {
    name: 'Test Book',
    id: 'test-book-id',
    onClick: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should use translations from ADDRESS_BOOKS_SIDEBAR namespace', () => {
    render(<SidebarItem {...defaultProps} />)

    expect(useTranslations).toHaveBeenCalledWith('ADDRESS_BOOKS_SIDEBAR')
    expect(useTranslations).toHaveBeenCalledWith('FORM_COMMONS')
  })
  it('navigates to the correct address book when clicked', () => {
    const { getByTestId } = render(<SidebarItem {...defaultProps} />)

    getByTestId('sidebar-menu-button').click()

    expect(mockPush).toHaveBeenCalledWith('/address_books/test-book-id')
  })

  it('marks the item active when it matches the current book route', () => {
    jest.mocked(useParams).mockReturnValue({ book_id: 'test-book-id' })

    const { getByTestId } = render(<SidebarItem {...defaultProps} />)

    expect(getByTestId('sidebar-menu-button')).toHaveAttribute('data-active', 'true')
  })

  it('renders the dynamic icon when icon prop is passed', () => {
    const props = { ...defaultProps, icon: 'Book' }
    const { getByTestId } = render(<SidebarItem {...props} />)

    expect(getByTestId('dynamic-icon-Book')).toBeInTheDocument()
  })

  it('shows dropdown actions when clicking the action button', () => {
  const { getByTestId, getAllByTestId } = render(<SidebarItem {...defaultProps} />)

  getByTestId('sidebar-menu-action').click()

  expect(getAllByTestId('dropdown-menu-item').length).toBeGreaterThan(0)
})

it('does not show delete option when isDefault is true', () => {
  const props = { ...defaultProps, isDefault: true }
  const { getByTestId, queryByText } = render(<SidebarItem {...props} />)

  getByTestId('sidebar-menu-action').click()

  expect(queryByText('delete.default.string')).toBeNull()
})

it('does not render actions when disableActions is true', () => {
  const props = { ...defaultProps, disableActions: true }
  const { queryByTestId } = render(<SidebarItem {...props} />)

  expect(queryByTestId('sidebar-menu-action')).toBeNull()
})

})
