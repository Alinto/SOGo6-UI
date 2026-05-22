import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'

const mockData = [
  {
    key: 'p1',
    id: 'p1',
    name: 'Personal',
    source_type: 'personal',
    is_default: true,
    color: '#111',
  },
  {
    key: 's1',
    id: 's1',
    name: 'Shared',
    source_type: 'shared',
    color: '#222',
  },
]

const mockGetCalendarsQuery = jest.fn()

jest.mock('../../../store/calendars-api', () => ({
  useGetCalendarsQuery: (...a: unknown[]) => mockGetCalendarsQuery(...a),
}))

jest.mock('../forms/add', () => ({
  __esModule: true,
  default: function MockAddCalendar() {
    return <div data-testid="add-calendar" />
  },
}))

jest.mock('../forms/add-external', () => ({
  __esModule: true,
  default: function MockAddExternalCalendar() {
    return <div data-testid="add-external-calendar" />
  },
}))

jest.mock('../sidebar-item', () => ({
  __esModule: true,
  default: function MockSidebarItem({ name }: { name: string }) {
    return <div data-testid={`item-${name}`}>{name}</div>
  },
}))

jest.mock('../skeleton', () => ({
  __esModule: true,
  default: function MockSidebarSkeleton() {
    return <div data-testid="sidebar-skeleton" />
  },
}))

jest.mock('../create-event-opener', () => ({
  __esModule: true,
  default: function MockCreateEventOpener() {
    return <div data-testid="create-event-opener" />
  },
}))

import Sidebar from '../sidebar'

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('configuration', () => {
    it('shows skeleton while fetching', () => {
      mockGetCalendarsQuery.mockReturnValue({
        data: undefined,
        isFetching: true,
      })
      render(<Sidebar />)
      expect(screen.getByTestId('sidebar-skeleton')).toBeInTheDocument()
    })
  })

  describe('basic rendering', () => {
    it('renders grouped items when data is available', async () => {
      mockGetCalendarsQuery.mockReturnValue({
        data: mockData,
        isFetching: false,
      })
      render(<Sidebar />)
      await waitFor(() => {
        expect(screen.getByText('sidebar.personals.string')).toBeInTheDocument()
      })
      expect(screen.getByText('sidebar.shared.string')).toBeInTheDocument()
      expect(screen.getByText('sidebar.subscriptions.string')).toBeInTheDocument()
    })
  })
})
