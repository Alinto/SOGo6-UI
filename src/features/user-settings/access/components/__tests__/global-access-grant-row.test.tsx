import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useSetAddressBookShareMutation } from '@/features/address_books/store/address-books-api'
import { useSetCalendarShareMutation } from '@/features/calendars/store/calendars-api'
import { useSetFolderShareMutation } from '@/features/mails/store/mails-api'
import { useProfile } from '@/features/user-profile'
import type { GlobalAccessGrant } from '../../store/access-api'
import GlobalAccessGrantRow from '../global-access-grant-row'

// --- Mocks ---

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
  useTranslations: jest.fn(() => (key: string, values?: Record<string, string>) =>
    values?.item ? `${key} ${values.item}` : key
  ),
}))

jest.mock('@/features/mails/components/sidebars/share-folder-dialog', () => ({
  ShareFolderDialog: ({ allowAddUsers }: { allowAddUsers?: boolean }) => (
    <div data-testid="share-folder-dialog" data-allow-add-users={String(allowAddUsers)} />
  ),
}))
jest.mock('@/features/calendars/components/sidebar/actions/share', () => ({
  __esModule: true,
  default: ({ allowAddUsers }: { allowAddUsers?: boolean }) => (
    <div data-testid="share-calendar-action" data-allow-add-users={String(allowAddUsers)} />
  ),
}))
jest.mock('@/features/address_books/components/sidebar/actions/share', () => ({
  __esModule: true,
  default: ({ allowAddUsers }: { allowAddUsers?: boolean }) => (
    <div data-testid="share-address-book-action" data-allow-add-users={String(allowAddUsers)} />
  ),
}))

// --- Fixtures ---

const mailGrant: GlobalAccessGrant = {
  domain: 'mail',
  itemKey: 'INBOX/Work',
  itemName: 'Work',
  uid: 'bob',
  c_email: 'bob@example.com',
  rights: {},
  allItemUsers: [
    { uid: 'bob', c_email: 'bob@example.com', userClass: 'normal-user', rights: {} },
    { uid: 'carol', c_email: 'carol@example.com', userClass: 'normal-user', rights: {} },
  ],
}

describe('GlobalAccessGrantRow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useSetFolderShareMutation as jest.Mock).mockReturnValue([mockSetFolderShare, { isLoading: false }])
    ;(useSetCalendarShareMutation as jest.Mock).mockReturnValue([mockSetCalendarShare, { isLoading: false }])
    ;(useSetAddressBookShareMutation as jest.Mock).mockReturnValue([mockSetAddressBookShare, { isLoading: false }])
    ;(useProfile as jest.Mock).mockReturnValue({ mainAccount: { id: '0' } })
  })

  it('renders a Change and a Remove action, with no add-user affordance', () => {
    render(<GlobalAccessGrantRow grant={mailGrant} />)

    expect(screen.getByText('grant.change.string')).toBeInTheDocument()
    expect(screen.getByText('grant.remove.string')).toBeInTheDocument()
    expect(screen.queryByText(/addUser/)).not.toBeInTheDocument()
  })

  it('opens the mail share dialog with allowAddUsers disabled when Change is clicked', async () => {
    const user = userEvent.setup()
    render(<GlobalAccessGrantRow grant={mailGrant} />)

    await user.click(screen.getByText('grant.change.string'))

    expect(screen.getByTestId('share-folder-dialog')).toHaveAttribute(
      'data-allow-add-users',
      'false'
    )
  })

  it('asks for confirmation before removing, then calls setFolderShare without the removed user', async () => {
    const user = userEvent.setup()
    render(<GlobalAccessGrantRow grant={mailGrant} />)

    await user.click(screen.getByText('grant.remove.string'))
    expect(screen.getByText('grant.removeConfirm.title.string')).toBeInTheDocument()

    await user.click(screen.getByText('grant.removeConfirm.confirm.string'))

    expect(mockSetFolderShare).toHaveBeenCalledWith({
      accountId: '0',
      folderPath: 'INBOX/Work',
      users: [mailGrant.allItemUsers[1]],
    })
  })

  it('calls setCalendarShare for a calendar grant', async () => {
    const user = userEvent.setup()
    const calendarGrant: GlobalAccessGrant = {
      domain: 'calendar',
      itemKey: 'cal-1',
      itemName: 'My Calendar',
      uid: 'bob',
      rights: {} as never,
      allItemUsers: [
        { uid: 'bob', userClass: 'normal-user', rights: {} as never },
      ],
    }

    render(<GlobalAccessGrantRow grant={calendarGrant} />)
    await user.click(screen.getByText('grant.remove.string'))
    await user.click(screen.getByText('grant.removeConfirm.confirm.string'))

    expect(mockSetCalendarShare).toHaveBeenCalledWith({
      calendarKey: 'cal-1',
      users: [],
    })
  })

  it('calls setAddressBookShare for a contact grant', async () => {
    const user = userEvent.setup()
    const bookGrant: GlobalAccessGrant = {
      domain: 'contact',
      itemKey: 'book-1',
      itemName: 'My Contacts',
      uid: 'bob',
      rights: {} as never,
      allItemUsers: [
        { uid: 'bob', userClass: 'normal-user', rights: {} as never },
      ],
    }

    render(<GlobalAccessGrantRow grant={bookGrant} />)
    await user.click(screen.getByText('grant.remove.string'))
    await user.click(screen.getByText('grant.removeConfirm.confirm.string'))

    expect(mockSetAddressBookShare).toHaveBeenCalledWith({
      bookId: 'book-1',
      users: [],
    })
  })
})
