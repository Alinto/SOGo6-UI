import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

import type { CalendarEvent } from '../../../calendars-types'
import Visualization from '../index'

jest.mock('@/lib/redux/hooks', () => ({
  useAppSelector: (
    selector: (state: { auth: { user: { email: string } | null } }) => unknown
  ) => selector({ auth: { user: null } }),
}))

jest.mock('../../../store/calendars-api', () => ({
  usePostEventAttendanceMutation: () => [jest.fn(), { isLoading: false }],
}))

const baseEvent: CalendarEvent = {
  id: 'e1',
  calendar_id: 'c1',
  title: 'Plan review',
  all_day: false,
  start_date: '2024-06-15T10:00:00.000Z',
  end_date: '2024-06-15T11:00:00.000Z',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
}

describe('Visualization', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('renders event title', () => {
      render(<Visualization data={baseEvent} />)
      expect(
        screen.getByRole('heading', { level: 2, name: 'Plan review' })
      ).toBeInTheDocument()
    })
  })

  describe('content sections', () => {
    it('renders location when set', () => {
      const data: CalendarEvent = {
        ...baseEvent,
        location: 'Room A',
      }
      render(<Visualization data={data} />)
      expect(screen.getByText('visualization.location.string')).toBeInTheDocument()
      expect(screen.getByText('Room A')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('uses a semantic heading for the event title', () => {
      render(<Visualization data={baseEvent} />)
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveTextContent('Plan review')
    })
  })
})
