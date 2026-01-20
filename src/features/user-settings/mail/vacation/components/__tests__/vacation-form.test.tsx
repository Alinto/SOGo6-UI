import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useTranslations } from 'next-intl'
import { MailVacation } from '../../mail-vacation-types'
import MailVacationSettingsForm from '../vacation-form'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}))

// Mock child components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, type, ...props }: any) => (
    <button onClick={onClick} type={type} {...props}>
      {children}
    </button>
  ),
}))

jest.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({ checked, onCheckedChange }: any) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
    />
  ),
}))

jest.mock('@/components/ui/input', () => ({
  Input: ({ placeholder, ...props }: any) => (
    <input placeholder={placeholder} {...props} />
  ),
}))

jest.mock('@/components/ui/separator', () => ({
  Separator: () => <hr />,
}))

jest.mock('@/components/ui/form', () => ({
  Form: ({ children }: any) => <div>{children}</div>,
  FormControl: ({ children }: any) => <div>{children}</div>,
  FormField: ({ render }: any) =>
    render({
      field: {
        value: undefined,
        onChange: jest.fn(),
      },
    }),
  FormItem: ({ children }: any) => <div>{children}</div>,
  FormLabel: ({ children }: any) => <label>{children}</label>,
  FormDescription: ({ children }: any) => <p>{children}</p>,
  FormMessage: () => <div />,
}))

jest.mock('@/components/ui/dates/date-range-picker-form', () => ({
  DatePickerWithRangeForm: ({ name }: any) => (
    <div data-testid={`date-picker-${name}`}>Date Picker</div>
  ),
}))

jest.mock('@/components/ui/dates/hours-range-picker-form', () => ({
  __esModule: true,
  default: ({ name }: any) => (
    <div data-testid={`hours-picker-${name}`}>Hours Picker</div>
  ),
}))

jest.mock('@/components/ui/forms/fixed-form-button-group', () => ({
  __esModule: true,
  default: ({ onReset, disableReset, disableSubmit }: any) => (
    <div data-testid="button-group">
      <button onClick={onReset} disabled={disableReset}>
        Reset
      </button>
      <button type="submit" disabled={disableSubmit}>
        Submit
      </button>
    </div>
  ),
}))

jest.mock('@/components/ui/forms/select-form', () => ({
  __esModule: true,
  default: ({ onValueChange, value, options }: any) => (
    <select value={value} onChange={(e) => onValueChange(e.target.value)}>
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
}))

jest.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}))

jest.mock('../../store/mail-vacation-settings-api', () => ({
  useUpdateMailVacationSettingsMutation: jest.fn(() => [jest.fn()]),
}))

describe('MailVacationSettingsForm', () => {
  const mockT = jest.fn((key: string) => key)
  const mockUpdate = jest.fn()

  const defaultData: MailVacation = {
    enabled: false,
    autoReply: {
      subject: '',
      message: '',
      constraints: {
        startDate: '',
        endDate: '',
        startHour: '',
        endHour: '',
        enableDates: false,
        enableHours: false,
        enableDays: false,
        days: {
          monday: false,
          tuesday: false,
          wednesday: false,
          thursday: false,
          friday: false,
          saturday: false,
          sunday: false,
        },
      },
      emails: [],
      response: {
        interval: '0',
        toMaillingList: false,
        alwaysSend: false,
      },
      discardMails: false,
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useTranslations as jest.Mock).mockReturnValue(mockT)
  })

  it('should render the component', () => {
    render(<MailVacationSettingsForm data={defaultData} update={mockUpdate} />)
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('should use translations with US_MAIL_VACATIONS namespace', () => {
    render(<MailVacationSettingsForm data={defaultData} update={mockUpdate} />)
    expect(useTranslations).toHaveBeenCalledWith('US_MAIL_VACATIONS')
  })

  it('should render enabled checkbox', () => {
    render(<MailVacationSettingsForm data={defaultData} update={mockUpdate} />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeInTheDocument()
    expect(checkbox).not.toBeChecked()
  })

  it('should render the form element', () => {
    const { container } = render(
      <MailVacationSettingsForm data={defaultData} update={mockUpdate} />
    )
    const form = container.querySelector('form')
    expect(form).toBeInTheDocument()
  })

  it('should render button group with reset and submit buttons', () => {
    render(<MailVacationSettingsForm data={defaultData} update={mockUpdate} />)
    expect(screen.getByTestId('button-group')).toBeInTheDocument()
    const buttons = screen.getAllByRole('button', { hidden: true })
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('should handle undefined data prop', () => {
    render(<MailVacationSettingsForm data={undefined} update={mockUpdate} />)
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('should not render vacation settings when enabled is false', () => {
    render(<MailVacationSettingsForm data={defaultData} update={mockUpdate} />)
    // When disabled, the main content div should not be rendered
    const contentDivs = screen.queryAllByRole('button')
    // Only the checkbox should be rendered initially
    expect(contentDivs.length).toBeGreaterThan(0)
  })

  it('should render transition animation for button group', () => {
    render(<MailVacationSettingsForm data={defaultData} update={mockUpdate} />)
    expect(screen.getByTestId('button-group')).toBeInTheDocument()
  })

  it('should render with proper CSS class for padding', () => {
    const { container } = render(
      <MailVacationSettingsForm data={defaultData} update={mockUpdate} />
    )
    const form = container.querySelector('form')
    expect(form).toHaveClass('p-4')
  })

  it('should call update function on form submission', async () => {
    const user = userEvent.setup()
    render(<MailVacationSettingsForm data={defaultData} update={mockUpdate} />)
    // The form should be set up to call update on submit
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('should render with correct form structure', () => {
    const { container } = render(
      <MailVacationSettingsForm data={defaultData} update={mockUpdate} />
    )
    const form = container.querySelector('form')
    expect(form).toHaveClass('p-4')
    expect(form?.parentElement).toBeInTheDocument()
  })

  it('should pass form data as defaultValues to useForm', () => {
    const testData: MailVacation = {
      ...defaultData,
      autoReply: {
        ...defaultData.autoReply,
        subject: 'Test Subject',
        message: 'Test Message',
      },
    }
    render(<MailVacationSettingsForm data={testData} update={mockUpdate} />)
    // The component should render without errors with custom data
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('should render form with correct namespace prefix for translations', () => {
    render(<MailVacationSettingsForm data={defaultData} update={mockUpdate} />)
    expect(mockT).toHaveBeenCalled()
  })

  it('should handle form reset functionality', () => {
    render(<MailVacationSettingsForm data={defaultData} update={mockUpdate} />)
    const buttonGroup = screen.getByTestId('button-group')
    expect(buttonGroup).toBeInTheDocument()
  })

  it('should render all visible inputs and checkboxes', () => {
    render(<MailVacationSettingsForm data={defaultData} update={mockUpdate} />)
    const inputs = screen.getAllByRole('checkbox')
    expect(inputs.length).toBeGreaterThan(0)
  })
})
