import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { ContactPopoverContent } from '../mail-contact-popover'

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      'mail_display.header.contacts-badge.popover-add-to-addressbook.string':
        'Add to address book',
      'mail_display.header.contacts-badge.popover-write-new-message.string':
        'Write new message',
    }
    return translations[key] || key
  }),
}))

jest.mock('lucide-react', () => ({
  Mail: jest.fn(({ size, className }) => (
    <span data-testid="mail-icon" data-size={size} className={className}>
      ✉️
    </span>
  )),
  UserPlus2: jest.fn(({ size, className }) => (
    <span data-testid="user-plus-icon" data-size={size} className={className}>
      👤+
    </span>
  )),
}))

describe('ContactPopoverContent', () => {
  it('should render both action buttons', () => {
    render(<ContactPopoverContent />)

    expect(screen.getByText('Add to address book')).toBeInTheDocument()
    expect(screen.getByText('Write new message')).toBeInTheDocument()
  })

  it('should render icons for both actions', () => {
    render(<ContactPopoverContent />)

    expect(screen.getByTestId('user-plus-icon')).toBeInTheDocument()
    expect(screen.getByTestId('mail-icon')).toBeInTheDocument()
  })

  it('should render buttons with correct attributes', () => {
    render(<ContactPopoverContent />)

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(2)

    buttons.forEach((button) => {
      expect(button).toHaveAttribute('type', 'button')
      expect(button).toHaveAttribute('tabIndex', '0')
    })
  })

  it('should apply correct styling to buttons', () => {
    render(<ContactPopoverContent />)

    const buttons = screen.getAllByRole('button')
    buttons.forEach((button) => {
      expect(button).toHaveClass('flex', 'cursor-pointer', 'gap-2')
    })
  })

  it('should render add to address book button with correct content', () => {
    render(<ContactPopoverContent />)

    const addButton = screen.getByText('Add to address book').closest('button')
    expect(addButton).toBeInTheDocument()
    expect(
      addButton?.querySelector('[data-testid="user-plus-icon"]')
    ).toBeInTheDocument()
  })

  it('should render write new message button with correct content', () => {
    render(<ContactPopoverContent />)

    const messageButton = screen
      .getByText('Write new message')
      .closest('button')
    expect(messageButton).toBeInTheDocument()
    expect(
      messageButton?.querySelector('[data-testid="mail-icon"]')
    ).toBeInTheDocument()
  })

  it('should render icons with correct size', () => {
    render(<ContactPopoverContent />)

    const userPlusIcon = screen.getByTestId('user-plus-icon')
    const mailIcon = screen.getByTestId('mail-icon')

    expect(userPlusIcon).toHaveAttribute('data-size', '16')
    expect(mailIcon).toHaveAttribute('data-size', '16')
  })

  it('should apply muted foreground color to icons', () => {
    render(<ContactPopoverContent />)

    const userPlusIcon = screen.getByTestId('user-plus-icon')
    const mailIcon = screen.getByTestId('mail-icon')

    expect(userPlusIcon).toHaveClass('text-muted-foreground')
    expect(mailIcon).toHaveClass('text-muted-foreground')
  })
})
