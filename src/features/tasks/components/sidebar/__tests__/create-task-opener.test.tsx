import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockDispatch = jest.fn()
const mockSetOpenMobile = jest.fn()

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}))

jest.mock('@/components/ui/sidebar', () => ({
  useSidebar: jest.fn(() => ({
    isMobile: false,
    setOpenMobile: mockSetOpenMobile,
  })),
  SidebarMenuButton: ({
    children,
    onClick,
    className,
  }: {
    children: React.ReactNode
    onClick?: () => void
    className?: string
  }) => (
    <button
      type="button"
      data-testid="create-task-button"
      onClick={onClick}
      className={className}
    >
      {children}
    </button>
  ),
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('@/features/mails/hooks/use-compose-action', () => ({
  useComposeAction: () => ({
    onClick: jest.fn(),
    label: 'New message',
    icon: () => null,
  }),
}))

jest.mock('@/features/calendars/hooks/use-create-event-action', () => ({
  useCreateEventAction: () => ({
    onClick: jest.fn(),
    label: 'Create Event',
    icon: () => null,
  }),
}))

jest.mock('@/features/address_books/hooks/use-create-contact-action', () => ({
  useCreateContactAction: () => ({
    onClick: jest.fn(),
    label: 'New contact',
    icon: () => null,
    disabled: false,
  }),
}))

jest.mock('@/features/user-profile', () => ({
  useProfile: () => ({ moduleAccess: [], isLoading: false }),
}))

jest.mock('@/features/calendars', () => ({
  useGetCalendarsQuery: () => ({
    data: [
      { name: 'Personal', description: null, key: 'cal-1', is_default: true },
    ],
    isLoading: false,
  }),
}))

import { useSidebar } from '@/components/ui/sidebar'
import { openCreateForm } from '../../../store/tasks-ui-slice'
import CreateTaskOpener from '../create-task-opener'

const mockUseSidebar = useSidebar as jest.Mock

describe('CreateTaskOpener', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSidebar.mockReturnValue({
      isMobile: false,
      state: 'expanded',
      setOpenMobile: mockSetOpenMobile,
    })
  })

  describe('basic rendering', () => {
    it('renders new task label', () => {
      render(<CreateTaskOpener />)
      expect(screen.getAllByText('new_task.string').length).toBeGreaterThan(0)
    })
  })

  describe('integration', () => {
    it('dispatches openCreateForm on click', async () => {
      const user = userEvent.setup()
      render(<CreateTaskOpener />)
      await user.click(screen.getByRole('button', { name: /new_task\.string/ }))
      expect(mockDispatch).toHaveBeenCalledWith(openCreateForm())
    })

    it('closes mobile sidebar on mobile click', async () => {
      const user = userEvent.setup()
      mockUseSidebar.mockReturnValue({
        isMobile: true,
        state: 'expanded',
        setOpenMobile: mockSetOpenMobile,
      })
      render(<CreateTaskOpener />)
      await user.click(screen.getByRole('button', { name: /new_task\.string/ }))
      expect(mockSetOpenMobile).toHaveBeenCalledWith(false)
      expect(mockDispatch).toHaveBeenCalledWith(openCreateForm())
    })
  })

  describe('custom styling', () => {
    it('applies h-10 button classes', () => {
      render(<CreateTaskOpener />)
      expect(screen.getByRole('group')).toHaveClass('h-10')
    })
  })
})
