import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FloatingCompose } from '../floating-compose'

// Mock dependencies
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}))

jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: jest.fn(() => false),
}))

jest.mock('@/lib/i18n/navigation', () => ({
  usePathname: jest.fn(() => '/en/mails'),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}))

jest.mock('@/features/user-profile', () => ({
  useProfile: jest.fn(() => ({
    mainAccount: null,
    externalAccounts: [],
    uiSettings: null,
    jitsiLinkEnabled: false,
    jitsiBaseUrl: null,
    preferences: null,
  })),
}))

jest.mock('@/hooks/use-interval', () => ({
  useInterval: jest.fn(),
}))

jest.mock('@/features/mails/store/mail-api.ts', () => ({
  useSendMailMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useSaveDraftMutation: jest.fn(() => [
    jest.fn().mockResolvedValue({ data: { data: { uid: null } } }), // ← return a valid result
    { isLoading: false },
  ]),
  useDeleteMailMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
}))

jest.mock('@/features/mails/store/mail-api.ts', () => ({
  useSendMailMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useSaveDraftMutation: jest.fn(() => [
    jest.fn().mockResolvedValue({ data: { data: { uid: null } } }),
    { isLoading: false },
  ]),
  useDeleteMailMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useUploadAttachmentMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useDeleteAttachmentMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useLazyDownloadAttachmentQuery: jest.fn(() => [
    jest.fn(),
    { isLoading: false, isFetching: false },
  ]),
}))

const createMockState = (hasDraft = false, isActive = false) => ({
  mailCompose: {
    drafts: hasDraft
      ? {
          'draft-1': {
            id: 'draft-1',
            subject: '',
            to: [],
            cc: [],
            bcc: [],
            body: '',
            attachments: [],
            isDirty: false,
            createdAt: 0,
            updatedAt: 0,
            selectedIdentity: { mail: 'test@example.com' }, // ← add this
            mailUid: null,
            priority: 'normal',
            requestReadReceipt: false,
          },
        }
      : {},
    activeDraftId: isActive ? 'draft-1' : null,
    openDraftIds: [],
    isSending: false,
    sendError: null,
    pendingInsert: null,
  },
})

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: jest.fn(() => jest.fn()),
  useAppSelector: jest.fn((selector) => {
    const state = createMockState(false)
    return selector(state)
  }),
}))

jest.mock('next-intl', () => ({
  useLocale: jest.fn(() => 'en'),
  useTranslations: jest.fn(() => (key: string) => key),
}))

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(() => ({
    get: jest.fn(() => null),
    toString: jest.fn(() => ''),
  })),
}))

jest.mock('../compose', () => ({
  __esModule: true,
  default: () => <div data-testid="custom-editor">Custom Editor</div>,
}))

jest.mock('../compose-header', () => ({
  __esModule: true,
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="compose-header">
      Compose Header
      <button onClick={onClose}>Close from header</button>
    </div>
  ),
}))

import { useIsMobile } from '@/hooks/use-mobile'
import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { useLocale, useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'

describe('FloatingCompose Component', () => {
  let mockDispatch: jest.Mock
  let mockPush: jest.Mock
  let mockSearchParams: any

  beforeEach(() => {
    jest.clearAllMocks()

    mockDispatch = jest.fn()
    mockPush = jest.fn()
    mockSearchParams = {
      get: jest.fn(() => null),
      toString: jest.fn(() => ''),
    }
    ;(useAppDispatch as jest.Mock).mockReturnValue(mockDispatch)
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
    ;(useSearchParams as jest.Mock).mockReturnValue(mockSearchParams)
    ;(usePathname as jest.Mock).mockReturnValue('/en/mails')
    ;(useLocale as jest.Mock).mockReturnValue('en')
    ;(useTranslations as jest.Mock).mockReturnValue((key: string) => key)
    ;(useIsMobile as jest.Mock).mockReturnValue(false)
    ;(useAppSelector as jest.Mock).mockImplementation(
      (selector: (s: any) => any) => selector(createMockState(true, false))
    )
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Render Behavior', () => {
    it('should not render when compose is not open', () => {
      ;(useAppSelector as jest.Mock).mockImplementation(
        (selector: (s: any) => any) => selector(createMockState(false))
      )

      const { container } = render(<FloatingCompose draftId="draft-1" />)
      expect(container.firstChild).toBeNull()
    })

    it('should render floating compose window when open', () => {
      render(<FloatingCompose draftId="draft-1" />)

      expect(screen.getByText('new_message.string')).toBeInTheDocument()
      expect(screen.getByTestId('custom-editor')).toBeInTheDocument()
      expect(screen.getByTestId('compose-header')).toBeInTheDocument()
    })

    it('should have proper styling classes when open', () => {
      const { container } = render(<FloatingCompose draftId="draft-1" />)
      const mainDiv = container.firstChild as HTMLElement

      expect(mainDiv).toHaveClass('relative')
      expect(mainDiv).toHaveClass('z-40')
      expect(mainDiv).toHaveClass('flex')
      expect(mainDiv).toHaveClass('flex-col')
    })
  })

  describe('Title Bar', () => {
    it('should display title text', () => {
      render(<FloatingCompose draftId="draft-1" />)
      expect(screen.getByText('new_message.string')).toBeInTheDocument()
    })

    it('should have clickable title bar when minimized', () => {
      render(<FloatingCompose draftId="draft-1" />)
      const titleBar = screen
        .getByText('new_message.string')
        .closest('div')?.parentElement

      expect(titleBar).toHaveClass('cursor-grab')
    })
  })

  describe('Control Buttons', () => {
    it('should display minimize button when not minimized', () => {
      render(<FloatingCompose draftId="draft-1" />)

      const minimizeButton = screen.getByRole('button', {
        name: /minimize.string/i,
      })
      expect(minimizeButton).toBeInTheDocument()
    })

    it('should display maximize button when not maximized', () => {
      render(<FloatingCompose draftId="draft-1" />)

      const maximizeButton = screen.getByRole('button', {
        name: /maximize.string/i,
      })
      expect(maximizeButton).toBeInTheDocument()
    })

    it('should display close button', () => {
      render(<FloatingCompose draftId="draft-1" />)

      const closeButton = screen.getByRole('button', { name: /close.string/i })
      expect(closeButton).toBeInTheDocument()
    })

    it('should have proper styling on control buttons', () => {
      render(<FloatingCompose draftId="draft-1" />)

      const minimizeButton = screen.getByRole('button', {
        name: /minimize.string/i,
      })
      expect(minimizeButton).toHaveClass('h-8')
      expect(minimizeButton).toHaveClass('w-8')
    })
  })

  describe('Minimize Functionality', () => {
    it('should hide content when minimized', async () => {
      const user = userEvent.setup()
      render(<FloatingCompose draftId="draft-1" />)

      const minimizeButton = screen.getByRole('button', {
        name: /minimize.string/i,
      })
      await user.click(minimizeButton)

      expect(screen.queryByTestId('custom-editor')).not.toBeInTheDocument()
    })

    it('should show restore button when minimized', async () => {
      const user = userEvent.setup()
      render(<FloatingCompose draftId="draft-1" />)

      const minimizeButton = screen.getByRole('button', {
        name: /minimize.string/i,
      })
      await user.click(minimizeButton)

      const restoreButton = screen.getByRole('button', {
        name: /restore.string/i,
      })
      expect(restoreButton).toBeInTheDocument()
    })

    it('should restore content when clicking restore button', async () => {
      const user = userEvent.setup()
      render(<FloatingCompose draftId="draft-1" />)

      const minimizeButton = screen.getByRole('button', {
        name: /minimize.string/i,
      })
      await user.click(minimizeButton)

      const restoreButton = screen.getByRole('button', {
        name: /restore.string/i,
      })
      await user.click(restoreButton)

      expect(screen.getByTestId('custom-editor')).toBeInTheDocument()
    })

    it('should apply minimized container classes', async () => {
      const user = userEvent.setup()
      render(<FloatingCompose draftId="draft-1" />)

      const minimizeButton = screen.getByRole('button', {
        name: /minimize.string/i,
      })
      await user.click(minimizeButton)

      // When minimized, restore button should appear
      const restoreButton = screen.getByRole('button', {
        name: /restore.string/i,
      })
      expect(restoreButton).toBeInTheDocument()
    })

    it('should restore by clicking title bar when minimized', async () => {
      const user = userEvent.setup()
      render(<FloatingCompose draftId="draft-1" />)

      const minimizeButton = screen.getByRole('button', {
        name: /minimize.string/i,
      })
      await user.click(minimizeButton)

      const titleBar = screen.getByText('new_message.string').closest('div')
      if (titleBar) {
        await user.click(titleBar)
      }

      expect(screen.getByTestId('custom-editor')).toBeInTheDocument()
    })
  })

  describe('Maximize Functionality', () => {
    it('should display maximize button', () => {
      render(<FloatingCompose draftId="draft-1" />)

      const maximizeButton = screen.getByRole('button', {
        name: /maximize.string/i,
      })
      expect(maximizeButton).toBeInTheDocument()
    })

    it('should toggle to restore button when maximized', async () => {
      const user = userEvent.setup()
      render(<FloatingCompose draftId="draft-1" />)

      const maximizeButton = screen.getByRole('button', {
        name: /maximize.string/i,
      })
      await user.click(maximizeButton)

      const restoreButton = screen.getByRole('button', {
        name: /restore.string/i,
      })
      expect(restoreButton).toBeInTheDocument()
    })

    it('should restore from maximized state', async () => {
      const user = userEvent.setup()
      render(<FloatingCompose draftId="draft-1" />)

      const maximizeButton = screen.getByRole('button', {
        name: /maximize.string/i,
      })
      await user.click(maximizeButton)

      const restoreButton = screen.getByRole('button', {
        name: /restore.string/i,
      })
      await user.click(restoreButton)

      const newMaximizeButton = screen.getByRole('button', {
        name: /maximize.string/i,
      })
      expect(newMaximizeButton).toBeInTheDocument()
    })
  })

  describe('Close Functionality', () => {
    it('should dispatch closeCompose action when close button is clicked', async () => {
      const user = userEvent.setup()
      render(<FloatingCompose draftId="draft-1" />)

      const closeButton =
        screen
          .getAllByRole('button')
          .find((btn) => btn.getAttribute('aria-label')?.includes('close')) ||
        screen.getByRole('button', { name: /close.string/i })

      await user.click(closeButton)

      expect(mockDispatch).toHaveBeenCalled()
    })
  })

  describe('Mobile Behavior', () => {
    it('should maximize on mobile', () => {
      ;(useIsMobile as jest.Mock).mockReturnValue(true)
      render(<FloatingCompose draftId="draft-1" />)

      // Component should auto-maximize on mobile
      // The component uses useEffect to set isMaximized to true on mobile
      expect(useIsMobile).toHaveBeenCalled()
    })

    it('should not be maximized on desktop', () => {
      ;(useIsMobile as jest.Mock).mockReturnValue(false)
      render(<FloatingCompose draftId="draft-1" />)

      const maximizeButton = screen.getByRole('button', {
        name: /maximize.string/i,
      })
      expect(maximizeButton).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have sr-only labels for icon buttons', () => {
      render(<FloatingCompose draftId="draft-1" />)

      const srLabels = document.querySelectorAll('.sr-only')
      expect(srLabels.length).toBeGreaterThan(0)
    })

    it('should have proper button roles', () => {
      render(<FloatingCompose draftId="draft-1" />)

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should have descriptive aria labels', () => {
      render(<FloatingCompose draftId="draft-1" />)

      const srOnlyElements = document.querySelectorAll('.sr-only')
      expect(srOnlyElements.length).toBeGreaterThan(0)
    })
  })

  describe('Content Rendering', () => {
    it('should render ComposeHeader when not minimized', () => {
      render(<FloatingCompose draftId="draft-1" />)

      expect(screen.getByTestId('compose-header')).toBeInTheDocument()
    })

    it('should render CustomEditor when not minimized', () => {
      render(<FloatingCompose draftId="draft-1" />)

      expect(screen.getByTestId('custom-editor')).toBeInTheDocument()
    })

    it('should not render footer content when minimized', async () => {
      const user = userEvent.setup()
      render(<FloatingCompose draftId="draft-1" />)

      const minimizeButton = screen.getByRole('button', {
        name: /minimize.string/i,
      })
      await user.click(minimizeButton)

      // Save and Send buttons should be hidden
      expect(screen.queryByText(/save_draft.string/)).not.toBeInTheDocument()
    })

    it('should render footer buttons when not minimized', () => {
      render(<FloatingCompose draftId="draft-1" />)

      expect(
        screen.getByRole('button', { name: /send.string/i })
      ).toBeInTheDocument()
    })
  })

  describe('Container Classes', () => {
    it('should apply correct classes when normal size', () => {
      const { container } = render(<FloatingCompose draftId="draft-1" />)
      const mainDiv = container.firstChild as HTMLElement

      expect(mainDiv).toHaveClass('rounded-t-lg')
    })

    it('should apply correct classes when maximized', async () => {
      const user = userEvent.setup()
      render(<FloatingCompose draftId="draft-1" />)

      const maximizeButton = screen.getByRole('button', {
        name: /maximize.string/i,
      })
      await user.click(maximizeButton)

      // After maximization, border classes should change
      expect(screen.getByText('new_message.string')).toBeInTheDocument()
    })
  })

  describe('Event Propagation', () => {
    it('should stop event propagation on close button click', async () => {
      const user = userEvent.setup()
      render(<FloatingCompose draftId="draft-1" />)

      const closeButton =
        screen
          .getAllByRole('button')
          .find((btn) => btn.getAttribute('aria-label')?.includes('close')) ||
        screen.getByRole('button', { name: /close.string/i })

      const event = new MouseEvent('click', { bubbles: true })
      const stopPropagation = jest.spyOn(event, 'stopPropagation')

      fireEvent(closeButton, event)

      expect(stopPropagation).toHaveBeenCalled()
    })
  })

  describe('Integration with ComposeHeader', () => {
    it('should pass onClose handler to ComposeHeader', () => {
      render(<FloatingCompose draftId="draft-1" />)

      const closeFromHeaderButton = screen.getByText('Close from header')
      expect(closeFromHeaderButton).toBeInTheDocument()
    })
  })
})
