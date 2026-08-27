import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useSetAddressBookShareMutation } from '@/features/address_books/store/address-books-api'
import { useSetCalendarShareMutation } from '@/features/calendars/store/calendars-api'
import { useSetFolderShareMutation } from '@/features/mails/store/mails-api'
import { useProfile } from '@/features/user-profile'
import type { GlobalAccessUserEntry } from '../../store/access-api'
import GlobalAccessUserRow from '../global-access-user-row'

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string, values?: Record<string, unknown>) =>
    values?.count !== undefined ? `${key} ${values.count}` : key
  ),
}))

jest.mock('../global-access-grant-row', () => ({
  __esModule: true,
  default: ({ grant }: { grant: { itemName: string } }) => (
    <div data-testid="global-access-grant-row">{grant.itemName}</div>
  ),
}))

jest.mock('../copy-access-dialog', () => ({
  __esModule: true,
  default: ({ open }: { open: boolean }) => (
    <div data-testid="copy-access-dialog" data-open={String(open)} />
  ),
}))

jest.mock('../add-folder-access-dialog', () => ({
  __esModule: true,
  default: ({ open }: { open: boolean }) => (
    <div data-testid="add-folder-access-dialog" data-open={String(open)} />
  ),
}))
jest.mock('../add-calendar-access-dialog', () => ({
  __esModule: true,
  default: ({ open }: { open: boolean }) => (
    <div data-testid="add-calendar-access-dialog" data-open={String(open)} />
  ),
}))
jest.mock('../add-address-book-access-dialog', () => ({
  __esModule: true,
  default: ({ open }: { open: boolean }) => (
    <div data-testid="add-address-book-access-dialog" data-open={String(open)} />
  ),
}))

const mockSetFolderShare = jest.fn(() => ({ unwrap: () => Promise.resolve(undefined) }))
const mockSetCalendarShare = jest.fn(() => ({ unwrap: () => Promise.resolve(undefined) }))
const mockSetAddressBookShare = jest.fn(() => ({ unwrap: () => Promise.resolve(undefined) }))

jest.mock('@/features/mails/store/mails-api', () => ({
  useSetFolderShareMutation: jest.fn(),
}))
jest.mock('@/features/calendars/store/calendars-api', () => ({
  useSetCalendarShareMutation: jest.fn(),
}))
jest.mock('@/features/address_books/store/address-books-api', () => ({
  useSetAddressBookShareMutation: jest.fn(),
}))
jest.mock('@/features/user-profile', () => ({
  useProfile: jest.fn(() => ({ mainAccount: { id: '0' } })),
}))

const entry: GlobalAccessUserEntry = {
  key: 'bob@example.com',
  uid: 'bob',
  c_email: 'bob@example.com',
  grants: [
    {
      domain: 'mail',
      itemKey: 'INBOX',
      itemName: 'Inbox',
      uid: 'bob',
      c_email: 'bob@example.com',
      rights: {},
      allItemUsers: [
        { uid: 'bob', c_email: 'bob@example.com', userClass: 'normal-user', rights: {} },
        { uid: 'carol', c_email: 'carol@example.com', userClass: 'normal-user', rights: {} },
      ],
    } as never,
  ],
}

describe('GlobalAccessUserRow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useSetFolderShareMutation as jest.Mock).mockReturnValue([mockSetFolderShare, { isLoading: false }])
    ;(useSetCalendarShareMutation as jest.Mock).mockReturnValue([mockSetCalendarShare, { isLoading: false }])
    ;(useSetAddressBookShareMutation as jest.Mock).mockReturnValue([mockSetAddressBookShare, { isLoading: false }])
    ;(useProfile as jest.Mock).mockReturnValue({ mainAccount: { id: '0' } })
  })

  it('renders the user name and grant count, collapsed by default', () => {
    render(<GlobalAccessUserRow entry={entry} />)

    expect(screen.getByText('bob@example.com')).toBeInTheDocument()
    expect(screen.getByText('user.grantCountOne.string')).toBeInTheDocument()
    expect(screen.queryByTestId('global-access-grant-row')).not.toBeInTheDocument()
  })

  it('expands to show grants when clicked', async () => {
    const user = userEvent.setup()
    render(<GlobalAccessUserRow entry={entry} />)

    await user.click(screen.getByText('bob@example.com'))

    expect(screen.getByTestId('global-access-grant-row')).toBeInTheDocument()
    expect(screen.getByText('Inbox')).toBeInTheDocument()
  })

  it('falls back to uid when c_email is missing', () => {
    render(
      <GlobalAccessUserRow entry={{ ...entry, c_email: undefined }} />
    )
    expect(screen.getByText('bob')).toBeInTheDocument()
  })

  it('uses the plural grant count label for multiple grants', () => {
    render(
      <GlobalAccessUserRow
        entry={{
          ...entry,
          grants: [...entry.grants, { ...entry.grants[0], itemKey: 'cal-1' }],
        }}
      />
    )
    expect(screen.getByText('user.grantCount.string 2')).toBeInTheDocument()
  })

  it('has no separate edit action', () => {
    render(<GlobalAccessUserRow entry={entry} />)
    expect(screen.queryByText('user.actions.edit.string')).not.toBeInTheDocument()
  })

  it('opens the folder add-access dialog from the Add access menu', async () => {
    const user = userEvent.setup()
    render(<GlobalAccessUserRow entry={entry} />)

    expect(screen.getByTestId('add-folder-access-dialog')).toHaveAttribute('data-open', 'false')

    await user.click(screen.getByText('user.actions.add.string'))
    await user.click(screen.getByText('addAccess.menu.folder.string'))

    expect(screen.getByTestId('add-folder-access-dialog')).toHaveAttribute('data-open', 'true')
  })

  it('opens the copy access dialog when the copy icon is clicked', async () => {
    const user = userEvent.setup()
    render(<GlobalAccessUserRow entry={entry} />)

    expect(screen.getByTestId('copy-access-dialog')).toHaveAttribute('data-open', 'false')
    await user.click(screen.getByText('user.actions.copy.string'))
    expect(screen.getByTestId('copy-access-dialog')).toHaveAttribute('data-open', 'true')
  })

  it('asks for confirmation before removing all access, then calls setFolderShare without the user', async () => {
    const user = userEvent.setup()
    render(<GlobalAccessUserRow entry={entry} />)

    await user.click(screen.getByText('user.actions.delete.string'))
    expect(screen.getByText('user.deleteConfirm.title.string')).toBeInTheDocument()

    await user.click(screen.getByText('user.deleteConfirm.confirm.string'))

    expect(mockSetFolderShare).toHaveBeenCalledWith({
      accountId: '0',
      folderPath: 'INBOX',
      users: [entry.grants[0].allItemUsers[1]],
    })
  })

  describe('pending entry (no grants yet)', () => {
    const pendingEntry: GlobalAccessUserEntry = {
      key: 'newuser@example.com',
      uid: 'newuser@example.com',
      c_email: 'newuser@example.com',
      grants: [],
    }

    it('disables the copy action since there is nothing to copy yet', () => {
      render(<GlobalAccessUserRow entry={pendingEntry} />)
      expect(screen.getByText('user.actions.copy.string').closest('button')).toBeDisabled()
    })

    it('shows the pending-removal confirmation copy instead of the delete-all copy', async () => {
      const user = userEvent.setup()
      render(<GlobalAccessUserRow entry={pendingEntry} />)

      await user.click(screen.getByText('user.actions.delete.string'))

      expect(screen.getByText('user.removePendingConfirm.title.string')).toBeInTheDocument()
      expect(
        screen.queryByText('user.deleteConfirm.title.string')
      ).not.toBeInTheDocument()
    })

    it('calls onRemovePending instead of any mutation when confirmed', async () => {
      const user = userEvent.setup()
      const onRemovePending = jest.fn()
      render(
        <GlobalAccessUserRow entry={pendingEntry} onRemovePending={onRemovePending} />
      )

      await user.click(screen.getByText('user.actions.delete.string'))
      await user.click(screen.getByText('user.deleteConfirm.confirm.string'))

      expect(onRemovePending).toHaveBeenCalled()
      expect(mockSetFolderShare).not.toHaveBeenCalled()
      expect(mockSetCalendarShare).not.toHaveBeenCalled()
      expect(mockSetAddressBookShare).not.toHaveBeenCalled()
    })
  })
})
