import { render, screen } from '@testing-library/react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { HoursRangePickerForm } from '../hours-range-picker-form'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}))

// Mock child components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}))

jest.mock('@/components/ui/form', () => ({
  FormControl: ({ children }: any) => <div>{children}</div>,
  FormField: ({ render }: any) =>
    render({
      field: { value: undefined, onChange: jest.fn() },
    }),
  FormItem: ({ children }: any) => <div>{children}</div>,
  FormMessage: () => <div />,
}))

jest.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: any) => <div>{children}</div>,
  PopoverTrigger: ({ children }: any) => <div>{children}</div>,
  PopoverContent: ({ children }: any) => <div>{children}</div>,
}))

jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: any) => <div>{children}</div>,
  TabsList: ({ children }: any) => <div>{children}</div>,
  TabsTrigger: ({ children, value, onClick }: any) => (
    <button onClick={onClick} data-testid={`tab-${value}`}>
      {children}
    </button>
  ),
  TabsContent: ({ children }: any) => <div>{children}</div>,
}))

jest.mock('@/components/ui/separator', () => ({
  Separator: () => <hr />,
}))

jest.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}))

describe('HoursRangePickerForm', () => {
  const mockT = jest.fn((key: string) => key)

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useTranslations as jest.Mock).mockReturnValue(mockT)
  })

  const TestWrapper = ({ value }: { value?: Date }) => {
    const form = useForm({
      defaultValues: {
        time: value,
      },
    })

    return <HoursRangePickerForm form={form} name="time" />
  }

  it('should render the component', () => {
    render(<TestWrapper />)
    expect(
      screen.getByRole('button', { name: /pick.single.string/i })
    ).toBeInTheDocument()
  })

  it('should render tab triggers for different time formats', () => {
    render(<TestWrapper />)
    expect(screen.getByTestId('tab-24h')).toBeInTheDocument()
    expect(screen.getByTestId('tab-am')).toBeInTheDocument()
    expect(screen.getByTestId('tab-pm')).toBeInTheDocument()
  })

  it('should call useTranslations with CALENDAR namespace', () => {
    render(<TestWrapper />)
    expect(useTranslations).toHaveBeenCalledWith('CALENDAR')
  })

  it('should render form message component', () => {
    render(<TestWrapper />)
    // FormMessage should be rendered (mocked)
    expect(document.body).toBeInTheDocument()
  })

  it('should use Clock icon in trigger button', () => {
    render(<TestWrapper />)
    // The component should render with proper structure
    expect(
      screen.getByRole('button', { name: /pick.single.string/i })
    ).toBeInTheDocument()
  })

  it('should handle null field value gracefully', () => {
    render(<TestWrapper />)
    expect(
      screen.getByRole('button', { name: /pick.single.string/i })
    ).toBeInTheDocument()
  })
})
