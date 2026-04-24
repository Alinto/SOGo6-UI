import { UserPreferences } from '@/features/user-settings/store/user-preferences-api-types'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useTranslations } from 'next-intl'
import { GeneralSettingsForm } from '../general-form-core'

export const UserGeneralMock = {
  SOGO_U_LANGUAGE: 'en',
  SOGO_U_TIME_FORMAT: '24H',
  SOGO_U_FIRST_MODULE: 'mail',
  SOGO_U_BROWSER_NOTIF: false,
  SOGO_U_EXT_AVATAR_ENABLED: false,
  SOGO_U_LONG_DATE: 'Saturday, February 01, 2025',
  SOGO_U_SHORT_DATE: '01-Feb-25',
  SOGO_U_TIMEZONE: 'Europe/London',
  SOGO_U_PROFILE_PICTURE: 'default',
}

export const UserSecurityMock = {
  SOGO_U_MFA_ENABLE: false,
}

export const UserContactGeneralMock = {
  SOGO_U_ADDRESSBOOK_CREATION_NOTIF: false,
}

export const UserCalendarGeneralMock = {
  SOGO_U_NO_INVITATION: false,
  SOGO_U_BUSY_OFF_HOURS: false,
  SOGO_U_CALENDAR_DEFAULT: 'Work',
  SOGO_U_WORKDAY_END_TIME: '18:00',
  SOGO_U_TASK_DEFAULT_CLASS: 'Normal',
  SOGO_U_WORKDAY_START_TIME: '09:00',
  SOGO_U_EVENT_DEFAULT_CLASS: 'Normal',
  SOGO_U_CALENDAR_DAYS_SHOWED: [1, 2, 3, 4, 5],
  SOGO_U_JOURNAL_DEFAULT_CLASS: 'Normal',
  SOGO_U_TASK_DEFAULT_REMINDER: '15 minutes before',
  SOGO_U_EVENT_DEFAULT_REMINDER: '15 minutes before',
  SOGO_U_CALENDAR_CREATION_NOTIF: false,
  SOGO_U_CALENDAR_VIEW_FIRST_DAY: 1,
  SOGO_U_JOURNAL_DEFAULT_REMINDER: '15 minutes before',
  SOGO_U_DAV_FORCE_SYNC_FROM_CLIENT: false,
  SOGO_U_DO_NOT_SEND_INVIT_FROM_DAV: false,
  SOGO_U_CALENDAR_WEEK_NUMBER_FORMAT: 'ISO',
}

export const UserPreferencesMock = {
  USER_GENERAL: UserGeneralMock,
  USER_SECURITY: UserSecurityMock,
  USER_CONTACT_GENERAL: UserContactGeneralMock,
  USER_CALENDAR_GENERAL: UserCalendarGeneralMock,
  USER_CONTACT_CATEGORY: {},
  USER_CALENDAR_CATEGORY: {},
  USER_MAIL_GENERAL_SETTINGS: {},
}

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
  useLocale: () => 'en',
}))

// Mock UI components
jest.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({ checked, onCheckedChange, ...props }: any) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      {...props}
    />
  ),
}))

jest.mock('@/components/ui/forms/fixed-form-button-group', () => {
  return function MockButtonGroup(props: any) {
    return (
      <div data-testid="button-group">
        <button
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

jest.mock('@/components/ui/forms/select-form', () => {
  return function MockSelectForm({ value, onValueChange, options }: any) {
    return (
      <select
        data-testid="select-form"
        value={value}
        onChange={(e) => onValueChange?.(e.target.value)}
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

jest.mock('@/components/ui/forms/radio-group-form', () => {
  return function MockRadioGroupForm({ value, onValueChange, options }: any) {
    return (
      <div data-testid="radio-group-form">
        {options?.map((opt: any) => (
          <label key={opt.value}>
            <input
              type="radio"
              name="radio-group"
              value={opt.value}
              checked={value === opt.value}
              onChange={(e) => onValueChange?.(e.target.value)}
            />
            {opt.label}
          </label>
        ))}
      </div>
    )
  }
})

const mockData: UserPreferences = UserPreferencesMock

describe('GeneralSettingsForm', () => {
  const mockUpdate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup mock translations
    ;(useTranslations as jest.Mock).mockImplementation(() => {
      return (key: string) => {
        const translations: Record<string, string> = {
          'labels.language.string': 'Language',
          'labels.timezone.string': 'Timezone',
          'labels.short_date_style.string': 'Short Date Format',
          'labels.long_date_style.string': 'Long Date Format',
          'labels.time_style.string': 'Time Format',
          'labels.default_view.string': 'Default View',
          'labels.refresh_frequency.string': 'Refresh Frequency',
          'labels.enable_notifications.string': 'Enable Notifications',
          'labels.animation_level.string': 'Animation Level',
          'descriptions.language.string': 'Select your language',
          'descriptions.timezone.string': 'Select your timezone',
          'descriptions.short_date_style.string': 'Choose short date format',
          'descriptions.long_date_style.string': 'Choose long date format',
          'descriptions.time_style.string': 'Choose time format',
          'descriptions.default_view.string': 'Choose default view',
          'descriptions.refresh_frequency.string': 'Choose refresh frequency',
          'descriptions.enable_notifications.string':
            'Enable desktop notifications',
        }
        return translations[key] || key
      }
    })
  })

  it('should render all form fields with default values', () => {
    render(<GeneralSettingsForm data={mockData} update={mockUpdate} />)

    expect(screen.getByText('Language')).toBeInTheDocument()
    expect(screen.getByText('Timezone')).toBeInTheDocument()
    expect(screen.getByText('Short Date Format')).toBeInTheDocument()
    expect(screen.getByText('Long Date Format')).toBeInTheDocument()
    expect(screen.getByText('Time Format')).toBeInTheDocument()
    expect(screen.getByText('Default View')).toBeInTheDocument()
    expect(screen.getByText('Enable Notifications')).toBeInTheDocument()
  })

  it('should render with undefined data and default to English', () => {
    render(<GeneralSettingsForm data={undefined} update={mockUpdate} />)

    expect(screen.getByText('Language')).toBeInTheDocument()
    expect(screen.getByTestId('button-group')).toBeInTheDocument()
  })

  it('should render the button group', () => {
    render(<GeneralSettingsForm data={mockData} update={mockUpdate} />)

    expect(screen.getByTestId('button-group')).toBeInTheDocument()
    expect(screen.getByTestId('submit-btn')).toBeInTheDocument()
    expect(screen.getByTestId('reset-btn')).toBeInTheDocument()
  })

  it('should have disabled submit button initially', () => {
    render(<GeneralSettingsForm data={mockData} update={mockUpdate} />)

    const submitButton = screen.getByTestId('submit-btn')
    expect(submitButton).toBeDisabled()
  })

  it('should enable buttons when form is modified', async () => {
    const user = userEvent.setup()
    render(<GeneralSettingsForm data={mockData} update={mockUpdate} />)

    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])

    await waitFor(() => {
      expect(screen.getByTestId('submit-btn')).not.toBeDisabled()
    })
  })

  it('should call update function on form submission', async () => {
    const user = userEvent.setup()

    render(<GeneralSettingsForm data={mockData} update={mockUpdate} />)

    const checkbox = screen.getAllByRole('checkbox')[0] as HTMLInputElement
    await user.click(checkbox)

    // Use querySelector since form doesn't have role="form"
    const form = document.querySelector('form')
    expect(form).toBeInTheDocument()

    const submitButton = screen.getByTestId('submit-btn')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled()
    })
  })

  it('should use correct translation namespace', () => {
    render(<GeneralSettingsForm data={mockData} update={mockUpdate} />)

    expect(useTranslations).toHaveBeenCalledWith('US_GENERAL')
  })

  it('should render form with correct structure', () => {
    const { container } = render(
      <GeneralSettingsForm data={mockData} update={mockUpdate} />
    )

    const form = container.querySelector('form')
    expect(form).toBeInTheDocument()

    const gridDiv = container.querySelector('.grid.gap-4.space-y-5')
    expect(gridDiv).toBeInTheDocument()
  })

  it('should handle checkbox state correctly', async () => {
    const user = userEvent.setup()

    render(<GeneralSettingsForm data={mockData} update={mockUpdate} />)

    const checkbox = screen.getAllByRole(
      'checkbox'
    )[0] as HTMLInputElement as HTMLInputElement
    expect(checkbox.checked).toBe(false)

    await user.click(checkbox)

    await waitFor(() => {
      expect(checkbox.checked).toBe(true)
    })
  })

  it('should render all select options correctly', () => {
    render(<GeneralSettingsForm data={mockData} update={mockUpdate} />)

    expect(screen.getByText('language.english')).toBeInTheDocument()
    expect(screen.getByText('labels.mail.string')).toBeInTheDocument()
  })
})
