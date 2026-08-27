import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { useTranslations } from 'next-intl'
import { useGetCalendarShareQuery } from '@/features/calendars/store/calendars-api'
import CalendarAccessListRow from '../calendar-access-list-row'

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}))

jest.mock('@/features/calendars/store/calendars-api', () => ({
  useGetCalendarShareQuery: jest.fn(),
}))

jest.mock('@/features/calendars/components/sidebar/actions/share', () => ({
  __esModule: true,
  default: () => <div data-testid="share-calendar-action" />,
}))

const calendar = { key: 'cal-1', id: 'cal-1', name: 'Personal' } as never

const NONE_RIGHTS = {
  public: 'none',
  confidential: 'none',
  private: 'none',
  can_create_objects: false,
  can_erase_objects: false,
}

describe('CalendarAccessListRow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useTranslations as jest.Mock).mockReturnValue(
      (key: string, values?: Record<string, unknown>) =>
        values?.count !== undefined ? `${key} ${values.count}` : key
    )
  })

  it('shows "not shared" when nobody has access', () => {
    ;(useGetCalendarShareQuery as jest.Mock).mockReturnValue({
      data: { users: {} },
      isLoading: false,
    })

    render(<CalendarAccessListRow calendar={calendar} />)

    expect(screen.getByText('row.notShared.string')).toBeInTheDocument()
  })

  it('never counts "any authenticated user" toward the people count, and shows it separately', () => {
    ;(useGetCalendarShareQuery as jest.Mock).mockReturnValue({
      data: {
        users: {
          alice: { uid: 'alice', userClass: 'normal-user', rights: NONE_RIGHTS },
          bob: { uid: 'bob', userClass: 'normal-user', rights: NONE_RIGHTS },
          anyauthenticated: {
            uid: 'anyauthenticated',
            userClass: 'any-authenticated-user',
            rights: { ...NONE_RIGHTS, public: 'view-all' },
          },
        },
      },
      isLoading: false,
    })

    render(<CalendarAccessListRow calendar={calendar} />)

    expect(screen.getByText('row.sharedCount.string 2')).toBeInTheDocument()
    expect(
      screen.getByText('row.anyAuthenticated.string')
    ).toBeInTheDocument()
  })

  it('shows only the "any authenticated user" line when no named user has access', () => {
    ;(useGetCalendarShareQuery as jest.Mock).mockReturnValue({
      data: {
        users: {
          anyauthenticated: {
            uid: 'anyauthenticated',
            userClass: 'any-authenticated-user',
            rights: { ...NONE_RIGHTS, can_create_objects: true },
          },
        },
      },
      isLoading: false,
    })

    render(<CalendarAccessListRow calendar={calendar} />)

    expect(screen.queryByText(/row\.sharedOne/)).not.toBeInTheDocument()
    expect(screen.queryByText(/row\.sharedCount/)).not.toBeInTheDocument()
    expect(
      screen.getByText('row.anyAuthenticated.string')
    ).toBeInTheDocument()
  })

  it('does not show the "any authenticated user" line when it has no permissions selected', () => {
    ;(useGetCalendarShareQuery as jest.Mock).mockReturnValue({
      data: {
        users: {
          alice: { uid: 'alice', userClass: 'normal-user', rights: NONE_RIGHTS },
          anyauthenticated: {
            uid: 'anyauthenticated',
            userClass: 'any-authenticated-user',
            rights: NONE_RIGHTS,
          },
        },
      },
      isLoading: false,
    })

    render(<CalendarAccessListRow calendar={calendar} />)

    expect(screen.getByText('row.sharedOne.string')).toBeInTheDocument()
    expect(
      screen.queryByText('row.anyAuthenticated.string')
    ).not.toBeInTheDocument()
  })

  it('shows "not shared" when the only entry is "any authenticated user" with no permissions', () => {
    ;(useGetCalendarShareQuery as jest.Mock).mockReturnValue({
      data: {
        users: {
          anyauthenticated: {
            uid: 'anyauthenticated',
            userClass: 'any-authenticated-user',
            rights: NONE_RIGHTS,
          },
        },
      },
      isLoading: false,
    })

    render(<CalendarAccessListRow calendar={calendar} />)

    expect(screen.getByText('row.notShared.string')).toBeInTheDocument()
  })
})
