import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { createEmptyVacation } from '../../mail-vacation-utils'
import type { VacationFormValues } from '../vacation-schema'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('@/components/ui/form', () => ({
  FormField: ({
    render,
  }: {
    render: (args: { field: { value: string; onChange: jest.Mock } }) => React.ReactNode
  }) => render({ field: { value: '09:00', onChange: jest.fn() } }),
  FormItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  FormLabel: ({ children }: { children: React.ReactNode }) => <label>{children}</label>,
  FormControl: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

jest.mock('@/components/ui/input', () => ({
  Input: (props: React.ComponentProps<'input'>) => <input {...props} />,
}))

import VacationTimeRangeField from '../vacation-time-range-field'

function TestHost() {
  const { control } = useForm<VacationFormValues>({
    defaultValues: createEmptyVacation(),
  })

  return <VacationTimeRangeField control={control} />
}

describe('VacationTimeRangeField', () => {
  it('renders start and end time inputs with translated labels', () => {
    const { container } = render(<TestHost />)

    expect(screen.getByText('auto_reply.constraints.time.start.string')).toBeInTheDocument()
    expect(screen.getByText('auto_reply.constraints.time.end.string')).toBeInTheDocument()

    const inputs = container.querySelectorAll('input[type="time"]')
    expect(inputs).toHaveLength(2)
  })
})
