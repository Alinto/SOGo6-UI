import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

jest.mock('@/components/ui/buttons/tooltip-button', () => ({
  TooltipButton: ({
    children,
    tooltip,
    className,
    ...props
  }: {
    children: React.ReactNode
    tooltip?: string
    className?: string
    type?: string
    tabIndex?: number
  }) => (
    <button
      data-testid="tooltip-button"
      data-tooltip={tooltip}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
}))

jest.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover">{children}</div>
  ),
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover-trigger">{children}</div>
  ),
  PopoverContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover-content">{children}</div>
  ),
}))

jest.mock('../mail-contact-popover', () => ({
  ContactPopoverContent: ({ contact }: { contact: { email: string } }) => (
    <div data-testid="contact-popover-content">{contact.email}</div>
  ),
}))

import { ContactBadge } from '../mail-contact-badge'

describe('ContactBadge', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('displays contact name when available', () => {
      render(
        <ContactBadge contact={{ name: 'Alice Smith', email: 'alice@example.com' }} />
      )
      expect(screen.getByTestId('tooltip-button')).toHaveTextContent('Alice Smith')
    })

    it('falls back to email when name is missing', () => {
      render(<ContactBadge contact={{ email: 'bob@example.com' }} />)
      expect(screen.getByTestId('tooltip-button')).toHaveTextContent('bob@example.com')
    })
  })

  describe('configuration', () => {
    it('shows email as tooltip when name is present', () => {
      render(
        <ContactBadge contact={{ name: 'Alice Smith', email: 'alice@example.com' }} />
      )
      expect(screen.getByTestId('tooltip-button')).toHaveAttribute(
        'data-tooltip',
        'alice@example.com'
      )
    })

    it('does not set tooltip when only email is shown', () => {
      render(<ContactBadge contact={{ email: 'bob@example.com' }} />)
      expect(screen.getByTestId('tooltip-button')).not.toHaveAttribute('data-tooltip')
    })
  })

  describe('integration', () => {
    it('renders popover with contact content', () => {
      render(
        <ContactBadge contact={{ name: 'Alice Smith', email: 'alice@example.com' }} />
      )
      expect(screen.getByTestId('popover')).toBeInTheDocument()
      expect(screen.getByTestId('contact-popover-content')).toHaveTextContent(
        'alice@example.com'
      )
    })
  })

  describe('custom styling', () => {
    it('applies badge styling classes', () => {
      render(<ContactBadge contact={{ email: 'bob@example.com' }} />)
      expect(screen.getByTestId('tooltip-button')).toHaveClass('rounded-full', 'text-sm')
    })
  })
})
