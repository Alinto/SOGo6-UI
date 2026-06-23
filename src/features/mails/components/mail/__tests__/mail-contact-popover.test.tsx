import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContactPopoverContent } from '../mail-contact-popover'

const mockDispatch = jest.fn()

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}))

jest.mock('@/lib/i18n/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock('@/features/address_books', () => ({
  useGetAddressBooksQuery: () => ({
    data: { personals: [{ id: 'work', default: true }] },
  }),
  useLazySearchContactsAutocompleteQuery: () => [
    jest.fn(),
    { data: undefined },
  ],
  openCreateForm: jest.fn((payload) => ({
    type: 'addressBooksUi/openCreateForm',
    payload,
  })),
  parseContactName: (name?: string) => ({
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
  Mail: ({ size, className }: { size: number; className?: string }) => (
    <span data-testid="mail-icon" data-size={size} className={className}>
      ✉️
    </span>
  ),
  UserPlus2: ({ size, className }: { size: number; className?: string }) => (
    <span data-testid="user-plus-icon" data-size={size} className={className}>
      👤+
    </span>
  ),
  UserRound: ({ size, className }: { size: number; className?: string }) => (
    <span data-testid="user-round-icon" data-size={size} className={className}>
      👤
    </span>
  ),
}))

const contact = { name: 'John Doe', email: 'john@example.com' }

describe('ContactPopoverContent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render both action buttons', () => {
    render(<ContactPopoverContent contact={contact} />)

    expect(screen.getByText('Add to address book')).toBeInTheDocument()
    expect(screen.getByText('Write new message')).toBeInTheDocument()
  })

  it('dispatches openCreateForm when adding to address book', async () => {
    const user = userEvent.setup()
    render(<ContactPopoverContent contact={contact} />)
    await user.click(screen.getByText('Add to address book'))
    expect(mockDispatch).toHaveBeenCalled()
  })

  it('dispatches createDraft when writing a new message', async () => {
    const user = userEvent.setup()
    render(<ContactPopoverContent contact={contact} />)
    await user.click(screen.getByText('Write new message'))
    expect(mockDispatch).toHaveBeenCalled()
  })
})
