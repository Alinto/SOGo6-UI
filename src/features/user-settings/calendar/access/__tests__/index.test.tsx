import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { useTranslations } from 'next-intl'
import { useProfile } from '@/features/user-profile'
import { useGetCalendarsQuery } from '@/features/calendars/store/calendars-api'
import CalendarsAccessSettings from '../index'

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}))

jest.mock('@/features/user-profile', () => ({
  useProfile: jest.fn(),
}))

jest.mock('@/features/calendars/store/calendars-api', () => ({
  useGetCalendarsQuery: jest.fn(),
}))

jest.mock('../components/calendar-access-list-row', () => ({
  __esModule: true,
  default: ({ calendar }: { calendar: { name: string } }) => (
    <div data-testid="calendar-access-row">{calendar.name}</div>
  ),
}))

jest.mock('../components/calendar-access-skeleton', () => ({
  __esModule: true,
  default: () => <div data-testid="calendar-access-skeleton" />,
}))

describe('CalendarsAccessSettings', () => {
  const mockTranslate = jest.fn((key: string) => key)

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useTranslations as jest.Mock).mockReturnValue(mockTranslate)
    ;(useProfile as jest.Mock).mockReturnValue({ folderSharingDisabled: [] })
  })

  it('renders page title and description', () => {
    ;(useGetCalendarsQuery as jest.Mock).mockReturnValue({
      data: [],
      error: undefined,
      isLoading: false,
    })

    render(<CalendarsAccessSettings />)

    expect(screen.getByText('title.string')).toBeInTheDocument()
    expect(screen.getByText('page.description.string')).toBeInTheDocument()
  })

  it('shows skeleton while loading', () => {
    ;(useGetCalendarsQuery as jest.Mock).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
    })

    render(<CalendarsAccessSettings />)

    expect(screen.getByTestId('calendar-access-skeleton')).toBeInTheDocument()
  })

  it('renders a row per owned calendar and excludes shared/subscription calendars', () => {
    ;(useGetCalendarsQuery as jest.Mock).mockReturnValue({
      data: [
        { key: 'cal-1', id: 'cal-1', name: 'Personal', source_type: 'local' },
        { key: 'cal-2', id: 'cal-2', name: 'Shared with me', source_type: 'shared' },
        { key: 'cal-3', id: 'cal-3', name: 'Subscribed', source_type: 'subscription' },
      ],
      error: undefined,
      isLoading: false,
    })

    render(<CalendarsAccessSettings />)

    const rows = screen.getAllByTestId('calendar-access-row')
    expect(rows).toHaveLength(1)
    expect(screen.getByText('Personal')).toBeInTheDocument()
  })

  it('shows empty state when there are no owned calendars', () => {
    ;(useGetCalendarsQuery as jest.Mock).mockReturnValue({
      data: [],
      error: undefined,
      isLoading: false,
    })

    render(<CalendarsAccessSettings />)

    expect(screen.getByText('empty.string')).toBeInTheDocument()
  })

  it('shows the disabled message when calendar sharing is disabled', () => {
    ;(useProfile as jest.Mock).mockReturnValue({
      folderSharingDisabled: ['calendar'],
    })
    ;(useGetCalendarsQuery as jest.Mock).mockReturnValue({
      data: [{ key: 'cal-1', id: 'cal-1', name: 'Personal', source_type: 'local' }],
      error: undefined,
      isLoading: false,
    })

    render(<CalendarsAccessSettings />)

    expect(screen.getByText('disabled.string')).toBeInTheDocument()
    expect(screen.queryByTestId('calendar-access-row')).not.toBeInTheDocument()
  })
})
