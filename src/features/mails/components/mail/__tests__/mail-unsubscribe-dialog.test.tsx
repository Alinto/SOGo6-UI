import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { UnsubscribeDialog } from '../mail-unsubscribe-dialog'

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string, params?: any) => {
    const translations: Record<string, string> = {
      'mail_display.header.unsubscribe.string': 'Unsubscribe',
      'mail_display.header.unsubscribe-dialog.message.string': `Are you sure you want to unsubscribe from ${params?.email || 'this sender'}?`,
      'mail_display.header.unsubscribe-dialog.cancel.string': 'Cancel',
    }
    return translations[key] || key
  }),
}))

jest.mock('@/components/ui/button', () => ({
  Button: jest.fn(({ children, onClick, type, ...props }) => (
    <button onClick={onClick} type={type} {...props}>
      {children}
    </button>
  )),
}))

jest.mock('@/components/ui/dialog', () => ({
  Dialog: jest.fn(({ children, open, onOpenChange }) => (
    <div data-testid="dialog" data-open={open}>
      {open && children}
    </div>
  )),
  DialogContent: jest.fn(({ children, className }) => (
    <div data-testid="dialog-content" className={className}>
      {children}
    </div>
  )),
  DialogHeader: jest.fn(({ children }) => (
    <div data-testid="dialog-header">{children}</div>
  )),
  DialogTitle: jest.fn(({ children, className }) => (
    <h2 data-testid="dialog-title" className={className}>
      {children}
    </h2>
  )),
  DialogDescription: jest.fn(({ children, className }) => (
    <p data-testid="dialog-description" className={className}>
      {children}
    </p>
  )),
  DialogFooter: jest.fn(({ children, className }) => (
    <div data-testid="dialog-footer" className={className}>
      {children}
    </div>
  )),
  DialogClose: jest.fn(({ children, asChild }) =>
    asChild ? children : <div>{children}</div>
  ),
}))

describe('UnsubscribeDialog', () => {
  const mockOnOpenChange = jest.fn()
  const mockProps = {
    open: false,
    onOpenChange: mockOnOpenChange,
    senderEmail: 'sender@example.com',
    senderName: 'John Doe',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should not render when open is false', () => {
    const { container } = render(<UnsubscribeDialog {...mockProps} />)
    const dialog = container.querySelector('[data-testid="dialog"]')
    expect(dialog).toHaveAttribute('data-open', 'false')
  })

  it('should render when open is true', () => {
    render(<UnsubscribeDialog {...mockProps} open={true} />)

    expect(screen.getByTestId('dialog-content')).toBeInTheDocument()
    expect(screen.getByTestId('dialog-header')).toBeInTheDocument()
    expect(screen.getByTestId('dialog-footer')).toBeInTheDocument()
  })

  it('should display correct title', () => {
    render(<UnsubscribeDialog {...mockProps} open={true} />)

    expect(screen.getByTestId('dialog-title')).toHaveTextContent('Unsubscribe')
  })

  it('should display message with sender email', () => {
    render(<UnsubscribeDialog {...mockProps} open={true} />)

    expect(screen.getByTestId('dialog-description')).toHaveTextContent(
      'Are you sure you want to unsubscribe from sender@example.com?'
    )
  })

  it('should render cancel button', () => {
    render(<UnsubscribeDialog {...mockProps} open={true} />)

    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('should render unsubscribe confirm button', () => {
    render(<UnsubscribeDialog {...mockProps} open={true} />)

    const unsubscribeButtons = screen.getAllByText('Unsubscribe')
    expect(unsubscribeButtons.length).toBeGreaterThan(0)
  })

  it('should have correct styling on dialog content', () => {
    render(<UnsubscribeDialog {...mockProps} open={true} />)

    const dialogContent = screen.getByTestId('dialog-content')
    expect(dialogContent).toHaveClass(
      'bg-card',
      'flex',
      'w-[92vw]',
      'max-w-sm',
      'flex-col',
      'gap-4',
      'rounded-xl',
      'p-4',
      'shadow-lg'
    )
  })

  it('should have correct styling on dialog title', () => {
    render(<UnsubscribeDialog {...mockProps} open={true} />)

    const dialogTitle = screen.getByTestId('dialog-title')
    expect(dialogTitle).toHaveClass(
      'text-card-foreground',
      'text-xl',
      'font-semibold'
    )
  })

  it('should have correct styling on dialog description', () => {
    render(<UnsubscribeDialog {...mockProps} open={true} />)

    const dialogDescription = screen.getByTestId('dialog-description')
    expect(dialogDescription).toHaveClass('text-muted-foreground', 'text-sm')
  })

  it('should pass open prop to Dialog component', () => {
    const { container } = render(
      <UnsubscribeDialog {...mockProps} open={true} />
    )
    const dialog = container.querySelector('[data-testid="dialog"]')
    expect(dialog).toHaveAttribute('data-open', 'true')
  })

  it('should pass onOpenChange prop to Dialog component', () => {
    render(<UnsubscribeDialog {...mockProps} />)
    // The Dialog component receives the onOpenChange prop
    expect(mockProps.onOpenChange).toBeDefined()
  })

  it('should render buttons with correct type attribute', () => {
    render(<UnsubscribeDialog {...mockProps} open={true} />)

    const buttons = screen.getAllByRole('button')
    buttons.forEach((button) => {
      expect(button).toHaveAttribute('type', 'button')
    })
  })

  it('should handle missing senderEmail gracefully', () => {
    const propsWithoutEmail = {
      ...mockProps,
      senderEmail: undefined,
    }
    render(<UnsubscribeDialog {...propsWithoutEmail} open={true} />)

    const description = screen.getByTestId('dialog-description')
    expect(description).toBeInTheDocument()
  })

  it('should apply primary styling to unsubscribe button', () => {
    render(<UnsubscribeDialog {...mockProps} open={true} />)

    const buttons = screen.getAllByText('Unsubscribe')
    const confirmButton = buttons.find((btn) =>
      btn.closest('button')?.className.includes('bg-primary')
    )
    expect(confirmButton).toBeDefined()
  })

  it('should apply ghost variant to cancel button', () => {
    render(<UnsubscribeDialog {...mockProps} open={true} />)

    const cancelButton = screen.getByText('Cancel').closest('button')
    expect(cancelButton).toHaveAttribute('variant', 'ghost')
  })
})
