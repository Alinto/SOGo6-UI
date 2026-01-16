import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { useTranslations } from 'next-intl'
import AddCalendar from '../add'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}))

// Mock RTK Query
jest.mock('@/features/calendars/store/calendars-api', () => ({
  useCreateCalendarMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
}))

// Mock UI components
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog">{children}</div>
  ),
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-title">{children}</div>
  ),
  DialogTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-trigger">{children}</div>
  ),
}))

jest.mock('@/components/ui/sidebar', () => ({
  SidebarGroupAction: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-group-action">{children}</div>
  ),
}))

jest.mock('../calendar-form-core', () => ({
  __esModule: true,
  default: () => <div data-testid="calendar-form-core">Form Core</div>,
}))

describe('AddCalendar', () => {
  it('should render without crashing', () => {
    render(<AddCalendar />)
    expect(screen.getByTestId('dialog')).toBeInTheDocument()
  })

  it('should render dialog trigger', () => {
    render(<AddCalendar />)
    expect(screen.getByTestId('dialog-trigger')).toBeInTheDocument()
  })

  it('should use translations', () => {
    render(<AddCalendar />)
    expect(useTranslations).toHaveBeenCalledWith('CALENDARS')
  })
})
