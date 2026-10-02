import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockDispatch = jest.fn()
const mockSetOpenMobile = jest.fn()

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}))

jest.mock('next/navigation', () => ({
  useParams: () => ({ book_id: 'work' }),
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
      data-testid="create-contact-button"
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

jest.mock('../../../hooks/use-active-address-book', () => ({
  useActiveAddressBookWritable: () => ({
    writable: true,
    permissions: {
      canView: true,
      canCreate: true,
      canEdit: true,
      canErase: true,
    },
  }),
}))

jest.mock('../../../store/address-books-api', () => ({
  useGetAddressBooksQuery: () => ({ data: undefined, isLoading: false }),
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

jest.mock('@/features/tasks/hooks/use-create-task-action', () => ({
  useCreateTaskAction: () => ({
    onClick: jest.fn(),
    label: 'New task',
    icon: () => null,
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
import { openCreateForm } from '../../../store/address-books-ui-slice'
import CreateContactOpener from '../create-contact-opener'

const mockUseSidebar = useSidebar as jest.Mock

describe('CreateContactOpener', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSidebar.mockReturnValue({
      isMobile: false,
      state: 'expanded',
      setOpenMobile: mockSetOpenMobile,
    })
  })

  it('renders new contact label', () => {
    render(<CreateContactOpener />)
    expect(screen.getAllByText('new_contact.string').length).toBeGreaterThan(0)
  })

  it('dispatches openCreateForm with book id on click', async () => {
    const user = userEvent.setup()
    render(<CreateContactOpener />)
    await user.click(
      screen.getByRole('button', { name: /new_contact\.string/ })
    )
    expect(mockDispatch).toHaveBeenCalledWith(
      openCreateForm({ bookId: 'work' })
    )
  })

  it('closes mobile sidebar on mobile click', async () => {
    const user = userEvent.setup()
    mockUseSidebar.mockReturnValue({
      isMobile: true,
      state: 'expanded',
      setOpenMobile: mockSetOpenMobile,
    })
    render(<CreateContactOpener />)
    await user.click(
      screen.getByRole('button', { name: /new_contact\.string/ })
    )
    expect(mockSetOpenMobile).toHaveBeenCalledWith(false)
  })
})
