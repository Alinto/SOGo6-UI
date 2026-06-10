import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { useTranslations } from 'next-intl'
import AddExternalCalendar from '../add-external'

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}))

jest.mock('@/features/calendars/store/calendars-api', () => ({
  useCreateExternalCalendarMutation: jest.fn(() => [
    jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) }),
    { isLoading: false },
  ]),
}))

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
  SidebarGroupAction: ({
    children,
    title,
  }: {
    children: React.ReactNode
    title?: string
  }) => (
    <div data-testid="sidebar-group-action" title={title}>
      {children}
    </div>
  ),
}))

jest.mock('@/components/ui/select', () => ({
  Select: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select">{children}</div>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectItem: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <button type="button">{children}</button>
  ),
  SelectValue: () => null,
}))

describe('AddExternalCalendar', () => {
  it('should render without crashing', () => {
    render(<AddExternalCalendar />)
    expect(screen.getByTestId('dialog')).toBeInTheDocument()
  })

  it('should render dialog trigger', () => {
    render(<AddExternalCalendar />)
    expect(screen.getByTestId('dialog-trigger')).toBeInTheDocument()
  })

  it('should use translations', () => {
    render(<AddExternalCalendar />)
    expect(useTranslations).toHaveBeenCalledWith('CALENDARS')
  })

  it('should render subscribe form fields', () => {
    render(<AddExternalCalendar />)
    expect(screen.getByText('external.name_label.string')).toBeInTheDocument()
    expect(screen.getByText('external.url_label.string')).toBeInTheDocument()
    expect(screen.getByText('external.submit.string')).toBeInTheDocument()
  })
})
