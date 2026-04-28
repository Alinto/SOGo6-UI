import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { useTranslations } from 'next-intl'
import EditForm from '../edit'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}))

// Mock RTK Query
jest.mock('@/features/calendars/store/calendars-api', () => ({
  useUpdateCalendarMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useDeleteCalendarMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
}))

// Mock UI components
jest.mock('@/components/ui/dialog', () => ({
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-title">{children}</div>
  ),
}))

jest.mock('../calendar-form-core', () => ({
  __esModule: true,
  default: () => <div data-testid="calendar-form-core">Form Core</div>,
}))

describe('EditForm', () => {
  const defaultProps = {
    id: '123',
    name: 'Test Calendar',
    color: '#3b82f6',
  }

  it('should render without crashing', () => {
    render(<EditForm {...defaultProps} />)
    expect(screen.getByTestId('dialog-header')).toBeInTheDocument()
  })

  it('should render dialog title', () => {
    render(<EditForm {...defaultProps} />)
    expect(screen.getByTestId('dialog-title')).toBeInTheDocument()
  })

  it('should use translations', () => {
    render(<EditForm {...defaultProps} />)
    expect(useTranslations).toHaveBeenCalledWith('CALENDARS')
  })

  it('should accept optional props', () => {
    render(
      <EditForm
        {...defaultProps}
        description="Test description"
        showBusyStatus={true}
      />
    )
    expect(screen.getByTestId('dialog-header')).toBeInTheDocument()
  })
})
