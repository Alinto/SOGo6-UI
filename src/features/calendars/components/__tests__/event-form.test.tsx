import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockCreate = jest.fn(() => ({
  unwrap: () => Promise.resolve(),
}))
const mockUpdate = jest.fn(() => ({
  unwrap: () => Promise.resolve(),
}))

jest.mock('@/features/calendars', () => ({
  useCreateCalendarEventMutation: jest.fn(() => [
    mockCreate,
    { isLoading: false },
  ]),
  useUpdateCalendarEventMutation: jest.fn(() => [
    mockUpdate,
    { isLoading: false },
  ]),
}))

import { EventForm } from '../event-form'

describe('EventForm', () => {
  const onCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('renders form fields and actions', () => {
      render(
        <EventForm
          calendarKey="cal-1"
          onCancel={onCancel}
        />
      )
      expect(
        screen.getByRole('textbox', { name: 'eventForm.title.label' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'eventForm.cancel' })
      ).toBeInTheDocument()
    })
  })

  describe('configuration', () => {
    it('submits create path when no event is passed', async () => {
      const user = userEvent.setup()
      render(
        <EventForm
          calendarKey="cal-1"
          onCancel={onCancel}
        />
      )
      const title = screen.getByRole('textbox', {
        name: 'eventForm.title.label',
      })
      await user.clear(title)
      await user.type(title, 'New title')
      const submit = screen.getByRole('button', { name: 'eventForm.create' })
      await user.click(submit)
      await waitFor(() => {
        expect(mockCreate).toHaveBeenCalled()
      })
    })
  })
})
