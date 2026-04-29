import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'

const mockSetOpenMobile = jest.fn()
const mockDispatch = jest.fn()

jest.mock('@/components/ui/sidebar', () => ({
  useSidebar: jest.fn(),
  SidebarMenuButton: ({
    children,
    onClick,
    className,
    ...props
  }: {
    children: ReactNode
    onClick?: () => void
    className?: string
  }) => (
    <button
      type="button"
      data-testid="sidebar-menu-button"
      onClick={onClick}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
}))

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: jest.fn(() => mockDispatch),
}))

jest.mock('@/lib/utils', () => ({
  cn: (...args: (string | boolean | undefined)[]) =>
    args.filter(Boolean).join(' '),
}))

jest.mock('lucide-react', () => ({
  CalendarPlus: ({ className }: { className?: string }) => (
    <span data-testid="calendar-plus-icon" className={className} />
  ),
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      'createEvent.string': 'Create Event',
    }
    return map[key] ?? key
  },
}))

import { useSidebar } from '@/components/ui/sidebar'
import { requestCreateEvent } from '@/features/calendars/store/calendar-ui-slice'
import CreateEventOpener from '../create-event-opener'

const useSidebarMock = useSidebar as jest.MockedFunction<typeof useSidebar>

describe('CreateEventOpener', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useSidebarMock.mockReturnValue({
      isMobile: false,
      setOpenMobile: mockSetOpenMobile,
    } as ReturnType<typeof useSidebar>)
  })

  describe('basic rendering', () => {
    it('renders a sidebar menu button with label text', () => {
      render(<CreateEventOpener />)
      expect(screen.getByTestId('sidebar-menu-button')).toBeInTheDocument()
      expect(screen.getAllByText('Create Event').length).toBeGreaterThanOrEqual(1)
    })

    it('renders calendar plus icon', () => {
      render(<CreateEventOpener />)
      expect(screen.getByTestId('calendar-plus-icon')).toBeInTheDocument()
    })
  })

  describe('configuration', () => {
    it('passes expected layout classes to SidebarMenuButton', () => {
      render(<CreateEventOpener />)
      const btn = screen.getByTestId('sidebar-menu-button')
      expect(btn).toHaveClass(
        'h-10',
        'justify-center',
        'rounded-lg',
        'border-2',
        'text-lg'
      )
      expect(btn.className).toContain('group-data-[collapsible=icon]')
    })
  })

  describe('accessibility', () => {
    it('exposes screen-reader label for the action', () => {
      render(<CreateEventOpener />)
      const sr = document.querySelector('.sr-only')
      expect(sr).toHaveTextContent('Create Event')
    })

    it('uses a native button with accessible name containing Create Event', () => {
      render(<CreateEventOpener />)
      expect(
        screen.getByRole('button', { name: /Create Event/ })
      ).toBeInTheDocument()
    })
  })

  describe('integration', () => {
    it('dispatches requestCreateEvent on click when not mobile', async () => {
      const user = userEvent.setup()
      render(<CreateEventOpener />)
      await user.click(screen.getByTestId('sidebar-menu-button'))
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledTimes(1)
        expect(mockDispatch).toHaveBeenCalledWith(requestCreateEvent())
      })
      expect(mockSetOpenMobile).not.toHaveBeenCalled()
    })

    it('closes mobile sidebar then dispatches when isMobile', async () => {
      const user = userEvent.setup()
      useSidebarMock.mockReturnValue({
        isMobile: true,
        setOpenMobile: mockSetOpenMobile,
      } as ReturnType<typeof useSidebar>)
      render(<CreateEventOpener />)
      await user.click(screen.getByTestId('sidebar-menu-button'))
      await waitFor(() => {
        expect(mockSetOpenMobile).toHaveBeenCalledWith(false)
        expect(mockDispatch).toHaveBeenCalledWith(requestCreateEvent())
      })
    })
  })

  describe('component stability', () => {
    it('renders consistently across two mounts', () => {
      const { unmount } = render(<CreateEventOpener />)
      expect(screen.getByTestId('sidebar-menu-button')).toBeInTheDocument()
      unmount()
      render(<CreateEventOpener />)
      expect(screen.getByTestId('sidebar-menu-button')).toBeInTheDocument()
    })
  })
})
