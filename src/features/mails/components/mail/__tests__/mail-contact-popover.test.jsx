import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContactPopoverContent } from '../mail-contact-popover'

const mockDispatch = jest.fn()

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}))

jest.mock('@/features/address_books', () => ({
  useGetAddressBooksQuery: () => ({
    data: { personals: [{ id: 'work', default: true }] },
  }),
  openCreateForm: jest.fn((payload) => ({
    type: 'addressBooksUi/openCreateForm',
    payload,
  })),
  parseContactName: (name) => ({
    firstName: name?.split(' ')[0] ?? '',
    lastName: name?.split(' ').slice(1).join(' ') ?? '',
  }),
}))

jest.mock('@/features/mails/store', () => ({
  createDraft: jest.fn((payload) => ({
    type: 'mailCompose/createDraft',
    payload,
  })),
}))

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

const contact = { name: 'John Doe', email: 'john@example.com' }

describe('ContactPopoverContent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders add to address book button', () => {
    render(<ContactPopoverContent contact={contact} />)

    const addButton = screen.getByText('Add to address book')
    expect(addButton).toBeInTheDocument()
    expect(addButton).toHaveAttribute('type', 'button')
  })

  it('renders write new message button', () => {
    render(<ContactPopoverContent contact={contact} />)

    const writeButton = screen.getByText('Write new message')
    expect(writeButton).toBeInTheDocument()
  })

  it('dispatches actions on click', async () => {
    const user = userEvent.setup()
    render(<ContactPopoverContent contact={contact} />)

    await user.click(screen.getByText('Add to address book'))
    await user.click(screen.getByText('Write new message'))

    expect(mockDispatch).toHaveBeenCalledTimes(2)
  })
})
