import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { createEmptyVacation } from '../../mail-vacation-utils'
import type { VacationFormValues } from '../vacation-schema'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    variant,
  }: {
    children: React.ReactNode
    onClick?: () => void
    variant?: string
  }) => (
    <button type="button" data-variant={variant} onClick={onClick}>
      {children}
    </button>
  ),
}))

import VacationWeekdayToggle from '../vacation-weekday-toggle'

function TestHost() {
  const { control } = useForm<VacationFormValues>({
    defaultValues: createEmptyVacation(),
  })

  return <VacationWeekdayToggle control={control} name="constraints.days" />
}

describe('VacationWeekdayToggle', () => {
  it('renders all weekday buttons', () => {
    render(<TestHost />)

    expect(
      screen.getByRole('button', { name: 'auto_reply.constraints.weekdays.monday.string' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'auto_reply.constraints.weekdays.sunday.string' })
    ).toBeInTheDocument()
  })

  it('toggles a weekday selection on click', async () => {
    const user = userEvent.setup()
    render(<TestHost />)

    const monday = screen.getByRole('button', {
      name: 'auto_reply.constraints.weekdays.monday.string',
    })

    expect(monday).toHaveAttribute('data-variant', 'outline')

    await user.click(monday)

    expect(monday).toHaveAttribute('data-variant', 'default')
  })
})
