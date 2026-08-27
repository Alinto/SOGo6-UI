import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { useTranslations } from 'next-intl'
import { useGetFolderShareQuery } from '@/features/mails/store/mails-api'
import MailAccessListRow from '../mail-access-list-row'

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}))

jest.mock('@/features/mails/store/mails-api', () => ({
  useGetFolderShareQuery: jest.fn(),
}))

jest.mock('@/features/mails/components/sidebars/share-folder-dialog', () => ({
  ShareFolderDialog: () => <div data-testid="share-folder-dialog" />,
}))

const folder = { name: 'Work', path: 'INBOX/Work', selectable: true } as never

describe('MailAccessListRow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useTranslations as jest.Mock).mockReturnValue(
      (key: string, values?: Record<string, unknown>) =>
        values?.count !== undefined ? `${key} ${values.count}` : key
    )
  })

  it('shows "not shared" when nobody has access', () => {
    ;(useGetFolderShareQuery as jest.Mock).mockReturnValue({
      data: { users: {} },
      isLoading: false,
    })

    render(<MailAccessListRow accountId="0" folder={folder} />)

    expect(screen.getByText('row.notShared.string')).toBeInTheDocument()
  })

  it('counts only named users, excluding "any authenticated user"', () => {
    ;(useGetFolderShareQuery as jest.Mock).mockReturnValue({
      data: {
        users: {
          alice: { uid: 'alice', userClass: 'normal-user', rights: {} },
          bob: { uid: 'bob', userClass: 'normal-user', rights: {} },
          anyauthenticated: {
            uid: 'anyauthenticated',
            userClass: 'any-authenticated-user',
            rights: { userCanViewFolder: 1, userCanReadMails: 1 },
          },
        },
      },
      isLoading: false,
    })

    render(<MailAccessListRow accountId="0" folder={folder} />)

    expect(screen.getByText('row.sharedCount.string 2')).toBeInTheDocument()
    expect(
      screen.getByText('row.anyAuthenticated.string')
    ).toBeInTheDocument()
  })

  it('shows only the "any authenticated user" line when no named user has access', () => {
    ;(useGetFolderShareQuery as jest.Mock).mockReturnValue({
      data: {
        users: {
          anyauthenticated: {
            uid: 'anyauthenticated',
            userClass: 'any-authenticated-user',
            rights: { userCanViewFolder: 1, userCanReadMails: 1 },
          },
        },
      },
      isLoading: false,
    })

    render(<MailAccessListRow accountId="0" folder={folder} />)

    expect(screen.queryByText(/row\.sharedOne/)).not.toBeInTheDocument()
    expect(screen.queryByText(/row\.sharedCount/)).not.toBeInTheDocument()
    expect(
      screen.getByText('row.anyAuthenticated.string')
    ).toBeInTheDocument()
  })

  it('does not show the "any authenticated user" line when it has no permissions selected', () => {
    ;(useGetFolderShareQuery as jest.Mock).mockReturnValue({
      data: {
        users: {
          alice: { uid: 'alice', userClass: 'normal-user', rights: {} },
          anyauthenticated: {
            uid: 'anyauthenticated',
            userClass: 'any-authenticated-user',
            rights: {},
          },
        },
      },
      isLoading: false,
    })

    render(<MailAccessListRow accountId="0" folder={folder} />)

    expect(screen.getByText('row.sharedOne.string')).toBeInTheDocument()
    expect(
      screen.queryByText('row.anyAuthenticated.string')
    ).not.toBeInTheDocument()
  })

  it('shows "not shared" when the only entry is "any authenticated user" with no permissions', () => {
    ;(useGetFolderShareQuery as jest.Mock).mockReturnValue({
      data: {
        users: {
          anyauthenticated: {
            uid: 'anyauthenticated',
            userClass: 'any-authenticated-user',
            rights: {},
          },
        },
      },
      isLoading: false,
    })

    render(<MailAccessListRow accountId="0" folder={folder} />)

    expect(screen.getByText('row.notShared.string')).toBeInTheDocument()
  })

  it('uses the singular label for exactly one named user', () => {
    ;(useGetFolderShareQuery as jest.Mock).mockReturnValue({
      data: {
        users: {
          alice: { uid: 'alice', userClass: 'normal-user', rights: {} },
        },
      },
      isLoading: false,
    })

    render(<MailAccessListRow accountId="0" folder={folder} />)

    expect(screen.getByText('row.sharedOne.string')).toBeInTheDocument()
  })
})
