/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import OutboxToolbar from '../outbox-toolbar'

const mockDispatch = jest.fn()
let mockSelectedIds: string[] = []

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (fn: (s: unknown) => unknown) =>
    fn({ mailLayout: { selectedMailIds: mockSelectedIds } }),
}))

jest.mock('@/features/mails/store/mail-layout-slice', () => ({
  clearSelectedMails: () => ({ type: 'clear' }),
  setSelectedMails: (ids: string[]) => ({ type: 'set', ids }),
}))

jest.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({
    checked,
    onCheckedChange,
  }: {
    checked: boolean | 'indeterminate'
    onCheckedChange: (value: boolean) => void
  }) => (
    <input
      data-testid="checkbox"
      type="checkbox"
      checked={checked === true}
      onChange={(e) => onCheckedChange(e.target.checked)}
    />
  ),
}))

jest.mock('@/features/mails/components/mail/mail-action-bar', () => ({
  __esModule: true,
  default: ({ onAction }: { onAction: () => void }) => (
    <button type="button" data-testid="mail-actions-bar" onClick={onAction}>
      actions
    </button>
  ),
}))

const mockFlush = jest.fn()
jest.mock('../../outbox/outbox-flush-feedback', () => ({
  flushOutboxWithToasts: (...args: unknown[]) => mockFlush(...args),
}))

jest.mock('../../auth/get-auth-token', () => ({
  getAuthUserId: () => 'user@example.org',
}))

describe('OutboxToolbar', () => {
  const onBulkDelete = jest.fn()

  beforeEach(() => {
    mockDispatch.mockReset()
    onBulkDelete.mockReset()
    mockFlush.mockReset()
    mockSelectedIds = []
  })

  it('shows the folder name and message count', () => {
    render(<OutboxToolbar itemIds={['a', 'b']} onBulkDelete={onBulkDelete} />)
    expect(screen.getByText('outbox_folder.string')).toBeInTheDocument()
    expect(screen.getByText('messages_number.string')).toBeInTheDocument()
    expect(screen.getByTestId('checkbox')).toBeInTheDocument()
  })

  it('shows Send all and flushes the outbox', async () => {
    const user = userEvent.setup()
    render(<OutboxToolbar itemIds={['a', 'b']} onBulkDelete={onBulkDelete} />)

    await user.click(
      screen.getByRole('button', { name: 'outbox_send_all.string' })
    )
    expect(mockFlush).toHaveBeenCalledWith(
      'user@example.org',
      expect.any(Function),
      { force: true }
    )
  })

  it('shows bulk delete when messages are selected', async () => {
    mockSelectedIds = ['a']
    const user = userEvent.setup()
    render(<OutboxToolbar itemIds={['a', 'b']} onBulkDelete={onBulkDelete} />)

    expect(screen.getByTestId('mail-actions-bar')).toBeInTheDocument()
    expect(screen.queryByText('outbox_folder.string')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'outbox_send_all.string' })
    ).not.toBeInTheDocument()

    await user.click(screen.getByTestId('mail-actions-bar'))
    expect(onBulkDelete).toHaveBeenCalledWith(['a'])
  })
})
