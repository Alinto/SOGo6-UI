import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import CalendarFormCore from '../calendar-form-core'
import type { CalendarAddFormData } from '../calendar-form-types'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}))

// Mock UI components
jest.mock('@/components/ui/form', () => ({
  Form: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="form-wrapper">{children}</div>
  ),
  FormControl: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="form-control">{children}</div>
  ),
  FormField: ({
    render,
  }: {
    render: (props: { field: Record<string, unknown> }) => React.ReactNode
  }) => <div data-testid="form-field">{render({ field: {} })}</div>,
  FormItem: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="form-item">{children}</div>
  ),
  FormLabel: ({ children }: { children: React.ReactNode }) => (
    <label data-testid="form-label">{children}</label>
  ),
  FormMessage: () => <div data-testid="form-message" />,
}))

jest.mock('@/components/ui/input', () => ({
  Input: (props: Record<string, unknown>) => (
    <input data-testid="input" {...props} />
  ),
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: { children: React.ReactNode }) => (
    <button data-testid="button" {...props}>
      {children}
    </button>
  ),
}))

jest.mock('@/components/ui/select', () => ({
  Select: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select">{children}</div>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select-content">{children}</div>
  ),
  SelectItem: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select-item">{children}</div>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select-trigger">{children}</div>
  ),
  SelectValue: () => <div data-testid="select-value" />,
}))

jest.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover">{children}</div>
  ),
  PopoverContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover-content">{children}</div>
  ),
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover-trigger">{children}</div>
  ),
}))

jest.mock('@/components/ui/checkbox', () => ({
  Checkbox: (props: Record<string, unknown>) => (
    <input type="checkbox" data-testid="checkbox" {...props} />
  ),
}))

const TestWrapper = ({ showButtons = true }: { showButtons?: boolean }) => {
  const mockForm = useForm<CalendarAddFormData>({
    defaultValues: {
      name: '',
      color: '#3b82f6',
      eventDuration: '30 minutes',
      showBusyStatus: false,
      eventNotifications: [],
      allDayNotifications: [],
    },
  })

  return (
    <CalendarFormCore
      form={mockForm as any}
      onSubmit={jest.fn()}
      formPrefix="createCalendar"
      showButtons={showButtons}
    />
  )
}

describe('CalendarFormCore', () => {
  it('should render without crashing', () => {
    render(<TestWrapper />)
    expect(screen.getByTestId('form-wrapper')).toBeInTheDocument()
  })

  it('should render form fields', () => {
    render(<TestWrapper />)
    expect(screen.getAllByTestId('form-field').length).toBeGreaterThan(0)
  })

  it('should use translations', () => {
    render(<TestWrapper />)
    expect(useTranslations).toHaveBeenCalledWith('CALENDARS')
  })

  it('should render buttons when showButtons is true', () => {
    render(<TestWrapper showButtons={true} />)
    const buttons = screen.getAllByTestId('button')
    expect(buttons.length).toBeGreaterThanOrEqual(4)
  })

  it('should not render submit/cancel buttons when showButtons is false', () => {
    render(<TestWrapper showButtons={false} />)
    const buttons = screen.getAllByTestId('button')

    expect(buttons.length).toBe(2)
  })
})
