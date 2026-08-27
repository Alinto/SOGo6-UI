import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useSetAddressBookShareMutation } from '@/features/address_books/store/address-books-api'
import { useSetCalendarShareMutation } from '@/features/calendars/store/calendars-api'
import { useSetFolderShareMutation } from '@/features/mails/store/mails-api'
import { useProfile } from '@/features/user-profile'
import type { GlobalAccessUserEntry } from '../../store/access-api'
import CopyAccessDialog from '../copy-access-dialog'

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

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string, values?: Record<string, unknown>) =>
    values ? `${key} ${JSON.stringify(values)}` : key
  ),
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
      ],
    } as never,
  ],
}

describe('CopyAccessDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useSetFolderShareMutation as jest.Mock).mockReturnValue([mockSetFolderShare, { isLoading: false }])
    ;(useSetCalendarShareMutation as jest.Mock).mockReturnValue([mockSetCalendarShare, { isLoading: false }])
    ;(useSetAddressBookShareMutation as jest.Mock).mockReturnValue([mockSetAddressBookShare, { isLoading: false }])
    ;(useProfile as jest.Mock).mockReturnValue({ mainAccount: { id: '0' } })
  })

  it('shows a validation error for an invalid email', async () => {
    const user = userEvent.setup()
    render(<CopyAccessDialog open onOpenChange={jest.fn()} entry={entry} />)

    await user.type(screen.getByPlaceholderText('user.copy.placeholder.string'), 'not-an-email')
    await user.click(screen.getByText('user.copy.confirm.string'))

    expect(screen.getByText('user.copy.error.invalid.string')).toBeInTheDocument()
    expect(mockSetFolderShare).not.toHaveBeenCalled()
  })

  it('rejects copying access to the same person', async () => {
    const user = userEvent.setup()
    render(<CopyAccessDialog open onOpenChange={jest.fn()} entry={entry} />)

    await user.type(screen.getByPlaceholderText('user.copy.placeholder.string'), 'bob@example.com')
    await user.click(screen.getByText('user.copy.confirm.string'))

    expect(screen.getByText('user.copy.error.same.string')).toBeInTheDocument()
    expect(mockSetFolderShare).not.toHaveBeenCalled()
  })

  it('copies every grant to the target user and closes on success', async () => {
    const user = userEvent.setup()
    const onOpenChange = jest.fn()
    render(<CopyAccessDialog open onOpenChange={onOpenChange} entry={entry} />)

    await user.type(screen.getByPlaceholderText('user.copy.placeholder.string'), 'carol@example.com')
    await user.click(screen.getByText('user.copy.confirm.string'))

    await waitFor(() => {
      expect(mockSetFolderShare).toHaveBeenCalledWith({
        accountId: '0',
        folderPath: 'INBOX',
        users: [
          entry.grants[0].allItemUsers[0],
          expect.objectContaining({ uid: 'carol@example.com', c_email: 'carol@example.com' }),
        ],
      })
    })
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
  })
})
