import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key) => key),
}))

// Mock next/navigation
const mockSearchParams = new URLSearchParams()
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(() => mockSearchParams),
}))

// Mock i18n navigation
const mockPush = jest.fn()
jest.mock('@/lib/i18n/navigation', () => ({
  useRouter: jest.fn(() => ({ push: mockPush })),
  usePathname: jest.fn(() => '/en/mails'),
}))

// Mock Redux hooks
const mockDispatch = jest.fn()
let mockIsComposeOpen = false
jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: jest.fn(() => mockDispatch),
  useAppSelector: jest.fn((selector) => {
    // Return the mocked state based on the selector
    return mockIsComposeOpen
  }),
}))

// Mock the store actions/selectors
jest.mock('../../store', () => ({
  closeCompose: jest.fn(() => ({ type: 'mailCompose/closeCompose' })),
  openCompose: jest.fn(() => ({ type: 'mailCompose/openCompose' })),
  selectIsComposeOpen: jest.fn((state) => state?.mailCompose?.isComposeOpen),
}))

// Mock the compose module CSS
jest.mock('../compose/compose.module.css', () => ({
  compose_editor: 'compose_editor',
}))

// Mock the CustomEditor component
jest.mock('../compose/compose', () => {
  return function MockCustomEditor() {
    return <div data-testid="custom-editor">Editor</div>
  }
})

// Mock the ComposeHeader component
jest.mock('../compose/compose-header', () => {
  return function MockComposeHeader({ onClose }) {
    return (
      <div data-testid="compose-header">
        <button data-testid="header-close-btn" onClick={onClose}>
          Close Header
        </button>
      </div>
    )
  }
})

// Mock window.open
const mockWindowOpen = jest.fn()
window.open = mockWindowOpen

// Import after mocks
import { FloatingCompose } from '../compose/floating-compose'

describe('FloatingCompose Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIsComposeOpen = false
  })

  it('renders nothing when compose is closed', () => {
    mockIsComposeOpen = false
    const { container } = render(<FloatingCompose />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the floating compose when compose is open', () => {
    mockIsComposeOpen = true
    render(<FloatingCompose />)
    expect(screen.getByText('new_message.string')).toBeInTheDocument()
    expect(screen.getByTestId('custom-editor')).toBeInTheDocument()
    expect(screen.getByTestId('compose-header')).toBeInTheDocument()
  })

  it('renders the title bar with minimize, maximize and close buttons', () => {
    mockIsComposeOpen = true
    render(<FloatingCompose />)
    expect(screen.getByText('new_message.string')).toBeInTheDocument()
    // Check for minimize, maximize and close buttons by their sr-only text
    expect(screen.getByText('minimize.string')).toBeInTheDocument()
    expect(screen.getByText('maximize.string')).toBeInTheDocument()
    expect(screen.getByText('close.string')).toBeInTheDocument()
  })

  it('minimizes when clicking the minimize button', () => {
    mockIsComposeOpen = true
    render(<FloatingCompose />)

    // Initially, editor should be visible
    expect(screen.getByTestId('custom-editor')).toBeInTheDocument()

    // Click minimize button
    const minimizeButton = screen.getByText('minimize.string').closest('button')
    fireEvent.click(minimizeButton)

    // After minimizing, editor should not be visible
    expect(screen.queryByTestId('custom-editor')).not.toBeInTheDocument()
    // Restore button should appear
    expect(screen.getByText('restore.string')).toBeInTheDocument()
  })

  it('restores when clicking the restore button after minimizing', () => {
    mockIsComposeOpen = true
    render(<FloatingCompose />)

    // Click minimize button
    const minimizeButton = screen.getByText('minimize.string').closest('button')
    fireEvent.click(minimizeButton)

    // Click restore button
    const restoreButton = screen.getByText('restore.string').closest('button')
    fireEvent.click(restoreButton)

    // Editor should be visible again
    expect(screen.getByTestId('custom-editor')).toBeInTheDocument()
  })

  it('restores when clicking the title bar when minimized', () => {
    mockIsComposeOpen = true
    render(<FloatingCompose />)

    // Click minimize button
    const minimizeButton = screen.getByText('minimize.string').closest('button')
    fireEvent.click(minimizeButton)

    // Click title bar (contains the new_message.string text)
    const titleBar = screen.getByText('new_message.string').closest('div')
    fireEvent.click(titleBar)

    // Editor should be visible again
    expect(screen.getByTestId('custom-editor')).toBeInTheDocument()
  })

  it('dispatches closeCompose and updates URL when clicking the close button', () => {
    mockIsComposeOpen = true
    render(<FloatingCompose />)

    const closeButton = screen.getByText('close.string').closest('button')
    fireEvent.click(closeButton)

    expect(mockDispatch).toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalled()
  })

  it('renders footer buttons with correct labels', () => {
    mockIsComposeOpen = true
    render(<FloatingCompose />)

    expect(screen.getByText('save_draft.string')).toBeInTheDocument()
    expect(screen.getByText('send.string')).toBeInTheDocument()
  })

  it('maximizes when clicking the maximize button', () => {
    mockIsComposeOpen = true
    render(<FloatingCompose />)

    // Click maximize button
    const maximizeButton = screen.getByText('maximize.string').closest('button')
    fireEvent.click(maximizeButton)

    // Now restore button should appear (for the maximized state)
    expect(screen.getByText('restore.string')).toBeInTheDocument()
  })

  it('opens compose in new page when clicking external link button', () => {
    mockIsComposeOpen = true
    render(<FloatingCompose />)

    // Find and click the open in new page button
    const openInNewPageButton = screen
      .getByText('open_in_new_page.string')
      .closest('button')
    fireEvent.click(openInNewPageButton)

    expect(mockDispatch).toHaveBeenCalled()
    expect(mockWindowOpen).toHaveBeenCalledWith('/en/compose', '_blank')
  })
})
