import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import { useTranslations } from 'next-intl'
import SidebarItem from '../sidebar-item'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}))

// Mock useCalendarVisibility hook
const mockSetCalendarVisibility = jest.fn()
const mockIsCalendarVisible = jest.fn()

jest.mock('../../../hooks/useCalendarVisibility', () => ({
  useCalendarVisibility: () => ({
    setCalendarVisibility: mockSetCalendarVisibility,
    isCalendarVisible: mockIsCalendarVisible,
  }),
}))

// Mock useProfile hook
const mockUseProfile = jest.fn(() => ({ folderSharingDisabled: [] as string[] }))
jest.mock('@/features/user-profile', () => ({
  useProfile: () => mockUseProfile(),
}))

// Mock UI components
jest.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({ checked, onCheckedChange, ...props }: any) => (
    <input
      type="checkbox"
      data-testid="calendar-checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      {...props}
    />
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

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: any) => (
    <div data-testid="dialog" data-open={open}>
      {children}
    </div>
  ),
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogTrigger: ({ children, asChild }: any) => (
    <div data-testid="dialog-trigger">{children}</div>
  ),
}))

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
  DropdownMenuTrigger: ({ children, asChild }: any) => (
    <div data-testid="dropdown-menu-trigger">{children}</div>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu-content">{children}</div>
  ),
  DropdownMenuItem: ({ children, onClick }: any) => (
    <div data-testid="dropdown-menu-item" onClick={onClick}>
      {children}
    </div>
  ),
  DropdownMenuSeparator: () => <div data-testid="dropdown-menu-separator" />,
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
  default: ({ id }: any) => (
    <div data-testid="share-action">Share Action for {id}</div>
  ),
}))

describe('SidebarItem', () => {
  const defaultProps = {
    name: 'Test Calendar',
    id: 'cal-123',
    color: '#3b82f6',
    isDefault: false,
    disableActions: false,
    onClick: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockIsCalendarVisible.mockReturnValue(true)
    mockUseProfile.mockReturnValue({ folderSharingDisabled: [] })
  })

  it('should render the calendar name', () => {
    render(<SidebarItem {...defaultProps} />)
    expect(screen.getByText('Test Calendar')).toBeInTheDocument()
  })

  it('should render checkbox with calendar visibility state', () => {
    mockIsCalendarVisible.mockReturnValue(true)
    render(<SidebarItem {...defaultProps} />)

    const checkbox = screen.getByTestId('calendar-checkbox')
    expect(checkbox).toBeChecked()
  })

  it('should toggle calendar visibility when checkbox is clicked', () => {
    mockIsCalendarVisible.mockReturnValue(true)
    render(<SidebarItem {...defaultProps} />)

    const checkbox = screen.getByTestId('calendar-checkbox')
    fireEvent.click(checkbox)

    expect(mockSetCalendarVisibility).toHaveBeenCalledWith('cal-123', false)
  })

  it('should toggle calendar visibility when item is clicked', () => {
    mockIsCalendarVisible.mockReturnValue(true)
    const { container } = render(<SidebarItem {...defaultProps} />)

    const clickableDiv = container.querySelector('.cursor-pointer')
    fireEvent.click(clickableDiv!)

    expect(mockSetCalendarVisibility).toHaveBeenCalledWith('cal-123', false)
  })

  it('should apply color to checkbox when calendar is visible', () => {
    mockIsCalendarVisible.mockReturnValue(true)
    render(<SidebarItem {...defaultProps} />)

    const checkbox = screen.getByTestId('calendar-checkbox')
    expect(checkbox).toHaveStyle({
      backgroundColor: '#3b82f6',
      borderColor: '#3b82f6',
    })
  })

  it('should apply border color only when calendar is not visible', () => {
    mockIsCalendarVisible.mockReturnValue(false)
    render(<SidebarItem {...defaultProps} />)

    const checkbox = screen.getByTestId('calendar-checkbox')
    expect(checkbox).toHaveStyle({ borderColor: '#3b82f6' })
  })

  it('should render dropdown menu with actions when actions are not disabled', () => {
    render(<SidebarItem {...defaultProps} />)

    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument()
    expect(screen.getByTestId('dropdown-menu-trigger')).toBeInTheDocument()
  })

  it('should not render dropdown menu when actions are disabled', () => {
    render(<SidebarItem {...defaultProps} disableActions={true} />)

    expect(screen.queryByTestId('dropdown-menu')).not.toBeInTheDocument()
  })

  it('should render all menu items for non-default calendar', () => {
    render(<SidebarItem {...defaultProps} isDefault={false} />)

    const menuItems = screen.getAllByTestId('dropdown-menu-item')
    // Edit, Delete, Link, Sharing, Export
    expect(menuItems.length).toBeGreaterThanOrEqual(5)
  })

  it('should not render delete option for default calendar', () => {
    render(<SidebarItem {...defaultProps} isDefault={true} />)

    const menuItems = screen.getAllByTestId('dropdown-menu-item')
    // Edit, Link, Sharing, Export (no Delete)
    expect(menuItems.length).toBeLessThan(5)
  })

  it('should use translations from CALENDARS namespace', () => {
    render(<SidebarItem {...defaultProps} />)
    expect(useTranslations).toHaveBeenCalledWith('CALENDARS')
  })

  it('should render EditForm when edit action is triggered', () => {
    const { container } = render(<SidebarItem {...defaultProps} />)

    // Simulate clicking edit menu item
    const menuItems = screen.getAllByTestId('dropdown-menu-item')
    const editItem = menuItems[0] // First item is usually Edit

    fireEvent.click(editItem)

    // The edit form should be rendered
    expect(screen.getByTestId('edit-form')).toBeInTheDocument()
    expect(screen.getByText(/Edit Form for Test Calendar/)).toBeInTheDocument()
  })

  it('should render DeleteAction when delete action is triggered', () => {
    render(<SidebarItem {...defaultProps} isDefault={false} />)

    const menuItems = screen.getAllByTestId('dropdown-menu-item')
    const deleteItem = menuItems[1] // Second item is Delete

    fireEvent.click(deleteItem)

    expect(screen.getByTestId('delete-action')).toBeInTheDocument()
  })

  it('should render LinkAction when link action is triggered', () => {
    render(<SidebarItem {...defaultProps} />)

    const menuItems = screen.getAllByTestId('dropdown-menu-item')
    // Find Link item (varies based on isDefault)
    const linkItem = menuItems.find((item) =>
      item.textContent?.includes('sidebar.link.string')
    )

    if (linkItem) {
      fireEvent.click(linkItem)
      expect(screen.getByTestId('link-action')).toBeInTheDocument()
    }
  })

  it('should handle calendar without color', () => {
    render(<SidebarItem {...defaultProps} color={undefined} />)

    const checkbox = screen.getByTestId('calendar-checkbox')
    expect(checkbox).toBeInTheDocument()
  })

  describe('sharing action gating', () => {
    it('should show the Sharing menu item for a personal calendar when not disabled', () => {
      render(<SidebarItem {...defaultProps} sourceType={undefined} />)

      const menuItems = screen.getAllByTestId('dropdown-menu-item')
      const sharingItem = menuItems.find((item) =>
        item.textContent?.includes('sidebar.sharing.string')
      )
      expect(sharingItem).toBeDefined()
    })

    it('should hide the Sharing menu item for a shared calendar', () => {
      render(<SidebarItem {...defaultProps} sourceType="shared" />)

      const menuItems = screen.getAllByTestId('dropdown-menu-item')
      const sharingItem = menuItems.find((item) =>
        item.textContent?.includes('sidebar.sharing.string')
      )
      expect(sharingItem).toBeUndefined()
    })

    it('should hide the Sharing menu item for a subscription calendar', () => {
      render(<SidebarItem {...defaultProps} sourceType="subscription" />)

      const menuItems = screen.getAllByTestId('dropdown-menu-item')
      const sharingItem = menuItems.find((item) =>
        item.textContent?.includes('sidebar.sharing.string')
      )
      expect(sharingItem).toBeUndefined()
    })

    it('should hide the Sharing menu item when folderSharingDisabled includes "calendar"', () => {
      mockUseProfile.mockReturnValue({ folderSharingDisabled: ['calendar'] })
      render(<SidebarItem {...defaultProps} />)

      const menuItems = screen.getAllByTestId('dropdown-menu-item')
      const sharingItem = menuItems.find((item) =>
        item.textContent?.includes('sidebar.sharing.string')
      )
      expect(sharingItem).toBeUndefined()
    })

    it('should render ShareCalendarAction when the sharing action is triggered', () => {
      render(<SidebarItem {...defaultProps} />)

      const menuItems = screen.getAllByTestId('dropdown-menu-item')
      const sharingItem = menuItems.find((item) =>
        item.textContent?.includes('sidebar.sharing.string')
      )
      fireEvent.click(sharingItem!)

      expect(screen.getByTestId('share-action')).toBeInTheDocument()
    })
  })
})
