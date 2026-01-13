import { describe, expect, it } from '@jest/globals'
import { render } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import CalendarFormCore from '../calendar-form-core'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

const TestWrapper = () => {
  const form = useForm({
    defaultValues: {
      name: '',
      color: '#3b82f6',
      description: '',
      eventDuration: '1 hour',
      showBusyStatus: false,
      allDayNotificationDaysBefore: 1,
    },
  })

  return (
    <CalendarFormCore
      form={form}
      onSubmit={() => {}}
      formPrefix="createCalendar"
    />
  )
}

describe('CalendarFormCore', () => {
  it('should render without crashing', () => {
    const { container } = render(<TestWrapper />)
    expect(container).toBeTruthy()
  })

  it('should render form fields', () => {
    const { container } = render(<TestWrapper />)
    const forms = container.querySelectorAll('form')
    expect(forms.length).toBeGreaterThan(0)
  })
})
