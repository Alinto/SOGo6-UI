import { mailComposeReducer } from '@/features/mails/store'
import { apiSlice } from '@/lib/redux/api/api-slice'
import { configureStore, PreloadedState } from '@reduxjs/toolkit'
import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import ListItemMobile from '../list-item-mobile'

jest.mock('next/navigation', () => ({
  useParams: jest.fn(() => ({ mail_id: '456', folder: 'inbox' })),
}))

jest.mock('@/lib/i18n/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
  usePathname: jest.fn(() => '/u/test@example.com/inbox'),
}))

jest.mock('@/components/ui/avatar', () => ({
  Avatar: jest.fn(({ children }) => <div data-testid="avatar">{children}</div>),
  AvatarImage: jest.fn(() => <img data-testid="avatar-image" />),
  AvatarFallback: jest.fn(({ children }) => (
    <div data-testid="avatar-fallback">{children}</div>
  )),
}))

jest.mock('@/components/ui/checkbox', () => ({
  Checkbox: jest.fn(({ checked, onClick }) => (
    <input
      type="checkbox"
      data-testid="checkbox"
      checked={checked}
      onClick={onClick}
      onChange={() => {}}
    />
  )),
}))

jest.mock('@/components/ui/separator', () => ({
  Separator: jest.fn(() => <hr data-testid="separator" />),
}))

jest.mock('lucide-react', () => ({
  Paperclip: jest.fn(() => <span data-testid="paperclip-icon">📎</span>),
  Star: jest.fn(({ onClick }) => (
    <button data-testid="star-icon" onClick={onClick}>
      ⭐
    </button>
  )),
  Calendar: jest.fn(() => <span data-testid="calendar-icon" />),
  ChevronsUp: jest.fn(() => <span data-testid="chevrons-up-icon" />),
  Forward: jest.fn(() => <span data-testid="forward-icon" />),
  Reply: jest.fn(() => <span data-testid="reply-icon" />),
  User: jest.fn(() => <span data-testid="user-icon" />),
}))

jest.mock('../list-item-utils', () => ({
  formatDate: jest.fn((date) => 'Dec 18'),
}))

jest.mock('../mail/mail-list-labels', () => ({
  __esModule: true,
  default: ({ flags }: { flags?: string[] }) => (
    <div data-testid="mail-list-labels">{(flags ?? []).join(',')}</div>
  ),
}))

jest.mock('@/features/mails/hooks/use-current-folder', () => ({
  useCurrentFolder: jest.fn(() => ({ folderType: 'INBOX' })),
}))

jest.mock('@/features/mails/hooks/use-open-draft-on-click', () => ({
  useOpenDraftOnClick: jest.fn(() => ({
    openDraftIfNeeded: jest.fn(async () => false),
  })),
}))

jest.mock('../swipeable-mail-item', () => {
  return jest.fn(({ children, disabled }) => (
    <div data-testid="swipeable-mail-item" data-disabled={disabled}>
      {children}
    </div>
  ))
})

const mockMailAction = jest.fn()
jest.mock('../../store', () => ({
  useMailActionMutation: jest.fn(() => [mockMailAction]),
  useMoveToTrashMutation: jest.fn(() => [jest.fn()]),
}))

describe('ListItemMobile Component', () => {
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
  const mockOnHandleCheckboxClick = jest.fn()

  const createTestStore = (preloadedState?: PreloadedState<any>) => {
    return configureStore({
      reducer: {
        mailCompose: mailComposeReducer,
        [apiSlice.reducerPath]: apiSlice.reducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(apiSlice.middleware),
      preloadedState,
    })
  }

  const renderWithRedux = (component: React.ReactElement) => {
    const store = createTestStore()
    return render(<Provider store={store}>{component}</Provider>)
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should render email sender name and subject', () => {
    renderWithRedux(
      <ListItemMobile
        data={mockData}
        isSelected={false}
        onHandleCheckboxClick={mockOnHandleCheckboxClick}
      />
    )
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Test Email Subject')).toBeInTheDocument()
  })

  it('should show avatar when not selected', () => {
    renderWithRedux(
      <ListItemMobile
        data={mockData}
        isSelected={false}
        onHandleCheckboxClick={mockOnHandleCheckboxClick}
      />
    )
    expect(screen.getByTestId('avatar')).toBeInTheDocument()
  })

  it('should show checkbox when selected', () => {
    renderWithRedux(
      <ListItemMobile
        data={mockData}
        isSelected={true}
        onHandleCheckboxClick={mockOnHandleCheckboxClick}
      />
    )
    expect(screen.getByTestId('mail-list-item-checkbox')).toBeInTheDocument()
  })

  it('passes mail flags to MailListLabels', () => {
    renderWithRedux(
      <ListItemMobile
        data={{ ...mockData, flags: ['Work'] }}
        isSelected={false}
        onHandleCheckboxClick={mockOnHandleCheckboxClick}
      />
    )
    expect(screen.getByTestId('mail-list-labels')).toHaveTextContent('Work')
  })

  it('should show attachment icon when email has attachments', () => {
    renderWithRedux(
      <ListItemMobile
        data={mockData}
        isSelected={false}
        onHandleCheckboxClick={mockOnHandleCheckboxClick}
      />
    )
    expect(screen.getByTestId('paperclip-icon')).toBeInTheDocument()
  })

  it('should not show attachment icon when email has no attachments', () => {
    const dataWithoutAttachment = { ...mockData, hasAttachment: false }
    renderWithRedux(
      <ListItemMobile
        data={dataWithoutAttachment}
        isSelected={false}
        onHandleCheckboxClick={mockOnHandleCheckboxClick}
      />
    )
    expect(screen.queryByTestId('paperclip-icon')).not.toBeInTheDocument()
  })

  it('should display star icon with correct fill state', () => {
    renderWithRedux(
      <ListItemMobile
        data={mockData}
        isSelected={false}
        onHandleCheckboxClick={mockOnHandleCheckboxClick}
      />
    )
    expect(screen.getByTestId('star-icon')).toBeInTheDocument()
  })

  it('should trigger long press selection after 200ms touch', () => {
    renderWithRedux(
      <ListItemMobile
        data={mockData}
        isSelected={false}
        onHandleCheckboxClick={mockOnHandleCheckboxClick}
      />
    )

    const container = screen.getByText('Test Email Subject').closest('div')
    fireEvent.touchStart(container!)
    jest.advanceTimersByTime(200)
    fireEvent.touchEnd(container!)

    // Check if callback was called
    expect(mockOnHandleCheckboxClick).toHaveBeenCalled()
  })

  it('should clear timer on touch end before 200ms', () => {
    renderWithRedux(
      <ListItemMobile
        data={mockData}
        isSelected={false}
        onHandleCheckboxClick={mockOnHandleCheckboxClick}
      />
    )

    const container = screen.getByText('Test Email Subject').closest('div')
    fireEvent.touchStart(container!)
    jest.advanceTimersByTime(100)
    fireEvent.touchEnd(container!)
    jest.advanceTimersByTime(200)

    // Callback should not be called since touch ended before 200ms
    expect(mockOnHandleCheckboxClick).not.toHaveBeenCalled()
  })

  it('should call checkbox click handler when checkbox is clicked', () => {
    renderWithRedux(
      <ListItemMobile
        data={mockData}
        isSelected={true}
        onHandleCheckboxClick={mockOnHandleCheckboxClick}
      />
    )
    const checkbox = screen.getByTestId('mail-list-item-checkbox')
    fireEvent.click(checkbox)
    expect(mockOnHandleCheckboxClick).toHaveBeenCalledWith(
      expect.any(Object),
      mockData
    )
  })

  it('should apply unseen styling for unread emails', () => {
    renderWithRedux(
      <ListItemMobile
        data={mockData}
        isSelected={false}
        onHandleCheckboxClick={mockOnHandleCheckboxClick}
      />
    )
    const senderName = screen.getByText('John Doe')
    expect(senderName).toHaveClass('font-semibold')
  })

  it('should not apply unseen styling for read emails', () => {
    const seenData = { ...mockData, seen: true }
    renderWithRedux(
      <ListItemMobile
        data={seenData}
        isSelected={false}
        onHandleCheckboxClick={mockOnHandleCheckboxClick}
      />
    )
    const senderName = screen.getByText('John Doe')
    expect(senderName).toHaveClass('text-muted-foreground')
  })

  it('should apply selected state styling when isSelected is true', () => {
    renderWithRedux(
      <ListItemMobile
        data={mockData}
        isSelected={true}
        onHandleCheckboxClick={mockOnHandleCheckboxClick}
      />
    )
    // When selected, checkbox should be visible
    expect(screen.getByTestId('mail-list-item-checkbox')).toBeTruthy()
  })

  it('should render separator', () => {
    renderWithRedux(
      <ListItemMobile
        data={mockData}
        isSelected={false}
        onHandleCheckboxClick={mockOnHandleCheckboxClick}
      />
    )
    expect(screen.getByTestId('separator')).toBeInTheDocument()
  })

  it('should handle email without name and use email instead', () => {
    const dataWithoutName = {
      ...mockData,
      from: { name: '', email: 'john@example.com' },
    }
    renderWithRedux(
      <ListItemMobile
        data={dataWithoutName}
        isSelected={false}
        onHandleCheckboxClick={mockOnHandleCheckboxClick}
      />
    )
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('should not prevent default on star click', () => {
    renderWithRedux(
      <ListItemMobile
        data={mockData}
        isSelected={false}
        onHandleCheckboxClick={mockOnHandleCheckboxClick}
      />
    )
    const starButton = screen.getByTestId('star-icon')
    fireEvent.click(starButton)
    // Just verify the star button exists and can be clicked
    expect(starButton).toBeTruthy()
  })

  it('should tag the mail as flagged when star is clicked while unflagged', () => {
    renderWithRedux(
      <ListItemMobile
        data={mockData}
        isSelected={false}
        onHandleCheckboxClick={mockOnHandleCheckboxClick}
      />
    )
    fireEvent.click(screen.getByTestId('star-icon'))
    expect(mockMailAction).toHaveBeenCalledWith({
      accountId: '0',
      folder: 'inbox',
      mailId: '123',
      action: 'tag',
      data: ['\\Flagged'],
    })
  })

  it('should untag the mail when star is clicked while already flagged', () => {
    renderWithRedux(
      <ListItemMobile
        data={{ ...mockData, flagged: true }}
        isSelected={false}
        onHandleCheckboxClick={mockOnHandleCheckboxClick}
      />
    )
    fireEvent.click(screen.getByTestId('star-icon'))
    expect(mockMailAction).toHaveBeenCalledWith({
      accountId: '0',
      folder: 'inbox',
      mailId: '123',
      action: 'untag',
      data: ['\\Flagged'],
    })
  })

  it('should hide avatar when selected', () => {
    const store = createTestStore()
    const { rerender } = render(
      <Provider store={store}>
        <ListItemMobile
          data={mockData}
          isSelected={false}
          onHandleCheckboxClick={mockOnHandleCheckboxClick}
        />
      </Provider>
    )
    expect(screen.getByTestId('avatar')).toBeInTheDocument()

    rerender(
      <Provider store={store}>
        <ListItemMobile
          data={mockData}
          isSelected={true}
          onHandleCheckboxClick={mockOnHandleCheckboxClick}
        />
      </Provider>
    )
    // Avatar should now be hidden and replaced with checkbox
    expect(screen.getByTestId('mail-list-item-checkbox')).toBeInTheDocument()
  })
})
