import { TimePicker } from '@/components/ui/time-picker'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// ── Mocks ─────────────────────────────────────────────────────────────────────

type SelectProps = {
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  children: React.ReactNode
}

type SelectItemProps = {
  value: string
  children: React.ReactNode
}

jest.mock('@/components/ui/select', () => ({
  Select: ({ value, onValueChange, disabled, children }: SelectProps) => (
    <select
      value={value ?? ''}
      disabled={disabled}
      onChange={(e) => onValueChange?.(e.target.value)}
    >
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <span data-testid="placeholder">{placeholder}</span>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  SelectItem: ({ value, children }: SelectItemProps) => (
    <option value={value}>{children}</option>
  ),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function getSelects() {
  const [hoursSelect, minutesSelect] = screen.getAllByRole('combobox')
  return { hoursSelect, minutesSelect }
}

function renderPicker(props: React.ComponentProps<typeof TimePicker> = {}) {
  const onChange = jest.fn()
  const utils = render(<TimePicker onChange={onChange} {...props} />)
  return { onChange, ...utils }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('TimePicker', () => {
  describe('rendering', () => {
    it('renders two select elements (hours and minutes)', () => {
      renderPicker()
      expect(screen.getAllByRole('combobox')).toHaveLength(2)
    })

    it('renders the colon separator between selects', () => {
      renderPicker()
      expect(screen.getByText(':')).toBeInTheDocument()
    })

    it('renders 24 hour options (00–23)', () => {
      renderPicker()
      const { hoursSelect } = getSelects()
      expect(hoursSelect.querySelectorAll('option')).toHaveLength(24)
    })

    it('renders 60 minute options (00–59)', () => {
      renderPicker()
      const { minutesSelect } = getSelects()
      expect(minutesSelect.querySelectorAll('option')).toHaveLength(60)
    })

    it('pads single-digit hours with a leading zero', () => {
      renderPicker()
      const { hoursSelect } = getSelects()
      const options = Array.from(hoursSelect.querySelectorAll('option'))
      expect(options[0].textContent).toBe('00')
      expect(options[9].textContent).toBe('09')
      expect(options[10].textContent).toBe('10')
      expect(options[23].textContent).toBe('23')
    })

    it('pads single-digit minutes with a leading zero', () => {
      renderPicker()
      const { minutesSelect } = getSelects()
      const options = Array.from(minutesSelect.querySelectorAll('option'))
      expect(options[0].textContent).toBe('00')
      expect(options[5].textContent).toBe('05')
      expect(options[59].textContent).toBe('59')
    })

    it('renders HH and MM placeholders', () => {
      renderPicker()
      const placeholders = screen.getAllByTestId('placeholder')
      expect(placeholders[0].textContent).toBe('HH')
      expect(placeholders[1].textContent).toBe('MM')
    })
  })

  describe('controlled value', () => {
    it('sets the hours select to the provided value', () => {
      renderPicker({ value: { hours: 9, minutes: 30 } })
      const { hoursSelect } = getSelects()
      expect(hoursSelect).toHaveValue('9')
    })

    it('sets the minutes select to the provided value', () => {
      renderPicker({ value: { hours: 9, minutes: 30 } })
      const { minutesSelect } = getSelects()
      expect(minutesSelect).toHaveValue('30')
    })

    it('handles hours: 0 correctly (not treated as falsy)', () => {
      renderPicker({ value: { hours: 0, minutes: 0 } })
      const { hoursSelect } = getSelects()
      expect(hoursSelect).toHaveValue('0')
    })

    it('handles minutes: 0 correctly (not treated as falsy)', () => {
      renderPicker({ value: { hours: 0, minutes: 0 } })
      const { minutesSelect } = getSelects()
      expect(minutesSelect).toHaveValue('0')
    })
  })

  describe('default values', () => {
    it('falls back to defaultHours when no value is provided', () => {
      renderPicker({ defaultHours: 8 })
      const { hoursSelect } = getSelects()
      expect(hoursSelect).toHaveValue('8')
    })

    it('falls back to defaultMinutes when no value is provided', () => {
      renderPicker({ defaultMinutes: 45 })
      const { minutesSelect } = getSelects()
      expect(minutesSelect).toHaveValue('45')
    })

    it('defaults to 00:00 when no value or defaults are provided', () => {
      renderPicker()
      const { hoursSelect, minutesSelect } = getSelects()
      expect(hoursSelect).toHaveValue('0')
      expect(minutesSelect).toHaveValue('0')
    })

    it('value prop takes precedence over defaultHours', () => {
      renderPicker({ value: { hours: 15, minutes: 0 }, defaultHours: 8 })
      const { hoursSelect } = getSelects()
      expect(hoursSelect).toHaveValue('15')
    })

    it('value prop takes precedence over defaultMinutes', () => {
      renderPicker({ value: { hours: 0, minutes: 20 }, defaultMinutes: 45 })
      const { minutesSelect } = getSelects()
      expect(minutesSelect).toHaveValue('20')
    })
  })

  describe('onChange interactions', () => {
    it('calls onChange with new hours when the hours select changes', async () => {
      const { onChange } = renderPicker({ value: { hours: 0, minutes: 30 } })
      const { hoursSelect } = getSelects()
      await userEvent.selectOptions(hoursSelect, '14')
      expect(onChange).toHaveBeenCalledWith({ hours: 14, minutes: 30 })
    })

    it('calls onChange with new minutes when the minutes select changes', async () => {
      const { onChange } = renderPicker({ value: { hours: 10, minutes: 0 } })
      const { minutesSelect } = getSelects()
      await userEvent.selectOptions(minutesSelect, '45')
      expect(onChange).toHaveBeenCalledWith({ hours: 10, minutes: 45 })
    })

    it('preserves current minutes when hours change', async () => {
      const { onChange } = renderPicker({ value: { hours: 1, minutes: 59 } })
      const { hoursSelect } = getSelects()
      await userEvent.selectOptions(hoursSelect, '23')
      expect(onChange).toHaveBeenCalledWith({ hours: 23, minutes: 59 })
    })

    it('preserves current hours when minutes change', async () => {
      const { onChange } = renderPicker({ value: { hours: 22, minutes: 10 } })
      const { minutesSelect } = getSelects()
      await userEvent.selectOptions(minutesSelect, '5')
      expect(onChange).toHaveBeenCalledWith({ hours: 22, minutes: 5 })
    })

    it('does not call onChange on initial render', () => {
      const { onChange } = renderPicker({ value: { hours: 12, minutes: 30 } })
      expect(onChange).not.toHaveBeenCalled()
    })

    it('does not throw when onChange is not provided', async () => {
      render(<TimePicker value={{ hours: 0, minutes: 0 }} />)
      const { hoursSelect } = getSelects()
      await expect(
        userEvent.selectOptions(hoursSelect, '5')
      ).resolves.not.toThrow()
    })
  })

  describe('disabled state', () => {
    it('disables both selects when disabled=true', () => {
      renderPicker({ disabled: true })
      const { hoursSelect, minutesSelect } = getSelects()
      expect(hoursSelect).toBeDisabled()
      expect(minutesSelect).toBeDisabled()
    })

    it('enables both selects when disabled=false (default)', () => {
      renderPicker({ disabled: false })
      const { hoursSelect, minutesSelect } = getSelects()
      expect(hoursSelect).not.toBeDisabled()
      expect(minutesSelect).not.toBeDisabled()
    })

    it('does not call onChange when disabled and a selection is attempted', async () => {
      const { onChange } = renderPicker({
        disabled: true,
        value: { hours: 0, minutes: 0 },
      })
      const { hoursSelect } = getSelects()
      // Disabled selects block native events; onChange should remain uncalled
      await userEvent.selectOptions(hoursSelect, '10').catch(() => {})
      expect(onChange).not.toHaveBeenCalled()
    })
  })
})
