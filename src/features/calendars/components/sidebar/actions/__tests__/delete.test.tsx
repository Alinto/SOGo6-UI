import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

const mockDeleteCalendar = jest.fn(() => ({
  unwrap: () => Promise.resolve(),
}))

jest.mock('@/components/ui/dialog', () => ({
  DialogHeader: ({ children }: { children: unknown }) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: { children: unknown }) => (
    <div data-testid="dialog-title">{children}</div>
  ),
  DialogDescription: ({ children }: { children: unknown }) => (
    <div data-testid="dialog-description">{children}</div>
  ),
  DialogFooter: ({ children }: { children: unknown }) => (
    <div data-testid="dialog-footer">{children}</div>
  ),
}))

jest.mock('@/features/calendars', () => ({
  useDeleteCalendarMutation: jest.fn(() => [
    mockDeleteCalendar,
    { isLoading: false },
  ]),
}))

import DeleteAction from '../delete'

describe('DeleteAction', () => {
  const onClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('renders title and action buttons', () => {
      render(<DeleteAction id="cal-1" onClose={onClose} />)
      expect(
        screen.getByRole('button', { name: 'forms.deleteCalendar.cancel.string' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', {
          name: 'forms.deleteCalendar.confirm.string',
        })
      ).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('calls onClose when cancel is clicked', () => {
      render(<DeleteAction id="cal-1" onClose={onClose} />)
      fireEvent.click(
        screen.getByRole('button', { name: 'forms.deleteCalendar.cancel.string' })
      )
      expect(onClose).toHaveBeenCalled()
    })

    it('invokes delete mutation and onClose on confirm', async () => {
      render(<DeleteAction id="cal-1" onClose={onClose} />)
      fireEvent.click(
        screen.getByRole('button', {
          name: 'forms.deleteCalendar.confirm.string',
        })
      )
      await waitFor(() => {
        expect(mockDeleteCalendar).toHaveBeenCalledWith('cal-1')
      })
      expect(onClose).toHaveBeenCalled()
    })
  })
})
