import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useTranslations } from 'next-intl'
import LabelsForm from '../calendar-general-form-core'

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}))

jest.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}))

jest.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({ checked, onCheckedChange, ...props }: any) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      {...props}
    />
  ),
}))

jest.mock('@/components/ui/form', () => ({
  Form: ({ children }: any) => <div>{children}</div>,
  FormControl: ({ children }: any) => <div>{children}</div>,
  FormField: ({ name, render }: any) => {
    // Fields that expect an array value (used with .map())
    const arrayFields = ['calendarDaysShowed', 'noInvitationWhitelist']
    const isArray = arrayFields.some((f) => name?.includes(f))
    return render({
      field: { value: isArray ? [] : '', onChange: jest.fn(), checked: false },
    })
  },
  FormItem: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  FormLabel: ({ children, ...props }: any) => (
    <label {...props}>{children}</label>
  ),
}))

jest.mock('@/components/ui/forms/select-form', () => {
  return function MockSelectForm({ value, onValueChange, options }: any) {
    return (
      <select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        data-testid="select"
      >
        {options?.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    )
  }
})

jest.mock('@/components/ui/combomultiple', () => ({
  MultiSelect: ({ selected, onChange, options }: any) => (
    <select
      multiple
      value={selected}
      onChange={(e) =>
        onChange(Array.from(e.target.selectedOptions).map((o: any) => o.value))
      }
      data-testid="multi-select"
    >
      {options?.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
}))

jest.mock('@/components/ui/emails-tag-input', () => ({
  EmailsTagInput: ({ value, onChange, disabled }: any) => (
    <input
      data-testid="emails-tag-input"
      value={value?.join(',') ?? ''}
      onChange={(e) => onChange(e.target.value.split(',').filter(Boolean))}
      disabled={disabled}
    />
  ),
}))

jest.mock('@/components/ui/forms/fixed-form-button-group', () => {
  return function MockFixedFormButtonGroup(props: any) {
    return (
      <div data-testid="button-group">
        <button
          type="button"
          onClick={props.onReset}
          disabled={props.disableReset}
          data-testid="reset-btn"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={props.disableSubmit}
          data-testid="submit-btn"
        >
          Submit
        </button>
      </div>
    )
  }
})

jest.mock('../../../store/calendar-utils', () => ({
  apiToCalendarGeneral: jest.fn((data) => data),
  calendarGeneralToApi: jest.fn((data) => data),
}))

jest.mock('../calendar-general-schema', () => ({
  schema: {},
  eventState: ['PUBLIC', 'PRIVATE', 'CONFIDENTIAL'],
}))

jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: jest.fn(() => async (values: any) => ({ values, errors: {} })),
}))

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockUpdate = jest.fn()

const mockData = {
  calendarViewFirstDay: 1,
  calendarCreationNotif: false,
  workdayStartTime: '09:00',
  workdayEndTime: '17:00',
  busyOffHours: false,
  calendarDaysShowed: [1, 2, 3, 4, 5],
  calendarWeekNumberFormat: '%V',
  calendarDefault: 'SOGO_DEFAULT_CALENDAR',
  eventDefaultClass: 'PUBLIC',
  taskDefaultClass: 'PUBLIC',
  journalDefaultClass: 'PUBLIC',
  eventDefaultReminder: '5',
  taskDefaultReminder: '5',
  journalDefaultReminder: '5',
  noInvitation: false,
  noInvitationWhitelist: [],
  doNotSendInvitFromDav: false,
}

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks()
  ;(useTranslations as jest.Mock).mockImplementation((namespace: string) => {
    const translations: Record<string, Record<string, string>> = {
      US_CALENDARS: {
        'calendarViewFirstDay.string': 'First day of week',
        'calendarViewFirstDay.0': 'Sunday',
        'calendarViewFirstDay.1': 'Monday',
        'calendarViewFirstDay.2': 'Tuesday',
        'calendarViewFirstDay.3': 'Wednesday',
        'calendarViewFirstDay.4': 'Thursday',
        'calendarViewFirstDay.5': 'Friday',
        'calendarViewFirstDay.6': 'Saturday',
        'calendarCreationNotif.string': 'Calendar creation notification',
        'workdayStartTime.string': 'Workday start time',
        'workdayEndTime.string': 'Workday end time',
        'busyOffHours.string': 'Busy off hours',
        'calendarDaysShowed.string': 'Days showed',
        'calendarWeekNumberFormat.string': 'Week number format',
        'calendarWeekNumberFormat.%U': 'Sunday-based',
        'calendarWeekNumberFormat.%W': 'Monday-based',
        'calendarWeekNumberFormat.%V': 'ISO 8601',
        'eventDefaultClass.string': 'Event default class',
        'taskDefaultClass.string': 'Task default class',
        'journalDefaultClass.string': 'Journal default class',
        'eventDefaultReminder.string': 'Event default reminder',
        'taskDefaultReminder.string': 'Task default reminder',
        'journalDefaultReminder.string': 'Journal default reminder',
        'noInvitation.string': 'No invitation',
        'noInvitationWhitelist.string': 'Invitation whitelist',
        'doNotSendInvitFromDav.string': 'Do not send invitations from DAV',
        'calendarStatus.PUBLIC': 'Public',
        'calendarStatus.PRIVATE': 'Private',
        'calendarStatus.CONFIDENTIAL': 'Confidential',
      },
    }
    return (key: string, variables?: Record<string, string>) => {
      let result = translations[namespace]?.[key] ?? key
      if (variables) {
        Object.entries(variables).forEach(([k, v]) => {
          result = result.replace(`{{${k}}}`, v)
        })
      }
      return result
    }
  })
})

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CalendarGeneralForm', () => {
  describe('rendering', () => {
    it('renders without crashing when data is undefined', () => {
      render(<LabelsForm data={undefined} update={mockUpdate} />)

      expect(screen.getByTestId('button-group')).toBeInTheDocument()
    })

    it('renders the form element', () => {
      const { container } = render(
        <LabelsForm data={undefined} update={mockUpdate} />
      )

      expect(container.querySelector('form')).toBeInTheDocument()
    })

    it('renders the fixed button group with reset and submit', () => {
      render(<LabelsForm data={undefined} update={mockUpdate} />)

      expect(screen.getByTestId('reset-btn')).toBeInTheDocument()
      expect(screen.getByTestId('submit-btn')).toBeInTheDocument()
    })

    it('disables reset and submit buttons when the form is pristine', () => {
      render(<LabelsForm data={undefined} update={mockUpdate} />)

      expect(screen.getByTestId('reset-btn')).toBeDisabled()
      expect(screen.getByTestId('submit-btn')).toBeDisabled()
    })
  })

  describe('field labels', () => {
    it('renders the first day of week label', () => {
      render(<LabelsForm data={mockData as any} update={mockUpdate} />)

      expect(screen.getByText('First day of week')).toBeInTheDocument()
    })

    it('renders the workday start and end time labels', () => {
      render(<LabelsForm data={mockData as any} update={mockUpdate} />)

      expect(screen.getByText('Workday start time')).toBeInTheDocument()
      expect(screen.getByText('Workday end time')).toBeInTheDocument()
    })

    it('renders the event, task and journal default class labels', () => {
      render(<LabelsForm data={mockData as any} update={mockUpdate} />)

      expect(screen.getByText('Event default class')).toBeInTheDocument()
      expect(screen.getByText('Task default class')).toBeInTheDocument()
      expect(screen.getByText('Journal default class')).toBeInTheDocument()
    })

    it('renders the event, task and journal default reminder labels', () => {
      render(<LabelsForm data={mockData as any} update={mockUpdate} />)

      expect(screen.getByText('Event default reminder')).toBeInTheDocument()
      expect(screen.getByText('Task default reminder')).toBeInTheDocument()
      expect(screen.getByText('Journal default reminder')).toBeInTheDocument()
    })

    it('renders the noInvitation and doNotSendInvitFromDav labels', () => {
      render(<LabelsForm data={mockData as any} update={mockUpdate} />)

      expect(screen.getByText('No invitation')).toBeInTheDocument()
      expect(
        screen.getByText('Do not send invitations from DAV')
      ).toBeInTheDocument()
    })

    it('renders the invitation whitelist label', () => {
      render(<LabelsForm data={mockData as any} update={mockUpdate} />)

      expect(screen.getByText('Invitation whitelist')).toBeInTheDocument()
    })
  })

  describe('checkboxes', () => {
    it('renders the calendarCreationNotif checkbox', () => {
      render(<LabelsForm data={mockData as any} update={mockUpdate} />)

      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes.length).toBeGreaterThanOrEqual(1)
    })

    it('renders checkboxes for busyOffHours, noInvitation, and doNotSendInvitFromDav', () => {
      render(<LabelsForm data={mockData as any} update={mockUpdate} />)

      // 4 checkboxes: calendarCreationNotif, busyOffHours, noInvitation, doNotSendInvitFromDav
      expect(screen.getAllByRole('checkbox')).toHaveLength(5)
    })
  })

  describe('select fields', () => {
    it('renders select dropdowns for the form', () => {
      render(<LabelsForm data={mockData as any} update={mockUpdate} />)

      expect(screen.getAllByTestId('select').length).toBeGreaterThanOrEqual(1)
    })

    it('renders the multi-select for calendar days showed', () => {
      render(<LabelsForm data={mockData as any} update={mockUpdate} />)

      expect(screen.getByTestId('multi-select')).toBeInTheDocument()
    })
  })

  describe('email whitelist', () => {
    it('renders the emails tag input', () => {
      render(<LabelsForm data={mockData as any} update={mockUpdate} />)

      expect(screen.getByTestId('emails-tag-input')).toBeInTheDocument()
    })

    it('disables the emails tag input when noInvitation is unchecked', () => {
      render(<LabelsForm data={mockData as any} update={mockUpdate} />)

      expect(screen.getByTestId('emails-tag-input')).toBeDisabled()
    })

    it('enables the emails tag input when noInvitation is checked', async () => {
      const user = userEvent.setup()

      render(
        <LabelsForm
          data={{ ...mockData, noInvitation: true } as any}
          update={mockUpdate}
        />
      )

      expect(screen.getByTestId('emails-tag-input')).not.toBeDisabled()
    })
  })

  describe('translations', () => {
    it('calls useTranslations with the correct namespace', () => {
      render(<LabelsForm data={undefined} update={mockUpdate} />)

      expect(useTranslations).toHaveBeenCalledWith('US_CALENDARS')
    })
  })
})
