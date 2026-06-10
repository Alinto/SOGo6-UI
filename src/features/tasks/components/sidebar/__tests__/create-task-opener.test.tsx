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
    <button type="button" data-testid="create-task-button" onClick={onClick} className={className}>
      {children}
    </button>
  ),
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

import { useSidebar } from '@/components/ui/sidebar'
import CreateTaskOpener from '../create-task-opener'
import { openCreateForm } from '../../../store/tasks-ui-slice'

const mockUseSidebar = useSidebar as jest.Mock

describe('CreateTaskOpener', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSidebar.mockReturnValue({
      isMobile: false,
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
      await user.click(screen.getByTestId('create-task-button'))
      expect(mockDispatch).toHaveBeenCalledWith(openCreateForm())
    })

    it('closes mobile sidebar on mobile click', async () => {
      const user = userEvent.setup()
      mockUseSidebar.mockReturnValue({
        isMobile: true,
        setOpenMobile: mockSetOpenMobile,
      })
      render(<CreateTaskOpener />)
      await user.click(screen.getByTestId('create-task-button'))
      expect(mockSetOpenMobile).toHaveBeenCalledWith(false)
      expect(mockDispatch).toHaveBeenCalledWith(openCreateForm())
    })
  })

  describe('custom styling', () => {
    it('applies h-10 button classes', () => {
      render(<CreateTaskOpener />)
      expect(screen.getByTestId('create-task-button')).toHaveClass('h-10')
    })
  })
})
