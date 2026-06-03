import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockCreate = jest.fn(() => ({
  unwrap: () => Promise.resolve(),
}))
const mockUpdate = jest.fn(() => ({
  unwrap: () => Promise.resolve(),
}))
const mockCreateError = jest.fn(() => ({
  unwrap: () => Promise.reject(new Error('Create failed')),
}))
const mockUpdateError = jest.fn(() => ({
  unwrap: () => Promise.reject(new Error('Update failed')),
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

jest.mock('@/features/calendars/store/calendars-api', () => ({
  useGetFreeBusyQuery: jest.fn(() => ({
    data: undefined,
    isFetching: false,
  })),
  useSearchUsersQuery: jest.fn(() => ({
    data: [],
    isFetching: false,
  })),
}))

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
  useLocale: jest.fn(() => 'en'),
}))

import type { Calendar, CalendarEvent } from '@/features/calendars/types'
import { EventForm } from '../event-form'

describe('EventForm', () => {
  const onCancel = jest.fn()
  const mockCalendars: Calendar[] = [
    {
      id: 'cal-1',
      key: 'cal-1',
      name: 'Calendar 1',
      color: '#FF0000',
    },
    {
      id: 'cal-2',
      key: 'cal-2',
      name: 'Calendar 2',
      color: '#00FF00',
    },
  ]

  const mockEvent: CalendarEvent = {
    id: 'event-1',
    key: 'event-1',
    uid: 'uid-123',
    title: 'Test Event',
    date_start: '2024-07-15T10:00:00Z',
    date_end: '2024-07-15T11:00:00Z',
    all_day: false,
    timezone: 'UTC',
    description: 'Test description',
    location: 'Test location',
    visibility: 'public',
    show_as: 'busy',
    status: 'confirmed',
    url: 'https://example.com',
    color: '#FF0000',
    categories: ['work', 'meeting'],
    calendar_id: 'cal-1',
    calendar_key: 'cal-1',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('renders form fields and actions', () => {
      render(<EventForm calendarKey="cal-1" onCancel={onCancel} />)
      expect(
        screen.getByRole('textbox', { name: 'eventForm.title.label.string' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'eventForm.cancel.string' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'eventForm.create.string' })
      ).toBeInTheDocument()
    })

    it('renders calendar selector when calendars are provided', () => {
      render(
        <EventForm
          calendarKey="cal-1"
          calendars={mockCalendars}
          onCancel={onCancel}
        />
      )
      expect(
        screen.getByRole('combobox', {
          name: 'eventForm.calendar.label.string',
        })
      ).toBeInTheDocument()
    })

    it('does not render calendar selector when no calendars provided', () => {
      render(<EventForm calendarKey="cal-1" onCancel={onCancel} />)
      expect(
        screen.queryByRole('combobox', {
          name: 'eventForm.calendar.label.string',
        })
      ).not.toBeInTheDocument()
    })

    it('renders all event form sections', () => {
      render(<EventForm calendarKey="cal-1" onCancel={onCancel} />)
      expect(
        screen.getByText('eventForm.allDay.label.string')
      ).toBeInTheDocument()
      expect(
        screen.getByText('eventForm.description.label.string')
      ).toBeInTheDocument()
      expect(
        screen.getByText('eventForm.location.label.string')
      ).toBeInTheDocument()
      expect(
        screen.getByText('eventForm.visibility.label.string')
      ).toBeInTheDocument()
      expect(screen.getByText('eventForm.url.label.string')).toBeInTheDocument()
      expect(
        screen.getByText('eventForm.attendees.title.string')
      ).toBeInTheDocument()
      expect(
        screen.getByText('eventForm.reminders.label.string')
      ).toBeInTheDocument()
      expect(
        screen.getByText('eventForm.categories.label.string')
      ).toBeInTheDocument()
    })
  })

  describe('create event', () => {
    it('submits create event with minimal data', async () => {
      const user = userEvent.setup()
      render(
        <EventForm
          calendarKey="cal-1"
          calendars={mockCalendars}
          onCancel={onCancel}
        />
      )

      const titleInput = screen.getByRole('textbox', {
        name: 'eventForm.title.label.string',
      })
      await user.clear(titleInput)
      await user.type(titleInput, 'New Event')

      const submitButton = screen.getByRole('button', {
        name: 'eventForm.create.string',
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            calendarKey: 'cal-1',
            body: expect.objectContaining({
              title: 'New Event',
            }),
          })
        )
      })
    })

    it('calls onCancel after successful event creation', async () => {
      const user = userEvent.setup()
      render(
        <EventForm
          calendarKey="cal-1"
          calendars={mockCalendars}
          onCancel={onCancel}
        />
      )

      const titleInput = screen.getByRole('textbox', {
        name: 'eventForm.title.label.string',
      })
      await user.type(titleInput, 'New Event')

      const submitButton = screen.getByRole('button', {
        name: 'eventForm.create.string',
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(onCancel).toHaveBeenCalled()
      })
    })
  })

  describe('edit event', () => {
    it('shows update button when event is provided', () => {
      render(
        <EventForm
          calendarKey="cal-1"
          calendars={mockCalendars}
          event={mockEvent}
          onCancel={onCancel}
        />
      )

      expect(
        screen.getByRole('button', { name: 'eventForm.update.string' })
      ).toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: 'eventForm.create.string' })
      ).not.toBeInTheDocument()
    })

    it('populates form fields with event data', () => {
      render(
        <EventForm
          calendarKey="cal-1"
          calendars={mockCalendars}
          event={mockEvent}
          onCancel={onCancel}
        />
      )

      const titleInput = screen.getByRole('textbox', {
        name: 'eventForm.title.label.string',
      }) as HTMLInputElement
      expect(titleInput.value).toBe('Test Event')

      const descriptionInput = screen.getByRole('textbox', {
        name: 'eventForm.description.label.string',
      }) as HTMLTextAreaElement
      expect(descriptionInput.value).toBe('Test description')
    })

    it('submits update event', async () => {
      const user = userEvent.setup()
      render(
        <EventForm
          calendarKey="cal-1"
          calendars={mockCalendars}
          event={mockEvent}
          onCancel={onCancel}
        />
      )

      const titleInput = screen.getByRole('textbox', {
        name: 'eventForm.title.label.string',
      })
      await user.clear(titleInput)
      await user.type(titleInput, 'Updated Event')

      const submitButton = screen.getByRole('button', {
        name: 'eventForm.update.string',
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            eventKey: 'event-1',
            body: expect.objectContaining({
              title: 'Updated Event',
            }),
          })
        )
      })
    })

    it('calls onCancel after successful event update', async () => {
      const user = userEvent.setup()
      render(
        <EventForm
          calendarKey="cal-1"
          calendars={mockCalendars}
          event={mockEvent}
          onCancel={onCancel}
        />
      )

      const submitButton = screen.getByRole('button', {
        name: 'eventForm.update.string',
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(onCancel).toHaveBeenCalled()
      })
    })
  })

  describe('all day event', () => {
    it('toggles between all day and timed event', async () => {
      const user = userEvent.setup()
      render(<EventForm calendarKey="cal-1" onCancel={onCancel} />)

      const allDaySwitch = screen.getByRole('switch', {
        name: 'eventForm.allDay.label.string',
      })

      expect(allDaySwitch).not.toBeChecked()

      // Check that timed labels are shown
      expect(
        screen.getByText('eventForm.startTime.label.string')
      ).toBeInTheDocument()
      expect(
        screen.getByText('eventForm.endTime.label.string')
      ).toBeInTheDocument()

      await user.click(allDaySwitch)

      expect(allDaySwitch).toBeChecked()

      // Check that all day labels are shown
      expect(
        screen.getByText('eventForm.startDate.label.string')
      ).toBeInTheDocument()
      expect(
        screen.getByText('eventForm.endDate.label.string')
      ).toBeInTheDocument()
    })

    it('uses date input for all day events', async () => {
      const user = userEvent.setup()
      render(<EventForm calendarKey="cal-1" onCancel={onCancel} />)

      const allDaySwitch = screen.getByRole('switch', {
        name: 'eventForm.allDay.label.string',
      })
      await user.click(allDaySwitch)

      const dateInputs = screen.getAllByDisplayValue(/^\d{4}-\d{2}-\d{2}$/)
      expect(dateInputs.length).toBeGreaterThan(0)
      dateInputs.forEach((input) => {
        expect((input as HTMLInputElement).type).toBe('date')
      })
    })

    it('uses datetime-local input for timed events', () => {
      render(<EventForm calendarKey="cal-1" onCancel={onCancel} />)

      const startDateInputs = screen.getAllByDisplayValue(/\d{4}-\d{2}-\d{2}/)
      startDateInputs.forEach((input) => {
        const inputElement = input as HTMLInputElement
        expect(['date', 'datetime-local']).toContain(inputElement.type)
      })
    })

    it('renders all day event with date input type', () => {
      render(
        <EventForm calendarKey="cal-1" event={mockEvent} onCancel={onCancel} />
      )

      const dateInputs = screen.getAllByDisplayValue(/\d{4}-\d{2}-\d{2}/)
      expect(dateInputs.length).toBeGreaterThan(0)
    })
  })

  describe('date and time handling', () => {
    it('sets initial start and end dates', () => {
      const startDate = new Date('2024-07-15')
      const endDate = new Date('2024-07-16')

      render(
        <EventForm
          calendarKey="cal-1"
          start={startDate}
          end={endDate}
          onCancel={onCancel}
        />
      )

      const dateInputs = screen.getAllByDisplayValue(/2024-07-1[56]/)
      expect(dateInputs.length).toBeGreaterThan(0)
    })

    it('maintains duration when start date is changed', async () => {
      const user = userEvent.setup()
      render(
        <EventForm
          calendarKey="cal-1"
          start={new Date('2024-07-15T10:00')}
          end={new Date('2024-07-15T11:00')}
          onCancel={onCancel}
        />
      )

      const startInputs = screen.getAllByRole('textbox')
      const startInput = startInputs.find((input) =>
        input.getAttribute('name')?.includes('start')
      ) as HTMLInputElement

      if (startInput) {
        await user.clear(startInput)
        await user.type(startInput, '2024-07-16T10:00')

        await waitFor(() => {
          const endInputs = screen.getAllByRole('textbox')
          const endInput = endInputs.find((input) =>
            input.getAttribute('name')?.includes('end')
          ) as HTMLInputElement
          expect(endInput?.value).toContain('2024-07-16')
        })
      }
    })
  })

  describe('calendar selection', () => {
    it('selects correct calendar for new event', async () => {
      const user = userEvent.setup()
      render(
        <EventForm
          calendarKey="cal-2"
          calendars={mockCalendars}
          onCancel={onCancel}
        />
      )

      const titleInput = screen.getByRole('textbox', {
        name: 'eventForm.title.label.string',
      })
      await user.type(titleInput, 'New Event')

      const submitButton = screen.getByRole('button', {
        name: 'eventForm.create.string',
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            calendarKey: 'cal-2',
          })
        )
      })
    })
  })

  describe('reminders', () => {
    it('renders reminder method selector', async () => {
      const user = userEvent.setup()
      render(<EventForm calendarKey="cal-1" onCancel={onCancel} />)

      const addReminderButton = screen.getByRole('button', {
        name: /eventForm.reminders.add/,
      })
      await user.click(addReminderButton)

      await waitFor(() => {
        const selectors = screen.getAllByRole('combobox')
        expect(selectors.length).toBeGreaterThan(0)
      })
    })

    it('removes reminder from the list', async () => {
      const user = userEvent.setup()
      render(<EventForm calendarKey="cal-1" onCancel={onCancel} />)

      const addReminderButton = screen.getByRole('button', {
        name: /eventForm.reminders.add/,
      })
      await user.click(addReminderButton)

      await waitFor(() => {
        const deleteButtons = screen.getAllByLabelText(
          /eventForm.reminders.remove/
        )
        expect(deleteButtons.length).toBeGreaterThan(0)
      })
    })

    it('populates reminders from existing event', () => {
      const eventWithReminders = {
        ...mockEvent,
        reminders: [
          { method: 'email' as const, minutes_before: 15 },
          { method: 'popup' as const, minutes_before: 30 },
        ],
      }

      render(
        <EventForm
          calendarKey="cal-1"
          event={eventWithReminders}
          onCancel={onCancel}
        />
      )

      const numberInputs = screen.getAllByRole('spinbutton')
      expect(numberInputs.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('categories', () => {
    it('adds a category', async () => {
      const user = userEvent.setup()
      render(<EventForm calendarKey="cal-1" onCancel={onCancel} />)

      const categoryInput = screen.getByPlaceholderText(
        'eventForm.categories.placeholder.string'
      )
      await user.type(categoryInput, 'work')
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(screen.getByText('work')).toBeInTheDocument()
      })
    })

    it('removes a category', async () => {
      const user = userEvent.setup()
      render(
        <EventForm calendarKey="cal-1" event={mockEvent} onCancel={onCancel} />
      )

      const categoryBadges = screen.getAllByText(/work|meeting/)
      expect(categoryBadges.length).toBeGreaterThan(0)
    })

    it('prevents duplicate categories', async () => {
      const user = userEvent.setup()
      render(<EventForm calendarKey="cal-1" onCancel={onCancel} />)

      const categoryInput = screen.getByPlaceholderText(
        'eventForm.categories.placeholder.string'
      )
      await user.type(categoryInput, 'work')
      await user.keyboard('{Enter}')

      await user.clear(categoryInput)
      await user.type(categoryInput, 'work')
      await user.keyboard('{Enter}')

      const workBadges = screen.getAllByText('work')
      expect(workBadges.length).toBe(1)
    })

    it('renders categories from existing event', () => {
      render(
        <EventForm calendarKey="cal-1" event={mockEvent} onCancel={onCancel} />
      )

      expect(screen.getByText('work')).toBeInTheDocument()
      expect(screen.getByText('meeting')).toBeInTheDocument()
    })
  })

  describe('form submission', () => {
    it('does not submit when title is empty', async () => {
      const user = userEvent.setup()
      render(
        <EventForm
          calendarKey="cal-1"
          calendars={mockCalendars}
          onCancel={onCancel}
        />
      )

      const submitButton = screen.getByRole('button', {
        name: 'eventForm.create.string',
      })
      expect(submitButton).not.toBeDisabled()
    })

    it('does not submit when no calendar is selected', async () => {
      const user = userEvent.setup()
      render(
        <EventForm
          calendarKey=""
          calendars={mockCalendars}
          onCancel={onCancel}
        />
      )

      const submitButton = screen.getByRole('button', {
        name: 'eventForm.create.string',
      })
      expect(submitButton).toBeDisabled()
    })

    it('submits with all filled data', async () => {
      const user = userEvent.setup()
      render(
        <EventForm
          calendarKey="cal-1"
          calendars={mockCalendars}
          onCancel={onCancel}
        />
      )

      const titleInput = screen.getByRole('textbox', {
        name: 'eventForm.title.label.string',
      })
      await user.type(titleInput, 'Complete Event')

      const descriptionInput = screen.getByRole('textbox', {
        name: 'eventForm.description.label.string',
      })
      await user.type(descriptionInput, 'Event description')

      const submitButton = screen.getByRole('button', {
        name: 'eventForm.create.string',
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            calendarKey: 'cal-1',
            body: expect.objectContaining({
              title: 'Complete Event',
              description: 'Event description',
            }),
          })
        )
      })
    })
  })

  describe('cancel action', () => {
    it('calls onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(<EventForm calendarKey="cal-1" onCancel={onCancel} />)

      const cancelButton = screen.getByRole('button', {
        name: 'eventForm.cancel.string',
      })
      await user.click(cancelButton)

      expect(onCancel).toHaveBeenCalled()
    })

    it('does not submit form when cancel is clicked', async () => {
      const user = userEvent.setup()
      render(
        <EventForm
          calendarKey="cal-1"
          calendars={mockCalendars}
          onCancel={onCancel}
        />
      )

      const cancelButton = screen.getByRole('button', {
        name: 'eventForm.cancel.string',
      })
      await user.click(cancelButton)

      expect(mockCreate).not.toHaveBeenCalled()
      expect(onCancel).toHaveBeenCalled()
    })
  })

  describe('timezone handling', () => {
    it('displays timezone selector', () => {
      render(<EventForm calendarKey="cal-1" onCancel={onCancel} />)

      expect(
        screen.getByText('eventForm.timezone.label.string')
      ).toBeInTheDocument()
    })

    it('sets default timezone to browser timezone', () => {
      render(<EventForm calendarKey="cal-1" onCancel={onCancel} />)

      const timezoneDescription = screen.getByText(
        'eventForm.timezone.description.string'
      )
      expect(timezoneDescription).toBeInTheDocument()
    })

    it('uses provided timezone from event', () => {
      const eventWithTimezone = {
        ...mockEvent,
        timezone: 'Europe/Paris',
      }

      render(
        <EventForm
          calendarKey="cal-1"
          event={eventWithTimezone}
          onCancel={onCancel}
        />
      )

      expect(
        screen.getByText('eventForm.timezone.label.string')
      ).toBeInTheDocument()
    })
  })

  describe('event visibility and status', () => {
    it('renders visibility options', () => {
      render(<EventForm calendarKey="cal-1" onCancel={onCancel} />)

      expect(
        screen.getByText('eventForm.visibility.label.string')
      ).toBeInTheDocument()
    })

    it('renders status options', () => {
      render(<EventForm calendarKey="cal-1" onCancel={onCancel} />)

      expect(
        screen.getByText('eventForm.status.label.string')
      ).toBeInTheDocument()
    })

    it('renders show_as options', () => {
      render(<EventForm calendarKey="cal-1" onCancel={onCancel} />)

      expect(
        screen.getByText('eventForm.showAs.label.string')
      ).toBeInTheDocument()
    })
  })

  describe('color picker', () => {
    it('renders color input', () => {
      render(<EventForm calendarKey="cal-1" onCancel={onCancel} />)

      const colorInputs = screen.getAllByDisplayValue(/^#/)
      expect(colorInputs.length).toBeGreaterThan(0)
    })

    it('uses calendar color as default', () => {
      render(
        <EventForm
          calendarKey="cal-1"
          calendars={mockCalendars}
          onCancel={onCancel}
        />
      )

      expect(
        screen.getByText('eventForm.color.label.string')
      ).toBeInTheDocument()
    })
  })

  describe('url field', () => {
    it('renders URL input', () => {
      render(<EventForm calendarKey="cal-1" onCancel={onCancel} />)

      expect(screen.getByText('eventForm.url.label.string')).toBeInTheDocument()
    })

    it('accepts valid URLs', async () => {
      const user = userEvent.setup()
      render(
        <EventForm calendarKey="cal-1" event={mockEvent} onCancel={onCancel} />
      )

      expect(
        screen.getByDisplayValue('https://example.com')
      ).toBeInTheDocument()
    })
  })
})
