import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import MailDetailActionBar from '../mail-detail-action-bar'

const mockDeleteMail = jest.fn()
const mockMarkSpam = jest.fn()
const mockMarkHam = jest.fn()
const mockMarkUnread = jest.fn()
const mockMarkImportant = jest.fn()
const mockRemoveImportant = jest.fn()
const mockMoveMail = jest.fn()
const mockCopyMail = jest.fn()
const mockArchiveMail = jest.fn()
const mockDownloadMail = jest.fn(() => ({
  unwrap: () => Promise.resolve(new Blob(['x'])),
}))
const mockFetchRaw = jest.fn(() => ({
  unwrap: () => Promise.resolve('raw-content'),
}))
const mockPush = jest.fn()

jest.mock('@/lib/i18n/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('@/features/mails/hooks/use-mail-item-actions', () => ({
  useMailItemActions: jest.fn(({ onRemoved }: { onRemoved?: () => void }) => ({
    deleteMail: (...args: unknown[]) => {
      mockDeleteMail(...args)
      onRemoved?.()
      return Promise.resolve()
    },
    markUnread: mockMarkUnread,
    markSpam: mockMarkSpam,
    markHam: mockMarkHam,
    archiveMail: mockArchiveMail,
    moveMail: mockMoveMail,
    copyMail: mockCopyMail,
    applyLabel: jest.fn(),
    removeLabel: jest.fn(),
    markImportant: mockMarkImportant,
    removeImportant: mockRemoveImportant,
    isJunk: false,
    isTrash: false,
    isLoading: false,
  })),
}))

jest.mock('@/features/mails/store/mails-api', () => ({
  useDownloadMailMutation: () => [mockDownloadMail],
  useLazyGetMailRawQuery: () => [mockFetchRaw],
  useGetFoldersQuery: () => ({ data: [], isLoading: false }),
  useLazyGetEditMessageQuery: () => [jest.fn()],
}))

jest.mock('@/features/mails/hooks/use-current-folder', () => ({
  useCurrentFolder: jest.fn(() => ({
    folderType: 'INBOX',
    isSelectable: true,
    isVirtual: false,
  })),
}))

jest.mock('@/features/mails/hooks/use-mail-detail-folder-actions', () => ({
  useMailDetailFolderActions: jest.fn(() => ({
    folderSpecificActions: [],
    handleFolderSpecificAction: jest.fn(() => false),
  })),
}))

jest.mock('../mail-label-picker-dialog', () => ({
  __esModule: true,
  default: () => null,
}))

jest.mock('../mail-move-dialog', () => ({
  __esModule: true,
  default: ({
    open,
    mode,
    onConfirm,
  }: {
    open: boolean
    mode?: 'move' | 'copy'
    onConfirm: (destination: string) => Promise<void>
  }) =>
    open ? (
      <button
        data-testid={`mock-confirm-${mode ?? 'move'}`}
        onClick={() => void onConfirm('Archive/Projects')}
      >
        confirm-{mode ?? 'move'}
      </button>
    ) : null,
}))

jest.mock('../mail-move-copy-menu', () => ({
  __esModule: true,
  default: ({
    disabled,
    onSelectDestination,
    onCreateFolder,
  }: {
    disabled?: boolean
    onSelectDestination: (mode: 'move' | 'copy', destination: string) => void
    onCreateFolder: (mode: 'move' | 'copy') => void
  }) => (
    <div data-testid="mail-action-btn-move-copy" data-disabled={disabled}>
      <button
        data-testid="mock-select-move-archive"
        onClick={() => onSelectDestination('move', 'Archive')}
      >
        move-archive
      </button>
      <button
        data-testid="mock-select-copy-archive"
        onClick={() => onSelectDestination('copy', 'Archive')}
      >
        copy-archive
      </button>
      <button
        data-testid="mock-create-move"
        onClick={() => onCreateFolder('move')}
      >
        create-move
      </button>
      <button
        data-testid="mock-create-copy"
        onClick={() => onCreateFolder('copy')}
      >
        create-copy
      </button>
    </div>
  ),
}))

jest.mock('../mail-more-actions-menu', () => ({
  __esModule: true,
  default: (props: any) => {
    // Only the mobile instance wires onLabel/onMarkUnread/onMarkSpam/onMarkHam;
    // the desktop instance omits them. Use that to keep testids unique per instance.
    const prefix = props.onLabel ? 'mobile' : 'desktop'
    return (
      <div data-testid={`mock-more-menu-${prefix}`}>
        {props.onMarkUnread && (
          <button
            data-testid={`mock-${prefix}-mark-unread`}
            onClick={props.onMarkUnread}
          >
            mark-unread
          </button>
        )}
        {props.showArchive && props.onArchive && (
          <button
            data-testid={`mock-${prefix}-archive`}
            onClick={props.onArchive}
          >
            archive
          </button>
        )}
        {props.showDownload && props.onDownload && (
          <button
            data-testid={`mock-${prefix}-download`}
            onClick={props.onDownload}
          >
            download
          </button>
        )}
        {props.showViewSource && props.onViewSource && (
          <button
            data-testid={`mock-${prefix}-view-source`}
            onClick={props.onViewSource}
          >
            view-source
          </button>
        )}
        {(props.folderSpecificActions ?? []).map((action: any) => (
          <button
            key={action.id}
            data-testid={`mock-${prefix}-folder-action-${action.id}`}
            onClick={() => props.onFolderSpecificAction?.(action)}
          >
            {action.title}
          </button>
        ))}
        {props.showMoveCopy &&
          props.onSelectDestination &&
          props.onCreateFolder && (
            <>
              <button
                data-testid={`mock-${prefix}-select-move-archive`}
                onClick={() => props.onSelectDestination('move', 'Archive')}
              >
                select-move-archive
              </button>
              <button
                data-testid={`mock-${prefix}-select-copy-archive`}
                onClick={() => props.onSelectDestination('copy', 'Archive')}
              >
                select-copy-archive
              </button>
              <button
                data-testid={`mock-${prefix}-create-move`}
                onClick={() => props.onCreateFolder('move')}
              >
                create-move
              </button>
              <button
                data-testid={`mock-${prefix}-create-copy`}
                onClick={() => props.onCreateFolder('copy')}
              >
                create-copy
              </button>
            </>
          )}
      </div>
    )
  },
}))

jest.mock('@/components/ui/buttons/tooltip-button', () => ({
  TooltipButton: ({
    children,
    onClick,
    disabled,
    'data-testid': testId,
  }: any) => (
    <button onClick={onClick} disabled={disabled} data-testid={testId}>
      {children}
    </button>
  ),
}))

describe('MailDetailActionBar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    const {
      useMailItemActions,
    } = require('@/features/mails/hooks/use-mail-item-actions')
    useMailItemActions.mockImplementation(
      ({ onRemoved }: { onRemoved?: () => void }) => ({
        deleteMail: jest.fn(async () => {
          onRemoved?.()
        }),
        markUnread: mockMarkUnread,
        markSpam: mockMarkSpam,
        markHam: mockMarkHam,
        archiveMail: mockArchiveMail,
        moveMail: mockMoveMail,
        copyMail: mockCopyMail,
        applyLabel: jest.fn(),
        removeLabel: jest.fn(),
        markImportant: mockMarkImportant,
        removeImportant: mockRemoveImportant,
        isJunk: false,
        isTrash: false,
        isLoading: false,
      })
    )
  })

  it('opens delete confirmation dialog on delete click', () => {
    render(
      <MailDetailActionBar accountId="0" folder="INBOX" mailId="42" seen />
    )
    fireEvent.click(screen.getAllByTestId('mail-action-btn-delete.string')[0])
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
  })

  it('redirects to the mail list after a mail is deleted', () => {
    render(
      <MailDetailActionBar accountId="0" folder="INBOX" mailId="42" seen />
    )
    fireEvent.click(screen.getAllByTestId('mail-action-btn-delete.string')[0])
    fireEvent.click(screen.getByText('delete_confirm.confirm.string'))
    expect(mockPush).toHaveBeenCalledWith('/u/0/INBOX')
  })

  it('shows mark as spam button when not in junk folder', () => {
    render(
      <MailDetailActionBar accountId="0" folder="INBOX" mailId="42" seen />
    )
    expect(
      screen.getByTestId('mail-action-btn-report_spam.string')
    ).toBeInTheDocument()
  })

  it('shows mark as important action and calls markImportant', () => {
    render(
      <MailDetailActionBar
        accountId="0"
        folder="INBOX"
        mailId="42"
        seen
        flagged={false}
      />
    )
    expect(
      screen.getByTestId('mail-action-btn-mark_important.string')
    ).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('mail-action-btn-mark_important.string'))
    expect(mockMarkImportant).toHaveBeenCalledTimes(1)
  })

  it('shows unmark important action and calls removeImportant when already flagged', () => {
    render(
      <MailDetailActionBar
        accountId="0"
        folder="INBOX"
        mailId="42"
        seen
        flagged
      />
    )
    fireEvent.click(
      screen.getByTestId('mail-action-btn-unmark_important.string')
    )
    expect(mockRemoveImportant).toHaveBeenCalledTimes(1)
  })

  it('renders a move/copy menu button in the desktop action bar', () => {
    render(
      <MailDetailActionBar accountId="0" folder="INBOX" mailId="42" seen />
    )
    expect(screen.getByTestId('mail-action-btn-move-copy')).toBeInTheDocument()
  })

  it('moves the mail directly when a destination is picked from the desktop menu', () => {
    render(
      <MailDetailActionBar accountId="0" folder="INBOX" mailId="42" seen />
    )
    fireEvent.click(screen.getByTestId('mock-select-move-archive'))
    expect(mockMoveMail).toHaveBeenCalledWith('Archive')
    expect(screen.queryByTestId('mock-confirm-move')).not.toBeInTheDocument()
  })

  it('copies the mail directly when a destination is picked from the desktop menu', () => {
    render(
      <MailDetailActionBar accountId="0" folder="INBOX" mailId="42" seen />
    )
    fireEvent.click(screen.getByTestId('mock-select-copy-archive'))
    expect(mockCopyMail).toHaveBeenCalledWith('Archive')
    expect(screen.queryByTestId('mock-confirm-copy')).not.toBeInTheDocument()
  })

  it('opens the create-folder dialog in move mode and moves the mail there', () => {
    render(
      <MailDetailActionBar accountId="0" folder="INBOX" mailId="42" seen />
    )
    expect(screen.queryByTestId('mock-confirm-move')).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('mock-create-move'))
    fireEvent.click(screen.getByTestId('mock-confirm-move'))

    expect(mockMoveMail).toHaveBeenCalledWith('Archive/Projects')
  })

  it('opens the create-folder dialog in copy mode and copies the mail there', () => {
    render(
      <MailDetailActionBar accountId="0" folder="INBOX" mailId="42" seen />
    )
    expect(screen.queryByTestId('mock-confirm-copy')).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('mock-create-copy'))
    fireEvent.click(screen.getByTestId('mock-confirm-copy'))

    expect(mockCopyMail).toHaveBeenCalledWith('Archive/Projects')
  })

  describe('mobile more menu wiring', () => {
    it('marks unread from the mobile more menu', () => {
      render(
        <MailDetailActionBar accountId="0" folder="INBOX" mailId="42" seen />
      )
      fireEvent.click(screen.getByTestId('mock-mobile-mark-unread'))
      expect(mockMarkUnread).toHaveBeenCalledTimes(1)
    })

    it('archives the mail from the mobile more menu', () => {
      render(
        <MailDetailActionBar accountId="0" folder="INBOX" mailId="42" seen />
      )
      fireEvent.click(screen.getByTestId('mock-mobile-archive'))
      expect(mockArchiveMail).toHaveBeenCalledTimes(1)
    })

    it('downloads the mail from the mobile more menu', () => {
      render(
        <MailDetailActionBar accountId="0" folder="INBOX" mailId="42" seen />
      )
      fireEvent.click(screen.getByTestId('mock-mobile-download'))
      expect(mockDownloadMail).toHaveBeenCalledTimes(1)
    })

    it('fetches the raw source from the mobile more menu', () => {
      render(
        <MailDetailActionBar accountId="0" folder="INBOX" mailId="42" seen />
      )
      fireEvent.click(screen.getByTestId('mock-mobile-view-source'))
      expect(mockFetchRaw).toHaveBeenCalledTimes(1)
    })

    it('moves the mail directly from the mobile more menu', () => {
      render(
        <MailDetailActionBar accountId="0" folder="INBOX" mailId="42" seen />
      )
      fireEvent.click(screen.getByTestId('mock-mobile-select-move-archive'))
      expect(mockMoveMail).toHaveBeenCalledWith('Archive')
    })

    it('copies the mail directly from the mobile more menu', () => {
      render(
        <MailDetailActionBar accountId="0" folder="INBOX" mailId="42" seen />
      )
      fireEvent.click(screen.getByTestId('mock-mobile-select-copy-archive'))
      expect(mockCopyMail).toHaveBeenCalledWith('Archive')
    })

    it('opens the create-folder dialog from the mobile more menu in move mode', () => {
      render(
        <MailDetailActionBar accountId="0" folder="INBOX" mailId="42" seen />
      )
      fireEvent.click(screen.getByTestId('mock-mobile-create-move'))
      fireEvent.click(screen.getByTestId('mock-confirm-move'))
      expect(mockMoveMail).toHaveBeenCalledWith('Archive/Projects')
    })

    it('opens the create-folder dialog from the mobile more menu in copy mode', () => {
      render(
        <MailDetailActionBar accountId="0" folder="INBOX" mailId="42" seen />
      )
      fireEvent.click(screen.getByTestId('mock-mobile-create-copy'))
      fireEvent.click(screen.getByTestId('mock-confirm-copy'))
      expect(mockCopyMail).toHaveBeenCalledWith('Archive/Projects')
    })

    it('exposes folder-specific actions in the mobile more menu', () => {
      const {
        useMailDetailFolderActions,
      } = require('@/features/mails/hooks/use-mail-detail-folder-actions')
      const handleFolderSpecificAction = jest.fn(() => true)
      useMailDetailFolderActions.mockReturnValueOnce({
        folderSpecificActions: [
          { id: 'edit-draft', icon: <span />, title: 'edit_draft.string' },
        ],
        handleFolderSpecificAction,
      })

      render(
        <MailDetailActionBar accountId="0" folder="INBOX" mailId="42" seen />
      )
      fireEvent.click(
        screen.getByTestId('mock-mobile-folder-action-edit-draft')
      )
      expect(handleFolderSpecificAction).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'edit-draft' })
      )
    })
  })
})
