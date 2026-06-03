import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import {
  RecurrenceSelector,
  type RecurrenceRuleValue,
} from '../recurrence-selector'

function StatefulRecurrenceSelector({
  initial,
  eventStart,
}: {
  initial: RecurrenceRuleValue | null
  eventStart?: Date
}) {
  const [value, setValue] = useState<RecurrenceRuleValue | null>(initial)
  return (
    <RecurrenceSelector value={value} onChange={setValue} eventStart={eventStart} />
  )
}

describe('RecurrenceSelector', () => {
  const eventStartWednesday = new Date(2026, 0, 14)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('renders repeat switch and label when recurrence is off', () => {
      const onChange = jest.fn()
      render(<RecurrenceSelector value={null} onChange={onChange} />)

      expect(screen.getByRole('switch')).toBeInTheDocument()
      expect(screen.getByText('repeat.string')).toBeInTheDocument()
      expect(screen.queryByText('every.string')).not.toBeInTheDocument()
    })

    it('renders configuration panel when recurrence is enabled', () => {
      const onChange = jest.fn()
      render(
        <RecurrenceSelector
          value={{
            frequency: 'weekly',
            interval: 1,
            by_day: ['MO'],
            week_start: 'MO',
          }}
          onChange={onChange}
        />
      )

      expect(screen.getByText('every.string')).toBeInTheDocument()
      expect(screen.getByText('on.string')).toBeInTheDocument()
      expect(screen.getByText('ends.string')).toBeInTheDocument()
    })
  })

  describe('configuration', () => {
    it('calls onChange with default weekly rule when switch is turned on', async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      render(
        <RecurrenceSelector
          value={null}
          onChange={onChange}
          eventStart={eventStartWednesday}
        />
      )

      await user.click(screen.getByRole('switch'))

      expect(onChange).toHaveBeenCalledWith({
        frequency: 'weekly',
        interval: 1,
        by_day: ['WE'],
        week_start: 'MO',
      })
    })

    it('calls onChange(null) when switch is turned off', async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      render(
        <RecurrenceSelector
          value={{
            frequency: 'weekly',
            interval: 1,
            by_day: ['MO'],
            week_start: 'MO',
          }}
          onChange={onChange}
        />
      )

      await user.click(screen.getByRole('switch'))

      expect(onChange).toHaveBeenCalledWith(null)
    })

    it('reflects interval from controlled value', () => {
      const onChange = jest.fn()
      render(
        <RecurrenceSelector
          value={{
            frequency: 'weekly',
            interval: 3,
            by_day: ['MO', 'FR'],
            week_start: 'MO',
          }}
          onChange={onChange}
        />
      )

      expect(screen.getByDisplayValue('3')).toBeInTheDocument()
    })

    it('shows monthly day controls when frequency is monthly', () => {
      const onChange = jest.fn()
      render(
        <RecurrenceSelector
          value={{
            frequency: 'monthly',
            interval: 1,
            by_month_day: [12],
            week_start: 'MO',
          }}
          onChange={onChange}
          eventStart={new Date(2026, 5, 20)}
        />
      )

      expect(screen.getByText('onDay.string')).toBeInTheDocument()
      expect(screen.getByText('ofTheMonth.string')).toBeInTheDocument()
      expect(screen.getByDisplayValue('12')).toBeInTheDocument()
    })

    it('shows date input when end type is until', () => {
      const onChange = jest.fn()
      render(
        <RecurrenceSelector
          value={{
            frequency: 'daily',
            interval: 1,
            until: '2026-06-01T00:00:00.000Z',
            week_start: 'MO',
          }}
          onChange={onChange}
        />
      )

      expect(screen.getByDisplayValue('2026-06-01')).toBeInTheDocument()
    })

    it('shows count input when end type is count', () => {
      const onChange = jest.fn()
      render(
        <RecurrenceSelector
          value={{
            frequency: 'daily',
            interval: 1,
            count: 5,
            week_start: 'MO',
          }}
          onChange={onChange}
        />
      )

      expect(screen.getByDisplayValue('5')).toBeInTheDocument()
      expect(screen.getByText('occurrences.string')).toBeInTheDocument()
    })
  })

  describe('custom styling', () => {
    it('applies layout classes on root and panel', () => {
      const onChange = jest.fn()
      const { container } = render(
        <RecurrenceSelector
          value={{
            frequency: 'weekly',
            interval: 1,
            by_day: ['MO'],
            week_start: 'MO',
          }}
          onChange={onChange}
        />
      )

      const root = container.firstElementChild
      expect(root).toHaveClass('flex', 'flex-col', 'gap-3')

      const panel = container.querySelector('div[class*="rounded-md"][class*="border"]')
      expect(panel).toBeTruthy()
    })
  })

  describe('accessibility', () => {
    it('associates label with switch via id and htmlFor', () => {
      const onChange = jest.fn()
      render(<RecurrenceSelector value={null} onChange={onChange} />)

      expect(screen.getByLabelText('repeat.string')).toBeInTheDocument()
      expect(screen.getByRole('switch')).toHaveAttribute('id', 'recurrence-toggle')
    })

    it('renders radio group for end options', () => {
      const onChange = jest.fn()
      render(
        <RecurrenceSelector
          value={{
            frequency: 'weekly',
            interval: 1,
            by_day: ['MO'],
            week_start: 'MO',
          }}
          onChange={onChange}
        />
      )

      const radios = screen.getAllByRole('radio')
      expect(radios).toHaveLength(3)
      radios.forEach((radio) => {
        expect(radio).toHaveAttribute('name', 'recurrence-end')
      })
    })

    it('renders weekday toggles as buttons', () => {
      const onChange = jest.fn()
      render(
        <RecurrenceSelector
          value={{
            frequency: 'weekly',
            interval: 1,
            by_day: ['MO'],
            week_start: 'MO',
          }}
          onChange={onChange}
        />
      )

      expect(screen.getByRole('button', { name: 'days.mo.string' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'days.tu.string' })).toBeInTheDocument()
    })
  })

  describe('integration', () => {
    it('updates interval when user changes interval field', async () => {
      render(
        <StatefulRecurrenceSelector
          initial={{
            frequency: 'weekly',
            interval: 1,
            by_day: ['MO'],
            week_start: 'MO',
          }}
        />
      )

      const intervalInput = screen.getByDisplayValue('1')
      fireEvent.change(intervalInput, { target: { value: '4' } })

      await waitFor(() => {
        expect(screen.getByDisplayValue('4')).toBeInTheDocument()
      })
    })

    it('toggles a weekday when its button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <StatefulRecurrenceSelector
          initial={{
            frequency: 'weekly',
            interval: 1,
            by_day: ['MO', 'TU'],
            week_start: 'MO',
          }}
        />
      )

      await user.click(screen.getByRole('button', { name: 'days.mo.string' }))

      await waitFor(() => {
        const tu = screen.getByRole('button', { name: 'days.tu.string' })
        expect(tu).toHaveClass('bg-primary')
      })

      const mo = screen.getByRole('button', { name: 'days.mo.string' })
      expect(mo).toHaveClass('bg-muted')
    })
  })

  describe('responsive layout', () => {
    it('uses vertical stack for main column', () => {
      const onChange = jest.fn()
      const { container } = render(<RecurrenceSelector value={null} onChange={onChange} />)
      const root = container.firstElementChild
      expect(root?.className).toContain('flex-col')
    })
  })

  describe('component stability', () => {
    it('keeps switch state aligned with value prop across rerenders', () => {
      const onChange = jest.fn()
      const { rerender } = render(
        <RecurrenceSelector
          value={{
            frequency: 'weekly',
            interval: 1,
            by_day: ['MO'],
            week_start: 'MO',
          }}
          onChange={onChange}
        />
      )

      expect(screen.getByRole('switch')).toHaveAttribute('data-state', 'checked')

      rerender(<RecurrenceSelector value={null} onChange={onChange} />)

      expect(screen.getByRole('switch')).toHaveAttribute('data-state', 'unchecked')
    })
  })
})
