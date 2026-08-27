import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  useGetCalendarsQuery,
  useLazyGetCalendarShareQuery,
  useSetCalendarShareMutation,
} from '@/features/calendars/store/calendars-api'
import type { GlobalAccessUserEntry } from '../../store/access-api'
import AddCalendarAccessDialog from '../add-calendar-access-dialog'

const mockSetCalendarShare = jest.fn(() => ({ unwrap: () => Promise.resolve(undefined) }))
const mockFetchCalendarShare = jest.fn()

jest.mock('@/features/calendars/store/calendars-api', () => ({
  useGetCalendarsQuery: jest.fn(),
  useLazyGetCalendarShareQuery: jest.fn(),
  useSetCalendarShareMutation: jest.fn(),
}))
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}))

jest.mock('@/components/ui/select', () => ({
  Select: ({
    children,
    value,
    onValueChange,
  }: {
    children: React.ReactNode
    value?: string
    onValueChange?: (value: string) => void
  }) => (
    <select value={value} onChange={(e) => onValueChange?.(e.target.value)}>
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectValue: () => null,
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <option value={value}>{children}</option>
  ),
}))

const entry: GlobalAccessUserEntry = {
  key: 'newuser@example.com',
  uid: 'newuser@example.com',
  c_email: 'newuser@example.com',
  grants: [],
}

describe('AddCalendarAccessDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useGetCalendarsQuery as jest.Mock).mockReturnValue({
      data: [{ key: 'cal-1', id: 'cal-1', name: 'My Calendar', source_type: 'personal' }],
      isLoading: false,
    })
    ;(useSetCalendarShareMutation as jest.Mock).mockReturnValue([
      mockSetCalendarShare,
      { isLoading: false },
    ])
    mockFetchCalendarShare.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          users: {
            carol: { uid: 'carol', c_email: 'carol@example.com', userClass: 'normal-user', rights: {} },
          },
        }),
    })
    ;(useLazyGetCalendarShareQuery as jest.Mock).mockReturnValue([mockFetchCalendarShare])
  })

  it('does not show a user list or add-user input — the dialog is scoped to entry', () => {
    render(<AddCalendarAccessDialog open onOpenChange={jest.fn()} entry={entry} />)

    expect(screen.queryByText('carol@example.com')).not.toBeInTheDocument()
    expect(screen.queryByText(/addUser/)).not.toBeInTheDocument()
  })

  it('disables Share until at least one calendar is selected', async () => {
    const user = userEvent.setup()
    render(<AddCalendarAccessDialog open onOpenChange={jest.fn()} entry={entry} />)

    const shareButton = screen.getByText('addAccess.confirm.string')
    expect(shareButton).toBeDisabled()

    await user.click(screen.getByText('My Calendar'))
    expect(shareButton).not.toBeDisabled()
  })

  it('grants entry access to each selected calendar', async () => {
    const user = userEvent.setup()
    const onOpenChange = jest.fn()
    render(<AddCalendarAccessDialog open onOpenChange={onOpenChange} entry={entry} />)

    await user.click(screen.getByText('My Calendar'))
    await user.click(screen.getByText('addAccess.confirm.string'))

    await waitFor(() => {
      expect(mockFetchCalendarShare).toHaveBeenCalledWith({ calendarKey: 'cal-1' })
    })
    await waitFor(() => {
      expect(mockSetCalendarShare).toHaveBeenCalledWith({
        calendarKey: 'cal-1',
        users: [
          expect.objectContaining({ uid: 'carol' }),
          expect.objectContaining({ uid: 'newuser@example.com', c_email: 'newuser@example.com' }),
        ],
      })
    })
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
  })

  it('filters out calendars already shared with this user and shows the all-shared message', () => {
    render(
      <AddCalendarAccessDialog
        open
        onOpenChange={jest.fn()}
        entry={{
          ...entry,
          grants: [
            {
              domain: 'calendar',
              itemKey: 'cal-1',
              itemName: 'My Calendar',
              uid: entry.uid,
              c_email: entry.c_email,
              rights: {},
              allItemUsers: [],
            } as never,
          ],
        }}
      />
    )

    expect(screen.queryByText('My Calendar')).not.toBeInTheDocument()
    expect(screen.getByText('addAccess.allShared.string')).toBeInTheDocument()
  })
})
