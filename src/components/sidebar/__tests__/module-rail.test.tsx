import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import ModuleRail, { type ModuleId } from '../module-rail'

const mockToggleModule = jest.fn()
const mockRouterPush = jest.fn()
const mockUseFastAccess = jest.fn(() => ({
  isOpen: false,
  activeModule: null,
  openModule: jest.fn(),
  closeModule: jest.fn(),
  toggleModule: mockToggleModule,
}))

jest.mock('@/features/mails/components/sidebars/fast-access/context', () => ({
  useFastAccess: (...args: unknown[]) => mockUseFastAccess(...args),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}))

jest.mock('@/components/ui/sidebar', () => ({
  Sidebar: ({
    children,
    className,
    side,
  }: {
    children: ReactNode
    className?: string
    side?: string
  }) => (
    <div data-side={side} data-testid="sidebar" className={className}>
      {children}
    </div>
  ),
  SidebarContent: ({
    children,
    className,
  }: {
    children: ReactNode
    className?: string
  }) => (
    <div data-testid="sidebar-content" className={className}>
      {children}
    </div>
  ),
  SidebarGroup: ({
    children,
    className,
  }: {
    children: ReactNode
    className?: string
  }) => (
    <div data-testid="sidebar-group" className={className}>
      {children}
    </div>
  ),
  SidebarGroupContent: ({ children }: { children: ReactNode }) => (
    <div data-testid="sidebar-group-content">{children}</div>
  ),
  SidebarMenu: ({ children }: { children: ReactNode }) => (
    <ul data-testid="sidebar-menu">{children}</ul>
  ),
  SidebarMenuButton: ({
    children,
    onClick,
  }: {
    children: ReactNode
    onClick?: () => void
  }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
  SidebarMenuItem: ({
    children,
    className,
  }: {
    children: ReactNode
    className?: string
  }) => <li className={className}>{children}</li>,
}))

jest.mock('@/lib/utils', () => ({
  cn: (...args: (string | boolean | undefined)[]) =>
    args.filter(Boolean).join(' '),
}))

jest.mock('@/lib/icons/module-nav-icons', () => ({
  ModuleNavIcon: {
    AddressBook: () => <span data-testid="address-book-icon" />,
    Calendar: () => <span data-testid="calendar-icon" />,
    Tasks: () => <span data-testid="tasks-icon" />,
    Notes: () => <span data-testid="notes-icon" />,
  },
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const labels: Record<string, string> = {
      'address_book.string': 'Address Book',
      'calendar.string': 'Calendar',
      'tasks.string': 'Tasks',
      'notes.string': 'Notes',
    }
    return labels[key] ?? key
  },
}))

describe('ModuleRail', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('renders the four module buttons', () => {
      render(<ModuleRail />)

      expect(
        screen.getByRole('button', { name: 'Address Book' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Calendar' })
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Tasks' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Notes' })).toBeInTheDocument()
    })

    it('renders all module icons', () => {
      render(<ModuleRail />)

      expect(screen.getByTestId('address-book-icon')).toBeInTheDocument()
      expect(screen.getByTestId('calendar-icon')).toBeInTheDocument()
      expect(screen.getByTestId('tasks-icon')).toBeInTheDocument()
      expect(screen.getByTestId('notes-icon')).toBeInTheDocument()
    })
  })

  describe('configuration', () => {
    it('renders a right sidebar with the expected rail classes', () => {
      render(<ModuleRail />)

      const sidebar = screen.getByTestId('sidebar')
      expect(sidebar).toHaveAttribute('data-side', 'right')
      expect(sidebar).toHaveClass(
        'text-accent',
        'bg-sidebar-background-secondary',
        'mt-12',
        'hidden',
        'border-0',
        'md:block'
      )
    })
  })

  describe('custom styling', () => {
    it('applies overflow-hidden on sidebar content', () => {
      render(<ModuleRail />)

      expect(screen.getByTestId('sidebar-content')).toHaveClass(
        'overflow-hidden'
      )
    })

    it('applies p-0 on sidebar group', () => {
      render(<ModuleRail />)

      expect(screen.getByTestId('sidebar-group')).toHaveClass('p-0')
    })

    it('applies spacing classes on each menu item', () => {
      const { container } = render(<ModuleRail />)

      const items = container.querySelectorAll('li.mt-4.align-middle')
      expect(items).toHaveLength(4)
    })
  })

  describe('accessibility', () => {
    it('exposes four type="button" controls', () => {
      render(<ModuleRail />)

      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(4)
      buttons.forEach((btn) => {
        expect(btn).toHaveAttribute('type', 'button')
      })
    })

    it('uses a list for module entries', () => {
      render(<ModuleRail />)

      expect(screen.getByTestId('sidebar-menu')).toBeInTheDocument()
      expect(screen.getByTestId('sidebar-menu').tagName).toBe('UL')
    })

    it('activates the focused module via keyboard', async () => {
      const user = userEvent.setup()

      render(<ModuleRail />)

      const calendarBtn = screen.getByRole('button', { name: 'Calendar' })
      calendarBtn.focus()
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(mockToggleModule).toHaveBeenCalledWith('calendar')
      })
    })
  })

  describe('integration', () => {
    it('nests sidebar primitives in the expected order', () => {
      render(<ModuleRail />)

      const sidebar = screen.getByTestId('sidebar')
      const content = screen.getByTestId('sidebar-content')
      const group = screen.getByTestId('sidebar-group')
      const groupContent = screen.getByTestId('sidebar-group-content')
      const menu = screen.getByTestId('sidebar-menu')

      expect(sidebar).toContainElement(content)
      expect(content).toContainElement(group)
      expect(group).toContainElement(groupContent)
      expect(groupContent).toContainElement(menu)
    })

    const cases: { label: string; id: ModuleId }[] = [
      { label: 'Address Book', id: 'address-book' },
      { label: 'Calendar', id: 'calendar' },
      { label: 'Tasks', id: 'tasks' },
      { label: 'Notes', id: 'notes' },
    ]

    it.each(cases)('calls toggleModule with $id when context is available', async ({ label, id }) => {
      const user = userEvent.setup()

      render(<ModuleRail />)
      await user.click(screen.getByRole('button', { name: label }))

      await waitFor(() => {
        expect(mockToggleModule).toHaveBeenCalledWith(id)
      })
    })

    it('calls router.push when no fast access context is available', async () => {
      mockUseFastAccess.mockReturnValueOnce(null)

      const user = userEvent.setup()
      render(<ModuleRail />)

      await user.click(screen.getByRole('button', { name: 'Calendar' }))

      await waitFor(() => {
        expect(mockRouterPush).toHaveBeenCalledWith('/calendars')
      })
    })
  })

  describe('component stability', () => {
    it('keeps labels and handlers consistent after rerenders', async () => {
      const user = userEvent.setup()
      const { rerender } = render(<ModuleRail />)

      expect(screen.getByText('Address Book')).toBeInTheDocument()

      rerender(<ModuleRail />)

      await user.click(screen.getByRole('button', { name: 'Tasks' }))
      await waitFor(() => {
        expect(mockToggleModule).toHaveBeenCalledWith('tasks')
      })
    })
  })

  describe('responsive layout', () => {
    it('marks the rail as hidden until md breakpoint', () => {
      render(<ModuleRail />)

      const sidebar = screen.getByTestId('sidebar')
      expect(sidebar).toHaveClass('hidden', 'md:block')
    })
  })

  describe('children rendering', () => {
    it('renders icon and label inside each button', () => {
      render(<ModuleRail />)

      const notes = screen.getByRole('button', { name: 'Notes' })
      expect(notes).toContainElement(screen.getByTestId('notes-icon'))
      expect(notes).toHaveTextContent('Notes')
    })
  })
})

describe('ModuleId', () => {
  it('covers the four rail module identifiers', () => {
    const ids: ModuleId[] = ['address-book', 'calendar', 'tasks', 'notes']
    expect(ids).toHaveLength(4)
  })
})
