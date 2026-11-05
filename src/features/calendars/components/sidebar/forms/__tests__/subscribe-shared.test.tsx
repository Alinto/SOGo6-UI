import { SHARED_USERS_PAGE_SIZE } from '@/components/shared-subscribe/shared-subscribe-dialog'
import type {
  SharedCalendar,
  SharedCalendarUser,
} from '@/features/calendars/calendars-types'
import { DEFAULT_CALENDAR_COLOR } from '@/features/calendars/calendars-types'
import { skipToken } from '@reduxjs/toolkit/query'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import SubscribeSharedCalendar from '../subscribe-shared'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) =>
    values ? `${key} ${JSON.stringify(values)}` : key,
}))

const mockUsersQuery = jest.fn()
const mockOwnerCalendarsQuery = jest.fn()
const mockSubscribe = jest.fn()
const mockUnwrap = jest.fn()

jest.mock('@/features/calendars/store/calendars-api', () => ({
  useGetSharedCalendarUsersQuery: (...args: unknown[]) =>
    mockUsersQuery(...args),
  useGetSharedCalendarsByOwnerQuery: (...args: unknown[]) =>
    mockOwnerCalendarsQuery(...args),
  useUpdateSharedCalendarSubscriptionMutation: () => [mockSubscribe],
}))

jest.mock('@/components/ui/sidebar', () => {
  const ReactActual = jest.requireActual<typeof import('react')>('react')
  return {
    SidebarGroupAction: ReactActual.forwardRef<
      HTMLButtonElement,
      React.ButtonHTMLAttributes<HTMLButtonElement>
    >(function MockSidebarGroupAction(props, ref) {
      return <button ref={ref} type="button" {...props} />
    }),
  }
})

const OWNER = 'sogo-tests1@example.org'

const USERS: SharedCalendarUser[] = [{ owner: OWNER, username: 'Sogo test1' }]

const CALENDARS: SharedCalendar[] = [
  {
    key: 'cal-1',
    name: 'Team',
    description: null,
    color: '#813d9c',
    owner: OWNER,
    subscribed: true,
  },
  // No key and no color: falls back to the id and the default color.
  {
    id: 'cal-2',
    name: 'Holidays',
    description: null,
    owner: OWNER,
    subscribed: false,
  },
]

const openDialog = async () => {
  const user = userEvent.setup()
  render(<SubscribeSharedCalendar />)
  await user.click(
    screen.getByRole('button', { name: 'shared_subscribe.add_title.string' })
  )
  return user
}

describe('SubscribeSharedCalendar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUnwrap.mockResolvedValue(undefined)
    mockSubscribe.mockReturnValue({ unwrap: mockUnwrap })
    mockUsersQuery.mockImplementation((arg: unknown) =>
      arg === skipToken
        ? { isFetching: false, isError: false }
        : {
            data: { users: USERS, total_count: 21, total_pages: 2 },
            currentData: { users: USERS, total_count: 21, total_pages: 2 },
            isFetching: false,
            isError: false,
          }
    )
    mockOwnerCalendarsQuery.mockReturnValue({
      data: CALENDARS,
      isError: false,
    })
  })

  it('lists the users sharing calendars with the calendar labels', async () => {
    await openDialog()

    expect(mockUsersQuery).toHaveBeenLastCalledWith(
      {
        page: 1,
        page_size: SHARED_USERS_PAGE_SIZE,
        search: '',
      },
      { refetchOnMountOrArgChange: true }
    )
    expect(
      screen.getByText('shared_subscribe.description.string')
    ).toBeInTheDocument()
    expect(screen.getByText('Sogo test1')).toBeInTheDocument()
    expect(
      screen.getByText(
        'shared_subscribe.pagination.page.string {"page":1,"total":2}'
      )
    ).toBeInTheDocument()
  })

  it("shows the owner's calendars with their color", async () => {
    const user = await openDialog()
    await user.click(screen.getByRole('button', { name: /Sogo test1/ }))

    expect(mockOwnerCalendarsQuery).toHaveBeenCalledWith(OWNER)
    const colorDot = (name: string) =>
      screen.getByText(name).closest('li')?.querySelector('span[aria-hidden]')
    expect(colorDot('Team')).toHaveStyle({ backgroundColor: '#813d9c' })
    expect(colorDot('Holidays')).toHaveStyle({
      backgroundColor: DEFAULT_CALENDAR_COLOR,
    })
    expect(
      screen.getByRole('button', { name: 'shared_subscribe.subscribed.string' })
    ).toBeDisabled()
  })

  it('subscribes with the calendar key, or its id without one', async () => {
    const user = await openDialog()
    await user.click(screen.getByRole('button', { name: /Sogo test1/ }))
    await user.click(
      screen.getByRole('button', { name: 'shared_subscribe.subscribe.string' })
    )

    expect(mockSubscribe).toHaveBeenCalledWith({
      key: 'cal-2',
      subscribe: true,
    })
    expect(mockUnwrap).toHaveBeenCalled()
  })
})
