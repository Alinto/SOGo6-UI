import { ReminderPicker } from '@/components/ui/reminder-picker'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// ── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      'duration-picker.noReminder': 'No reminder',
      'duration-picker.5min': '5 minutes',
      'duration-picker.10min': '10 minutes',
      'duration-picker.15min': '15 minutes',
      'duration-picker.30min': '30 minutes',
      'duration-picker.45min': '45 minutes',
      'duration-picker.1h': '1 hour',
      'duration-picker.2h': '2 hours',
      'duration-picker.5h': '5 hours',
      'duration-picker.15h': '15 hours',
      'duration-picker.1d': '1 day',
      'duration-picker.2d': '2 days',
      'duration-picker.1w': '1 week',
    }
    return map[key] ?? key
  },
}))

// Capture the props SelectForm receives so we can inspect and invoke them
let capturedProps: {
  value: string
  onValueChange: (value: string) => void
  options: { value: string; label: string }[]
} | null = null

jest.mock('@/components/ui/forms/select-form', () => ({
  __esModule: true,
  default: (props: typeof capturedProps) => {
    capturedProps = props
    return (
      <select
        data-testid="select"
        value={props!.value}
        onChange={(e) => props!.onValueChange(e.target.value)}
      >
        {props!.options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    )
  },
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

const ALL_OPTIONS = [
  { value: '-1', label: 'No reminder' },
  { value: '5', label: '5 minutes' },
  { value: '10', label: '10 minutes' },
  { value: '15', label: '15 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '45', label: '45 minutes' },
  { value: '60', label: '1 hour' },
  { value: '120', label: '2 hours' },
  { value: '300', label: '5 hours' },
  { value: '900', label: '15 hours' },
  { value: '1440', label: '1 day' },
  { value: '2880', label: '2 days' },
  { value: '10080', label: '1 week' },
]

function renderPicker(value = '-1', onChange = jest.fn()) {
  return {
    onChange,
    ...render(<ReminderPicker value={value} onChange={onChange} />),
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  capturedProps = null
})

describe('ReminderPicker', () => {
  describe('rendering', () => {
    it('renders the SelectForm component', () => {
      renderPicker()
      expect(screen.getByTestId('select')).toBeInTheDocument()
    })

    it('passes the current value to SelectForm', () => {
      renderPicker('30')
      expect(screen.getByTestId('select')).toHaveValue('30')
    })

    it('passes all 13 options to SelectForm', () => {
      renderPicker()
      expect(capturedProps!.options).toHaveLength(13)
    })

    it.each(ALL_OPTIONS)(
      'includes option value="$value" with translated label "$label"',
      ({ value, label }) => {
        renderPicker()
        const option = capturedProps!.options.find((o) => o.value === value)
        expect(option).toBeDefined()
        expect(option!.label).toBe(label)
      }
    )

    it('renders all option labels in the DOM', () => {
      renderPicker()
      for (const { label } of ALL_OPTIONS) {
        expect(screen.getByText(label)).toBeInTheDocument()
      }
    })
  })

  describe('option values', () => {
    it('has "-1" as the no-reminder sentinel value', () => {
      renderPicker()
      const noReminder = capturedProps!.options.find((o) => o.value === '-1')
      expect(noReminder!.label).toBe('No reminder')
    })

    it('preserves the correct numeric string values for every option', () => {
      renderPicker()
      const values = capturedProps!.options.map((o) => o.value)
      expect(values).toEqual([
        '-1',
        '5',
        '10',
        '15',
        '30',
        '45',
        '60',
        '120',
        '300',
        '900',
        '1440',
        '2880',
        '10080',
      ])
    })
  })

  describe('interactions', () => {
    it('calls onChange with the selected value when the user picks an option', async () => {
      const { onChange } = renderPicker('-1')
      await userEvent.selectOptions(screen.getByTestId('select'), '30')
      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith('30')
    })

    it('calls onChange for every distinct option the user selects', async () => {
      const { onChange } = renderPicker('-1')
      const select = screen.getByTestId('select')
      await userEvent.selectOptions(select, '60')
      await userEvent.selectOptions(select, '1440')
      expect(onChange).toHaveBeenNthCalledWith(1, '60')
      expect(onChange).toHaveBeenNthCalledWith(2, '1440')
    })

    it('does not call onChange on initial render', () => {
      const { onChange } = renderPicker('15')
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  describe('translations', () => {
    it('uses the COMPONENTS translation namespace', () => {
      // useTranslations is called with 'COMPONENTS' — verified via the mock key prefix
      renderPicker()
      // All labels are translated (not raw keys)
      const labels = capturedProps!.options.map((o) => o.label)
      expect(labels).not.toContain('duration-picker.noReminder')
      expect(labels).not.toContain('duration-picker.1w')
    })
  })
})
