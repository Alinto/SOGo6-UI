import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockDispatch = jest.fn()
const mockPush = jest.fn()
const mockDeleteContact = jest.fn()

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}))

jest.mock('@/lib/i18n/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('../../../store/address-books-api', () => ({
  useDeleteVCardFromAddressBookMutation: () => [
    mockDeleteContact.mockReturnValue({ unwrap: () => Promise.resolve() }),
    { isLoading: false },
  ],
}))

jest.mock('../../../hooks/use-active-address-book', () => ({
  useActiveAddressBookWritable: () => ({ writable: true }),
}))

jest.mock('../../sidebar/actions/export-entry-dialog', () => ({
  __esModule: true,
  default: () => null,
}))

import ContactActions from '../contact-actions'
import { openEditForm } from '../../../store/address-books-ui-slice'

describe('ContactActions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('dispatches openEditForm on edit click', async () => {
    const user = userEvent.setup()
    render(
      <ContactActions
        contactId="c1"
        bookId="work"
        emails={['john@example.com']}
        displayName="John Doe"
      />
    )

    await user.click(screen.getByTestId('contact-actions-menu'))
    await user.click(screen.getByTestId('edit-contact-button'))

    expect(mockDispatch).toHaveBeenCalledWith(
      openEditForm({ contactId: 'c1', bookId: 'work' })
    )
  })

  it('dispatches createDraft on write message click', async () => {
    const user = userEvent.setup()
    render(
      <ContactActions
        contactId="c1"
        bookId="work"
        emails={['john@example.com']}
        displayName="John Doe"
      />
    )

    await user.click(screen.getByTestId('write-to-contact-button'))

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.stringContaining('createDraft'),
      })
    )
  })

  it('disables write message when there are no emails', () => {
    render(<ContactActions contactId="c1" bookId="work" emails={[]} />)
    expect(screen.getByTestId('write-to-contact-button')).toBeDisabled()
  })
})
