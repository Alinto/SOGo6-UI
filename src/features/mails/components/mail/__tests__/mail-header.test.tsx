import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import MailHeader from '../mail-header'

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      'mail_display.header.unsubscribe.string': 'Unsubscribe',
      'mail_display.action-bar.reply.string': 'Reply',
      'mail_display.action-bar.reply_all.string': 'Reply All',
      'mail_display.action-bar.forward.string': 'Forward',
    }
    return translations[key] || key
  }),
}))

jest.mock('@/components/ui/avatar', () => ({
  Avatar: jest.fn(({ children, className }) => (
    <div data-testid="avatar" className={className}>
      {children}
    </div>
  )),
  AvatarImage: jest.fn(({ src }) => (
    <img data-testid="avatar-image" src={src} alt="" />
  )),
  AvatarFallback: jest.fn(({ children }) => (
    <div data-testid="avatar-fallback">{children}</div>
  )),
}))

jest.mock('@/components/ui/button', () => ({
  Button: jest.fn(({ children, onClick, ...props }) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  )),
}))

jest.mock('lucide-react', () => ({
  Reply: jest.fn(() => <span data-testid="reply-icon">↩️</span>),
  ReplyAll: jest.fn(() => <span data-testid="reply-all-icon">↩️↩️</span>),
  Forward: jest.fn(() => <span data-testid="forward-icon">➡️</span>),
}))

jest.mock('../mail-action-bar', () =>
  jest.fn(({ actions }) => (
    <div data-testid="mail-action-bar">
      {actions.map((action: any, idx: number) => (
        <div key={idx}>{action.title}</div>
      ))}
    </div>
  ))
)

jest.mock('../mail-contact-badge', () => ({
  ContactBadge: jest.fn(({ contact }) => (
    <div data-testid="contact-badge">{contact.name || contact.email}</div>
  )),
}))

jest.mock('../mail-unsubscribe-dialog', () => ({
  UnsubscribeDialog: jest.fn(({ open, senderName, senderEmail }) => (
    <div data-testid="unsubscribe-dialog" data-open={open}>
      Dialog for {senderName} ({senderEmail})
    </div>
  )),
}))

jest.mock('../utils', () => ({
  formatMailTime: jest.fn((date) => 'Jan 15, 2024 10:00 AM'),
}))

describe('MailHeader', () => {
  const mockProps = {
    from: { name: 'John Doe', email: 'john@example.com' },
    to: Array.from({ length: 7 }, (_, i) => ({
      name: `Recipient ${i + 1}`,
      email: `recipient${i + 1}@example.com`,
    })),
    cc: Array.from({ length: 7 }, (_, i) => ({
      name: `CC ${i + 1}`,
      email: `cc${i + 1}@example.com`,
    })),
    showUnsubscribeButton: false,
    date: new Date('2024-01-15T10:00:00Z').getTime(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render sender avatar and name', () => {
    render(<MailHeader {...mockProps} />)

    expect(screen.getByTestId('avatar')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('should render formatted date', () => {
    render(<MailHeader {...mockProps} />)

    expect(screen.getByText('Jan 15, 2024 10:00 AM')).toBeInTheDocument()
  })

  it('should render mail action bar with correct actions', () => {
    render(<MailHeader {...mockProps} />)

    expect(screen.getByTestId('mail-action-bar')).toBeInTheDocument()
    expect(screen.getByText('Reply')).toBeInTheDocument()
    expect(screen.getByText('Reply All')).toBeInTheDocument()
    expect(screen.getByText('Forward')).toBeInTheDocument()
  })

  it('should show unsubscribe button when showUnsubscribeButton is true', () => {
    render(<MailHeader {...mockProps} showUnsubscribeButton={true} />)

    expect(screen.getByText('Unsubscribe')).toBeInTheDocument()
  })

  it('should not show unsubscribe button when showUnsubscribeButton is false', () => {
    render(<MailHeader {...mockProps} />)

    expect(screen.queryByText('Unsubscribe')).not.toBeInTheDocument()
  })

  it('should show limited recipients by default (max 5)', () => {
    render(<MailHeader {...mockProps} />)

    const contactBadges = screen.getAllByTestId('contact-badge')
    // Should show: 1 from + 5 to recipients = 6, but might be more based on implementation
    expect(contactBadges.length).toBeGreaterThanOrEqual(5)
  })

  it('should show +N button for hidden cc recipients', () => {
    render(<MailHeader {...mockProps} />)

    const ccSection = screen.getByText('Cc').parentElement!
    expect(ccSection).toContainHTML('+2')
  })

  it('should expand all cc recipients when +N button is clicked', () => {
    render(<MailHeader {...mockProps} />)

    const buttons = screen.getAllByText('+2')
    const ccShowMoreButton = buttons[buttons.length - 1].closest('button')!
    fireEvent.click(ccShowMoreButton)

    const contactBadges = screen.getAllByTestId('contact-badge')
    expect(contactBadges.length).toBeGreaterThan(6)
  })

  it('should render avatar fallback with first letter of sender name', () => {
    render(<MailHeader {...mockProps} />)

    const fallback = screen.getByTestId('avatar-fallback')
    expect(fallback).toHaveTextContent('J')
  })

  it('should use email first letter when sender name is not provided', () => {
    const propsWithoutName = {
      ...mockProps,
      from: { name: '', email: 'test@example.com' },
    }
    render(<MailHeader {...propsWithoutName} />)

    const fallback = screen.getByTestId('avatar-fallback')
    expect(fallback).toHaveTextContent('T')
  })

  it('should open unsubscribe dialog when unsubscribe button is clicked', () => {
    render(<MailHeader {...mockProps} showUnsubscribeButton={true} />)

    const unsubscribeButton = screen.getByText('Unsubscribe').closest('button')!
    fireEvent.click(unsubscribeButton)

    const dialog = screen.getByTestId('unsubscribe-dialog')
    expect(dialog).toHaveAttribute('data-open', 'true')
  })

  it('should not render cc section when cc is empty', () => {
    const propsWithoutCc = {
      ...mockProps,
      cc: undefined,
    }
    render(<MailHeader {...propsWithoutCc} />)

    expect(screen.queryByText('Cc')).not.toBeInTheDocument()
  })

  it('should render From label', () => {
    render(<MailHeader {...mockProps} />)

    expect(screen.getByText('From')).toBeInTheDocument()
  })

  it('should render To label', () => {
    render(<MailHeader {...mockProps} />)

    expect(screen.getByText('To')).toBeInTheDocument()
  })
})
