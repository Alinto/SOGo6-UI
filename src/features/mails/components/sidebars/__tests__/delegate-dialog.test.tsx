import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockAdd = jest.fn()

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock(
  '@/features/user-settings/mail/external-accounts/store/mailboxes-api',
  () => ({
    useGetMailboxDelegatesQuery: () => ({
      data: ['ada@example.org'],
      isLoading: false,
    }),
    useAddMailboxDelegateMutation: () => [mockAdd, { isLoading: false }],
  })
)

import { DelegateDialog } from '../delegate-dialog'

describe('DelegateDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAdd.mockReturnValue({
      unwrap: () => Promise.resolve(['ada@example.org']),
    })
  })

  it('lists delegates and adds one by email', async () => {
    const user = userEvent.setup()
    render(<DelegateDialog open onOpenChange={jest.fn()} />)
    expect(screen.getByText('ada@example.org')).toBeInTheDocument()
    await user.type(
      screen.getByLabelText('account_switcher.delegate.email.string'),
      'grace@example.org'
    )
    await user.click(
      screen.getByRole('button', {
        name: 'account_switcher.delegate.add.string',
      })
    )
    await waitFor(() =>
      expect(mockAdd).toHaveBeenCalledWith({ email: 'grace@example.org' })
    )
  })
})
