import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import MailHeaderMobile from '../mail-header-mobile'

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      'mail_display.header.unsubscribe.string': 'Unsubscribe',
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
  ChevronDown: jest.fn(({ className }) => (
    <span data-testid="chevron-down" className={className}>
      ▼
    </span>
  )),
  ChevronUp: jest.fn(({ className }) => (
    <span data-testid="chevron-up" className={className}>
      ▲
    </span>
  )),
}))

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

describe('MailHeaderMobile', () => {
  const mockProps = {
    from: { name: 'John Doe', email: 'john@example.com' },
    to: [
      { name: 'Jane Smith', email: 'jane@example.com' },
      { name: 'Bob Johnson', email: 'bob@example.com' },
    ],
    cc: [{ name: 'Alice Brown', email: 'alice@example.com' }],
    showUnsubscribeButton: false,
    date: new Date('2024-01-15T10:00:00Z').getTime(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render sender avatar and name', () => {
    render(<MailHeaderMobile {...mockProps} />)

    expect(screen.getByTestId('avatar')).toBeInTheDocument()
    expect(screen.getByTestId('contact-badge')).toHaveTextContent('John Doe')
  })

  it('should render formatted date', () => {
    render(<MailHeaderMobile {...mockProps} />)

    expect(screen.getByText('Jan 15, 2024 10:00 AM')).toBeInTheDocument()
  })

  it('should show unsubscribe button when showUnsubscribeButton is true', () => {
    render(<MailHeaderMobile {...mockProps} showUnsubscribeButton={true} />)

    expect(screen.getByText('Unsubscribe')).toBeInTheDocument()
  })

  it('should not show unsubscribe button when showUnsubscribeButton is false', () => {
    render(<MailHeaderMobile {...mockProps} />)

    expect(screen.queryByText('Unsubscribe')).not.toBeInTheDocument()
  })

  it('should show collapsed recipients summary by default', () => {
    render(<MailHeaderMobile {...mockProps} />)

    expect(screen.getByTestId('chevron-down')).toBeInTheDocument()
    expect(screen.getByText('to')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  it('should expand recipients when chevron down is clicked', () => {
    render(<MailHeaderMobile {...mockProps} />)

    const expandButton = screen.getByTestId('chevron-down').closest('button')!
    fireEvent.click(expandButton)

    expect(screen.getByText('To')).toBeInTheDocument()
    expect(screen.getByText('Cc')).toBeInTheDocument()
    expect(screen.getByTestId('chevron-up')).toBeInTheDocument()
  })

  it('should collapse recipients when chevron up is clicked', () => {
    render(<MailHeaderMobile {...mockProps} />)

    // Expand first
    const expandButton = screen.getByTestId('chevron-down').closest('button')!
    fireEvent.click(expandButton)

    // Then collapse
    const collapseButton = screen.getByTestId('chevron-up').closest('button')!
    fireEvent.click(collapseButton)

    expect(screen.getByTestId('chevron-down')).toBeInTheDocument()
    expect(screen.queryByTestId('chevron-up')).not.toBeInTheDocument()
  })

  it('should show recipient count in collapsed state', () => {
    render(<MailHeaderMobile {...mockProps} />)

    expect(screen.getByText('+1')).toBeInTheDocument() // +1 more recipient
  })

  it('should show cc indicator in collapsed state when cc exists', () => {
    render(<MailHeaderMobile {...mockProps} />)

    expect(screen.getByText('cc')).toBeInTheDocument()
  })

  it('should render all recipients when expanded', () => {
    render(<MailHeaderMobile {...mockProps} />)

    const expandButton = screen.getByTestId('chevron-down').closest('button')!
    fireEvent.click(expandButton)

    const contactBadges = screen.getAllByTestId('contact-badge')
    expect(contactBadges.length).toBeGreaterThanOrEqual(3) // from + 2 to recipients
  })

  it('should render avatar fallback with first letter of sender name', () => {
    render(<MailHeaderMobile {...mockProps} />)

    const fallback = screen.getByTestId('avatar-fallback')
    expect(fallback).toHaveTextContent('J')
  })

  it('should use email first letter when sender name is not provided', () => {
    const propsWithoutName = {
      ...mockProps,
      from: { name: '', email: 'test@example.com' },
    }
    render(<MailHeaderMobile {...propsWithoutName} />)

    const fallback = screen.getByTestId('avatar-fallback')
    expect(fallback).toHaveTextContent('T')
  })

  it('should open unsubscribe dialog when unsubscribe button is clicked', () => {
    render(<MailHeaderMobile {...mockProps} showUnsubscribeButton={true} />)

    const unsubscribeButton = screen.getByText('Unsubscribe').closest('button')!
    fireEvent.click(unsubscribeButton)

    const dialog = screen.getByTestId('unsubscribe-dialog')
    expect(dialog).toHaveAttribute('data-open', 'true')
  })

  it('should not render cc section when cc is empty', () => {
    const propsWithoutCc = {
      ...mockProps,
      cc: [],
    }
    render(<MailHeaderMobile {...propsWithoutCc} />)

    const expandButton = screen.getByTestId('chevron-down').closest('button')!
    fireEvent.click(expandButton)

    expect(screen.queryByText('Cc')).not.toBeInTheDocument()
  })
})
