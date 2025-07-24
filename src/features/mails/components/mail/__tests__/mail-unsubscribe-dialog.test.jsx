import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UnsubscribeDialog } from '../mail-unsubscribe-dialog'

jest.mock('next-intl', () => ({
  useTranslations: () => (key) => {
    const translations = {
      'mail_display.header.unsubscribe.string': 'Unsubscribe',
      'mail_display.header.unsubscribe-dialog.message.string':
        'Are you sure you want to unsubscribe from emails from this sender?',
      'mail_display.header.unsubscribe-dialog.cancel.string': 'Cancel',
    }
    return translations[key] || key
  },
}))

describe('UnsubscribeDialog', () => {
  const mockOnOpenChange = jest.fn()
  const defaultProps = {
    open: true,
    onOpenChange: mockOnOpenChange,
    senderEmail: 'test@example.com',
    senderName: 'Test Sender',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders dialog when open is true', () => {
    render(<UnsubscribeDialog {...defaultProps} />)

    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
  })

  it('does not render dialog when open is false', () => {
    render(<UnsubscribeDialog {...defaultProps} open={false} />)

    const dialog = screen.queryByRole('dialog')
    expect(dialog).not.toBeInTheDocument()
  })

  it('displays correct title', () => {
    render(<UnsubscribeDialog {...defaultProps} />)
    // Cible uniquement le titre
    const title = screen.getByRole('heading', { name: 'Unsubscribe' })
    expect(title).toBeInTheDocument()
  })

  it('displays message with sender email', () => {
    render(<UnsubscribeDialog {...defaultProps} />)

    const message = screen.getByText(
      /Are you sure you want to unsubscribe from emails from this sender\? \(test@example\.com\)/
    )
    expect(message).toBeInTheDocument()
  })

  it('displays message without sender email when not provided', () => {
    const propsWithoutEmail = { ...defaultProps, senderEmail: undefined }
    render(<UnsubscribeDialog {...propsWithoutEmail} />)

    const message = screen.getByText(
      'Are you sure you want to unsubscribe from emails from this sender?'
    )
    expect(message).toBeInTheDocument()
    expect(message).not.toHaveTextContent('(')
  })

  it('renders cancel button', () => {
    render(<UnsubscribeDialog {...defaultProps} />)

    const cancelButton = screen.getByText('Cancel')
    expect(cancelButton).toBeInTheDocument()
    expect(cancelButton).toHaveClass('cursor-pointer')
  })

  it('renders unsubscribe button', () => {
    render(<UnsubscribeDialog {...defaultProps} />)

    const unsubscribeButtons = screen.getAllByText('Unsubscribe')
    // Should have title and button
    expect(unsubscribeButtons).toHaveLength(2)

    const actionButton = unsubscribeButtons.find(
      (button) =>
        button.tagName === 'BUTTON' && button.classList.contains('bg-primary')
    )
    expect(actionButton).toBeInTheDocument()
  })

  it('calls onOpenChange when cancel button is clicked', async () => {
    render(<UnsubscribeDialog {...defaultProps} />)

    const cancelButton = screen.getByText('Cancel')
    await userEvent.click(cancelButton)

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('has proper dialog structure and styling', () => {
    render(<UnsubscribeDialog {...defaultProps} />)

    // Check overlay
    const overlay = document.querySelector('.fixed.inset-0')
    expect(overlay).toBeInTheDocument()
    expect(overlay).toHaveClass('bg-black/40')

    // Check content container
    const content = screen.getByRole('dialog')
    expect(content).toHaveClass(
      'bg-card',
      'fixed',
      'top-1/2',
      'left-1/2',
      'z-50',
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

  it('has proper button styling', () => {
    render(<UnsubscribeDialog {...defaultProps} />)

    const cancelButton = screen.getByText('Cancel')
    expect(cancelButton).toHaveClass(
      'text-primary',
      'hover:bg-secondary',
      'cursor-pointer',
      'rounded-full',
      'px-3',
      'py-1.5',
      'text-sm',
      'font-medium',
      'transition'
    )

    const unsubscribeButtons = screen.getAllByText('Unsubscribe')
    const actionButton = unsubscribeButtons.find((button) =>
      button.classList.contains('bg-primary')
    )
    expect(actionButton).toHaveClass(
      'bg-primary',
      'text-primary-foreground',
      'hover:bg-primary/80',
      'cursor-pointer',
      'rounded-full',
      'px-3',
      'py-1.5',
      'text-sm',
      'font-medium',
      'transition'
    )
  })

  it('handles missing senderName gracefully', () => {
    const propsWithoutName = { ...defaultProps, senderName: undefined }
    render(<UnsubscribeDialog {...propsWithoutName} />)

    // Dialog should still render properly
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()

    const message = screen.getByText(/Are you sure you want to unsubscribe/)
    expect(message).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<UnsubscribeDialog {...defaultProps} />)

    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()

    // Check for title
    const title = screen.getByRole('heading', { name: 'Unsubscribe' })
    expect(title).toBeInTheDocument()

    // Check for description
    const description = screen.getByText(/Are you sure you want to unsubscribe/)
    expect(description).toBeInTheDocument()
  })
})
