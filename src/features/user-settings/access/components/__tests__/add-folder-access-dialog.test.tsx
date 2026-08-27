import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  useGetFoldersQuery,
  useLazyGetFolderShareQuery,
  useSetFolderShareMutation,
} from '@/features/mails/store/mails-api'
import { useProfile } from '@/features/user-profile'
import type { GlobalAccessUserEntry } from '../../store/access-api'
import AddFolderAccessDialog from '../add-folder-access-dialog'

const mockSetFolderShare = jest.fn(() => ({ unwrap: () => Promise.resolve(undefined) }))
const mockFetchFolderShare = jest.fn()

jest.mock('@/features/mails/store/mails-api', () => ({
  useGetFoldersQuery: jest.fn(),
  useLazyGetFolderShareQuery: jest.fn(),
  useSetFolderShareMutation: jest.fn(),
}))
jest.mock('@/features/user-profile', () => ({
  useProfile: jest.fn(() => ({ mainAccount: { id: '0' } })),
}))
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}))

const entry: GlobalAccessUserEntry = {
  key: 'newuser@example.com',
  uid: 'newuser@example.com',
  c_email: 'newuser@example.com',
  grants: [],
}

describe('AddFolderAccessDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useProfile as jest.Mock).mockReturnValue({ mainAccount: { id: '0' } })
    ;(useGetFoldersQuery as jest.Mock).mockReturnValue({
      data: [
        { name: 'Inbox', path: 'INBOX', subfolders: [] },
        { name: 'Archive', path: 'INBOX/Archive', subfolders: [] },
      ],
      isLoading: false,
    })
    ;(useSetFolderShareMutation as jest.Mock).mockReturnValue([
      mockSetFolderShare,
      { isLoading: false },
    ])
    mockFetchFolderShare.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          users: {
            carol: { uid: 'carol', c_email: 'carol@example.com', userClass: 'normal-user', rights: {} },
          },
        }),
    })
    ;(useLazyGetFolderShareQuery as jest.Mock).mockReturnValue([mockFetchFolderShare])
  })

  it('does not show a user list or add-user input — the dialog is scoped to entry', () => {
    render(<AddFolderAccessDialog open onOpenChange={jest.fn()} entry={entry} />)

    expect(screen.queryByText('carol@example.com')).not.toBeInTheDocument()
    expect(screen.queryByText(/addUser/)).not.toBeInTheDocument()
  })

  it('disables Share until at least one item is selected', async () => {
    const user = userEvent.setup()
    render(<AddFolderAccessDialog open onOpenChange={jest.fn()} entry={entry} />)

    const shareButton = screen.getByText('addAccess.confirm.string')
    expect(shareButton).toBeDisabled()

    await user.click(screen.getByText('INBOX'))
    expect(shareButton).not.toBeDisabled()
  })

  it('grants entry access to each selected folder and preserves existing users', async () => {
    const user = userEvent.setup()
    const onOpenChange = jest.fn()
    render(<AddFolderAccessDialog open onOpenChange={onOpenChange} entry={entry} />)

    await user.click(screen.getByText('INBOX'))
    await user.click(screen.getByText('addAccess.confirm.string'))

    await waitFor(() => {
      expect(mockFetchFolderShare).toHaveBeenCalledWith({ accountId: '0', folderPath: 'INBOX' })
    })
    await waitFor(() => {
      expect(mockSetFolderShare).toHaveBeenCalledWith({
        accountId: '0',
        folderPath: 'INBOX',
        users: [
          expect.objectContaining({ uid: 'carol' }),
          expect.objectContaining({ uid: 'newuser@example.com', c_email: 'newuser@example.com' }),
        ],
      })
    })
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
  })

  it('hides folders already shared with this user', () => {
    render(
      <AddFolderAccessDialog
        open
        onOpenChange={jest.fn()}
        entry={{
          ...entry,
          grants: [
            {
              domain: 'mail',
              itemKey: 'INBOX/Archive',
              itemName: 'Archive',
              uid: entry.uid,
              c_email: entry.c_email,
              rights: {},
              allItemUsers: [],
            } as never,
          ],
        }}
      />
    )

    expect(screen.getByText('INBOX')).toBeInTheDocument()
    expect(screen.queryByText('INBOX/Archive')).not.toBeInTheDocument()
  })

  it('shows the all-shared message when every owned folder is already shared', () => {
    render(
      <AddFolderAccessDialog
        open
        onOpenChange={jest.fn()}
        entry={{
          ...entry,
          grants: [
            {
              domain: 'mail',
              itemKey: 'INBOX',
              itemName: 'Inbox',
              uid: entry.uid,
              c_email: entry.c_email,
              rights: {},
              allItemUsers: [],
            },
            {
              domain: 'mail',
              itemKey: 'INBOX/Archive',
              itemName: 'Archive',
              uid: entry.uid,
              c_email: entry.c_email,
              rights: {},
              allItemUsers: [],
            },
          ] as never,
        }}
      />
    )

    expect(screen.getByText('addAccess.allShared.string')).toBeInTheDocument()
  })
})
