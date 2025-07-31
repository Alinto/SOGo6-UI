import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContactPopoverContent } from '../mail-contact-popover'

jest.mock('next-intl', () => ({
  useTranslations: () => (key) => {
    const translations = {
      'mail_display.header.contacts-badge.popover-add-to-addressbook.string':
        'Add to address book',
      'mail_display.header.contacts-badge.popover-write-new-message.string':
        'Write new message',
    }
    return translations[key] || key
  },
}))

describe('ContactPopoverContent', () => {
  it('renders add to address book button', () => {
    render(<ContactPopoverContent />)

    const addButton = screen.getByText('Add to address book')
    expect(addButton).toBeInTheDocument()
    expect(addButton).toHaveAttribute('type', 'button')
    expect(addButton).toHaveAttribute('tabIndex', '0')
    expect(addButton).toHaveClass('hover:bg-muted', 'cursor-pointer')
  })

  it('renders write new message button', () => {
    render(<ContactPopoverContent />)

    const writeButton = screen.getByText('Write new message')
    expect(writeButton).toBeInTheDocument()
    expect(writeButton).toHaveAttribute('type', 'button')
    expect(writeButton).toHaveAttribute('tabIndex', '0')
    expect(writeButton).toHaveClass('hover:bg-muted', 'cursor-pointer')
  })

  it('has proper structure with icons', () => {
    render(<ContactPopoverContent />)

    const container = screen.getByText('Add to address book').closest('div')
    expect(container).toHaveClass('flex', 'flex-col', 'gap-1')

    // Check that buttons have proper flex layout with icons
    const addButton = screen.getByText('Add to address book')
    expect(addButton).toHaveClass('flex', 'gap-2')

    const writeButton = screen.getByText('Write new message')
    expect(writeButton).toHaveClass('flex', 'gap-2')
  })

  it('buttons are clickable', async () => {
    render(<ContactPopoverContent />)

    const addButton = screen.getByText('Add to address book')
    const writeButton = screen.getByText('Write new message')

    await userEvent.click(addButton)
    await userEvent.click(writeButton)

    // No errors should occur during clicks
    expect(addButton).toBeInTheDocument()
    expect(writeButton).toBeInTheDocument()
  })
})
