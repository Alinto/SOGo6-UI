import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import MailDetailActionBar from '../mail-detail-action-bar'

const mockDeleteMail = jest.fn()
const mockMarkSpam = jest.fn()
const mockMarkHam = jest.fn()
const mockMarkUnread = jest.fn()
const mockPush = jest.fn()

jest.mock('@/lib/i18n/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('@/features/mails/hooks/use-mail-item-actions', () => ({
  useMailItemActions: jest.fn(({ onRemoved }: { onRemoved?: (r: unknown) => void }) => ({
    deleteMail: (...args: unknown[]) => {
      mockDeleteMail(...args)
      onRemoved?.({ target: 'list' })
      return Promise.resolve()
    },
    markUnread: mockMarkUnread,
    markSpam: mockMarkSpam,
    markHam: mockMarkHam,
    archiveMail: jest.fn(),
    applyLabel: jest.fn(),
    removeLabel: jest.fn(),
    isJunk: false,
    isTrash: false,
    isLoading: false,
  })),
}))

jest.mock('@/features/mails/store/mails-api', () => ({
  useDownloadMailMutation: () => [jest.fn()],
  useLazyGetMailRawQuery: () => [jest.fn()],
}))

jest.mock('../mail-label-picker-dialog', () => ({
  __esModule: true,
  default: () => null,
}))

jest.mock('@/components/ui/buttons/tooltip-button', () => ({
  TooltipButton: ({ children, onClick, disabled, 'data-testid': testId }: any) => (
    <button onClick={onClick} disabled={disabled} data-testid={testId}>
      {children}
    </button>
  ),
}))

describe('MailDetailActionBar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    const { useMailItemActions } = require('@/features/mails/hooks/use-mail-item-actions')
    useMailItemActions.mockImplementation(
      ({ onRemoved }: { onRemoved?: (r: unknown) => void }) => ({
        deleteMail: jest.fn(async () => {
          onRemoved?.({ target: 'list' })
        }),
        markUnread: mockMarkUnread,
        markSpam: mockMarkSpam,
        markHam: mockMarkHam,
        archiveMail: jest.fn(),
        applyLabel: jest.fn(),
        removeLabel: jest.fn(),
        isJunk: false,
        isTrash: false,
        isLoading: false,
      })
    )
  })

  it('opens delete confirmation dialog on delete click', () => {
    render(
      <MailDetailActionBar
        accountId="0"
        folder="INBOX"
        mailId="42"
        seen
      />
    )
    fireEvent.click(screen.getAllByTestId('mail-action-btn-delete.string')[0])
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
  })

  it('shows mark as spam button when not in junk folder', () => {
    render(
      <MailDetailActionBar
        accountId="0"
        folder="INBOX"
        mailId="42"
        seen
      />
    )
    expect(
      screen.getByTestId('mail-action-btn-report_spam.string')
    ).toBeInTheDocument()
  })
})
