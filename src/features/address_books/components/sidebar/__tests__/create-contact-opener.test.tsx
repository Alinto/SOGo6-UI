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

import { useSidebar } from '@/components/ui/sidebar'
import CreateContactOpener from '../create-contact-opener'
import { openCreateForm } from '../../../store/address-books-ui-slice'

const mockUseSidebar = useSidebar as jest.Mock

describe('CreateContactOpener', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSidebar.mockReturnValue({
      isMobile: false,
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
    await user.click(screen.getByTestId('create-contact-button'))
    expect(mockDispatch).toHaveBeenCalledWith(
      openCreateForm({ bookId: 'work' })
    )
  })

  it('closes mobile sidebar on mobile click', async () => {
    const user = userEvent.setup()
    mockUseSidebar.mockReturnValue({
      isMobile: true,
      setOpenMobile: mockSetOpenMobile,
    })
    render(<CreateContactOpener />)
    await user.click(screen.getByTestId('create-contact-button'))
    expect(mockSetOpenMobile).toHaveBeenCalledWith(false)
  })
})
