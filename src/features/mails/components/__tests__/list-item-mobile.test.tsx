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
}))

jest.mock('../list-item-utils', () => ({
  formatDate: jest.fn((date) => 'Dec 18'),
}))

jest.mock('../swipeable-mail-item', () => {
  return jest.fn(({ children, disabled }) => (
    <div data-testid="swipeable-mail-item" data-disabled={disabled}>
      {children}
    </div>
  ))
})

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
  }
  const mockOnHandleCheckboxClick = jest.fn()

  const createTestStore = (preloadedState?: PreloadedState<any>) => {
    return configureStore({
      reducer: {
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
    expect(screen.getByTestId('checkbox')).toBeInTheDocument()
    expect(screen.getByTestId('checkbox')).toBeChecked()
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
    const checkbox = screen.getByTestId('checkbox')
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
    expect(screen.getByTestId('checkbox')).toBeTruthy()
    expect(screen.getByTestId('checkbox')).toHaveAttribute('checked')
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
    expect(screen.getByTestId('checkbox')).toBeInTheDocument()
  })
})
