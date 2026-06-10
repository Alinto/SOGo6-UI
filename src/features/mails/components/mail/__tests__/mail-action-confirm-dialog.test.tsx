import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import { MailActionConfirmDialog } from '../mail-action-confirm-dialog'

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (children: React.ReactNode) => children,
}))

const defaultProps = {
  open: true,
  onOpenChange: jest.fn(),
  onConfirm: jest.fn(),
}

describe('MailActionConfirmDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('renders delete confirmation when variant is delete', () => {
      render(
        <MailActionConfirmDialog {...defaultProps} variant="delete" />
      )
      expect(screen.getByRole('alertdialog')).toBeInTheDocument()
      expect(
        screen.getByText('delete_confirm.title.string')
      ).toBeInTheDocument()
      expect(
        screen.getByText('delete_confirm.message.string')
      ).toBeInTheDocument()
    })

    it('renders spam confirmation when variant is spam', () => {
      render(<MailActionConfirmDialog {...defaultProps} variant="spam" />)
      expect(
        screen.getByText('spam_confirm.title.string')
      ).toBeInTheDocument()
    })

    it('renders ham confirmation when variant is ham', () => {
      render(<MailActionConfirmDialog {...defaultProps} variant="ham" />)
      expect(
        screen.getByText('ham_confirm.title.string')
      ).toBeInTheDocument()
    })
  })

  describe('configuration', () => {
    it('calls onConfirm when confirm button is clicked', () => {
      const onConfirm = jest.fn()
      render(
        <MailActionConfirmDialog
          {...defaultProps}
          variant="delete"
          onConfirm={onConfirm}
        />
      )
      fireEvent.click(
        screen.getByRole('button', { name: 'delete_confirm.confirm.string' })
      )
      expect(onConfirm).toHaveBeenCalledTimes(1)
    })

    it('disables actions when isLoading is true', () => {
      render(
        <MailActionConfirmDialog
          {...defaultProps}
          variant="delete"
          isLoading
        />
      )
      expect(
        screen.getByRole('button', { name: 'delete_confirm.cancel.string' })
      ).toBeDisabled()
    })

    it('applies destructive styling for delete variant', () => {
      render(
        <MailActionConfirmDialog {...defaultProps} variant="delete" />
      )
      const confirmButton = screen.getByRole('button', {
        name: 'delete_confirm.confirm.string',
      })
      expect(confirmButton).toHaveClass('bg-destructive')
    })
  })

  describe('accessibility', () => {
    it('exposes alertdialog role', () => {
      render(
        <MailActionConfirmDialog {...defaultProps} variant="spam" />
      )
      expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    })
  })
})
