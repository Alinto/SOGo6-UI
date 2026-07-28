import { mailComposeReducer } from '@/features/mails/store'
import { apiSlice } from '@/lib/redux/api/api-slice'
import { configureStore } from '@reduxjs/toolkit'
import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import ListItemDesktop from '../list-item-desktop'

// ── Mocks ──────────────────────────────────────────────────────────────────
jest.mock('next/navigation', () => ({
  useParams: jest.fn(() => ({ mail_id: '456' })),
}))

jest.mock('@/lib/i18n/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
  usePathname: jest.fn(() => '/u/test@example.com/inbox'),
}))

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}))

jest.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children }: any) => <div data-testid="avatar">{children}</div>,
  AvatarImage: () => <img data-testid="avatar-image" />,
  AvatarFallback: ({ children }: any) => (
    <div data-testid="avatar-fallback">{children}</div>
  ),
}))

jest.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({ checked, onClick }: any) => (
    <input
      type="checkbox"
      data-testid="checkbox"
      checked={checked}
      onClick={onClick}
      onChange={() => {}}
    />
  ),
}))

jest.mock('@/components/ui/separator', () => ({
  Separator: () => <hr data-testid="separator" />,
}))

jest.mock('@/components/ui/tooltip', () => ({
  TooltipWrapper: ({ children, content }: any) => (
    <div data-testid="tooltip-wrapper" data-content={content}>
      {children}
    </div>
  ),
}))

jest.mock('lucide-react', () => ({
  Paperclip: () => <span data-testid="paperclip-icon">📎</span>,
  Star: ({ onClick }: any) => (
    <button data-testid="star-icon" onClick={onClick}>
      ⭐
    </button>
  ),
  Mail: () => <span data-testid="mail-icon" />,
  MailOpen: () => <span data-testid="mail-open-icon" />,
  Trash2: () => <span data-testid="trash-icon" />,
  Archive: () => <span data-testid="archive-icon" />,
  Calendar: () => <span data-testid="calendar-icon" />,
  ChevronsUp: () => <span data-testid="chevrons-up-icon" />,
  Forward: () => <span data-testid="forward-icon" />,
  Reply: () => <span data-testid="reply-icon" />,
  User: () => <span data-testid="user-icon" />,
}))

jest.mock('../list-item-utils', () => ({
  formatDate: jest.fn(() => 'Dec 18'),
}))

jest.mock('@/features/mails/hooks/use-current-folder', () => ({
  useCurrentFolder: jest.fn(() => ({ folderType: 'INBOX' })),
}))

jest.mock('@/features/mails/hooks/use-open-draft-on-click', () => ({
  useOpenDraftOnClick: jest.fn(() => ({
    openDraftIfNeeded: jest.fn(async () => false),
  })),
}))

// ── Setup ──────────────────────────────────────────────────────────────────
const mockData = {
  id: '123',
  subject: 'Test Email Subject',
  from: { name: 'John Doe', email: 'john@example.com' },
  to: [{ name: 'Jane Smith', email: 'jane@example.com' }],
  date: new Date().toISOString(),
  seen: false,
  flagged: false,
  hasAttachment: true,
  snippet: 'This is a test email snippet',
  answered: false,
  forwarded: false,
  deleted: false,
  priority: 3,
  mailType: [] as string[],
}

const defaultProps = {
  data: mockData,
  isSelected: false,
  onHandleCheckboxClick: jest.fn(),
}

const createTestStore = () =>
  configureStore({
    reducer: {
      mailCompose: mailComposeReducer,
      [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(apiSlice.middleware),
  })

const renderWithRedux = (ui: React.ReactElement) =>
  render(<Provider store={createTestStore()}>{ui}</Provider>)

beforeEach(() => jest.clearAllMocks())

// ── Tests ──────────────────────────────────────────────────────────────────
describe('ListItemDesktop', () => {
  it('renders sender name and subject', () => {
    renderWithRedux(<ListItemDesktop {...defaultProps} />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Test Email Subject')).toBeInTheDocument()
  })

  it('renders avatar with sender initial', () => {
    renderWithRedux(<ListItemDesktop {...defaultProps} />)
    expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('J')
  })

  it('shows attachment icon when hasAttachment is true', () => {
    renderWithRedux(<ListItemDesktop {...defaultProps} />)
    expect(screen.getByTestId('paperclip-icon')).toBeInTheDocument()
  })

  it('hides attachment icon when hasAttachment is false', () => {
    renderWithRedux(
      <ListItemDesktop
        {...defaultProps}
        data={{ ...mockData, hasAttachment: false }}
      />
    )
    expect(screen.queryByTestId('paperclip-icon')).not.toBeInTheDocument()
  })

  it('shows checkbox when isSelected is true', () => {
    renderWithRedux(<ListItemDesktop {...defaultProps} isSelected />)
    expect(screen.getByTestId('mail-list-item-checkbox')).toBeInTheDocument()
  })

  it('shows action buttons on hover', () => {
    renderWithRedux(<ListItemDesktop {...defaultProps} />)
    const container = screen.getByText('John Doe').closest('div')!
    fireEvent.mouseEnter(container)
    expect(screen.getByTestId('trash-icon')).toBeInTheDocument()
    expect(screen.getByTestId('archive-icon')).toBeInTheDocument()
  })

  it('shows checkbox on hover', () => {
    renderWithRedux(<ListItemDesktop {...defaultProps} />)
    const container = screen.getByText('John Doe').closest('div')!
    fireEvent.mouseEnter(container)
    expect(screen.getByTestId('mail-list-item-checkbox')).toBeInTheDocument()
  })

  it('hides checkbox on mouse leave', () => {
    renderWithRedux(<ListItemDesktop {...defaultProps} />)
    const container = screen.getByText('John Doe').closest('div')!
    fireEvent.mouseEnter(container)
    fireEvent.mouseLeave(container)
    expect(screen.queryByTestId('mail-list-item-checkbox')).toBeInTheDocument()
  })

  it('calls onHandleCheckboxClick when checkbox clicked', () => {
    renderWithRedux(<ListItemDesktop {...defaultProps} isSelected />)
    fireEvent.click(screen.getByTestId('mail-list-item-checkbox'))
    expect(defaultProps.onHandleCheckboxClick).toHaveBeenCalledWith(
      expect.any(Object),
      mockData
    )
  })

  it('applies font-semibold for unread emails', () => {
    renderWithRedux(<ListItemDesktop {...defaultProps} />)
    expect(screen.getByText('John Doe')).toHaveClass('font-semibold')
  })

  it('applies muted style for read emails', () => {
    renderWithRedux(
      <ListItemDesktop {...defaultProps} data={{ ...mockData, seen: true }} />
    )
    expect(screen.getByText('John Doe')).toHaveClass('text-muted-foreground')
  })

  it('falls back to email when name is empty', () => {
    renderWithRedux(
      <ListItemDesktop
        {...defaultProps}
        data={{ ...mockData, from: { name: '', email: 'john@example.com' } }}
      />
    )
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('renders separator', () => {
    renderWithRedux(<ListItemDesktop {...defaultProps} />)
    expect(screen.getByTestId('separator')).toBeInTheDocument()
  })

  it('calls onToggleFlag when star icon is clicked without navigating', () => {
    const onToggleFlag = jest.fn()
    renderWithRedux(
      <ListItemDesktop {...defaultProps} onToggleFlag={onToggleFlag} />
    )
    fireEvent.click(screen.getByTestId('star-icon'))
    expect(onToggleFlag).toHaveBeenCalledWith('123')
  })

  it('shows a "highest priority" tooltip on the priority icon for priority 1', () => {
    renderWithRedux(
      <ListItemDesktop {...defaultProps} data={{ ...mockData, priority: 1 }} />
    )
    expect(screen.getByTestId('chevrons-up-icon')).toBeInTheDocument()
    expect(
      screen
        .getByTestId('chevrons-up-icon')
        .closest('[data-testid="tooltip-wrapper"]')
    ).toHaveAttribute('data-content', 'priority.highest.string')
  })

  it('shows a "high priority" tooltip on the priority icon for priority 2', () => {
    renderWithRedux(
      <ListItemDesktop {...defaultProps} data={{ ...mockData, priority: 2 }} />
    )
    expect(
      screen
        .getByTestId('chevrons-up-icon')
        .closest('[data-testid="tooltip-wrapper"]')
    ).toHaveAttribute('data-content', 'priority.high.string')
  })

  it('hides the priority icon for normal priority', () => {
    renderWithRedux(
      <ListItemDesktop {...defaultProps} data={{ ...mockData, priority: 3 }} />
    )
    expect(screen.queryByTestId('chevrons-up-icon')).not.toBeInTheDocument()
  })
})
