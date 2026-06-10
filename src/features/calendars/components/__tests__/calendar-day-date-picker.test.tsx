import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'

import { CalendarDayDatePicker } from '../calendar-day-date-picker'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) =>
    key === 'pickDate.string' ? 'Pick a date' : key,
}))

jest.mock('@/components/ui/calendar-lazy', () => ({
  Calendar: ({
    onSelect,
  }: {
    onSelect: (date: Date | undefined) => void
  }) => (
    <button type="button" onClick={() => onSelect(new Date('2024-03-15'))}>
      Select March 15
    </button>
  ),
}))

jest.mock('@/components/ui/popover', () => ({
  Popover: ({ children, open }: { children: React.ReactNode; open: boolean }) => (
    <div data-testid="popover" data-open={open}>
      {children}
    </div>
  ),
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  PopoverContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover-content">{children}</div>
  ),
}))

describe('CalendarDayDatePicker', () => {
  it('calls onDateSelect when a day is chosen', () => {
    const onDateSelect = jest.fn()
    render(
      <CalendarDayDatePicker
        date={new Date('2024-01-15')}
        onDateSelect={onDateSelect}
        label={<span>15 Jan. 2024</span>}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Pick a date' }))
    fireEvent.click(screen.getByRole('button', { name: 'Select March 15' }))

    expect(onDateSelect).toHaveBeenCalledWith(new Date('2024-03-15'))
  })
})
