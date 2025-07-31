import { TooltipProvider } from '@/components/ui/tooltip'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContactBadge } from '../mail-contact-badge'

jest.mock('../mail-contact-popover', () => ({
  ContactPopoverContent: () => (
    <div data-testid="contact-popover">Popover content</div>
  ),
}))

describe('ContactBadge', () => {
  const mockContactWithName = {
    name: 'John Doe',
    email: 'john.doe@example.com',
  }

  const mockContactEmailOnly = {
    email: 'jane@example.com',
  }

  it('renders contact with name and shows tooltip with email on hover', async () => {
    render(
      <TooltipProvider>
        <ContactBadge contact={mockContactWithName} />
      </TooltipProvider>
    )

    const badge = screen.getByText('John Doe')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('cursor-pointer', 'rounded-full', 'px-3', 'py-1')

    await userEvent.hover(badge)
    const tooltip = await screen.findByRole('tooltip')
    expect(tooltip).toHaveTextContent('john.doe@example.com')
  })

  it('renders contact with email only when no name provided', () => {
    render(
      <TooltipProvider>
        <ContactBadge contact={mockContactEmailOnly} />
      </TooltipProvider>
    )

    const badge = screen.getByText('jane@example.com')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('cursor-pointer', 'rounded-full', 'px-3', 'py-1')
  })

  it('opens popover when clicked', async () => {
    render(
      <TooltipProvider>
        <ContactBadge contact={mockContactWithName} />
      </TooltipProvider>
    )

    const badge = screen.getByText('John Doe')
    await userEvent.click(badge)

    const popover = await screen.findByTestId('contact-popover')
    expect(popover).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(
      <TooltipProvider>
        <ContactBadge contact={mockContactWithName} />
      </TooltipProvider>
    )

    const badge = screen.getByText('John Doe')
    expect(badge).toHaveAttribute('tabIndex', '0')
  })
})
