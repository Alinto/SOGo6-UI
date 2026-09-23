import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddExternalAccountDialog } from '../add-external-account-dialog'

const mockCreate = jest.fn()

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock(
  '@/features/user-settings/mail/external-accounts/store/mailboxes-api',
  () => ({
    useCreateUserMailboxMutation: () => [mockCreate],
  })
)

jest.mock('../external-accounts-edit-form', () => ({
  __esModule: true,
  default: ({
    onBack,
    onSuccess,
    embedded,
    mode,
  }: {
    onBack: () => void
    onSuccess?: () => void
    embedded?: boolean
    mode: string
  }) => (
    <div
      data-testid="external-account-form"
      data-embedded={String(embedded)}
      data-mode={mode}
    >
      <button type="button" onClick={onBack}>
        back
      </button>
      <button type="button" onClick={onSuccess}>
        success
      </button>
    </div>
  ),
}))

describe('AddExternalAccountDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the create form inside the dialog', () => {
    render(<AddExternalAccountDialog open onOpenChange={jest.fn()} />)

    const form = screen.getByTestId('external-account-form')
    expect(form).toHaveAttribute('data-embedded', 'true')
    expect(form).toHaveAttribute('data-mode', 'create')
    expect(screen.getByText('new.title.string')).toBeInTheDocument()
  })

  it('closes when the form goes back or succeeds', async () => {
    const user = userEvent.setup()
    const onOpenChange = jest.fn()
    render(<AddExternalAccountDialog open onOpenChange={onOpenChange} />)

    await user.click(screen.getByRole('button', { name: 'back' }))
    await user.click(screen.getByRole('button', { name: 'success' }))

    expect(onOpenChange).toHaveBeenNthCalledWith(1, false)
    expect(onOpenChange).toHaveBeenNthCalledWith(2, false)
  })
})
