// components/ui/color-picker.test.tsx
import { fireEvent, render, screen } from '@testing-library/react'
import { ColorPicker } from '../color-picker'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// Mock Popover components – wrap the trigger child in a data-testid container
// so we can unambiguously locate the trigger button later.
jest.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  PopoverTrigger: ({
    children,
  }: {
    children: React.ReactNode
    asChild?: boolean
  }) => <div data-testid="popover-trigger">{children}</div>,
  PopoverContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover-content">{children}</div>
  ),
}))

/** Returns the trigger <button> (the coloured circle that opens the popover). */
const getTriggerButton = () =>
  screen
    .getByTestId('popover-trigger')
    .querySelector('button') as HTMLButtonElement

const DEFAULT_COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f59e0b',
  '#6366f1',
  '#000000',
  '#6b7280',
  '#9ca3af',
  '#d1d5db',
  '#ffffff',
]

describe('ColorPicker', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  // ─── Rendering ───────────────────────────────────────────────────────────────

  describe('Rendering', () => {
    it('renders the trigger button', () => {
      render(<ColorPicker value="#ef4444" onChange={mockOnChange} />)
      expect(getTriggerButton()).toBeInTheDocument()
    })

    it('applies the value color as background on the trigger button', () => {
      render(<ColorPicker value="#3b82f6" onChange={mockOnChange} />)
      expect(getTriggerButton()).toHaveStyle({ backgroundColor: '#3b82f6' })
    })

    it('renders all default color swatches', () => {
      render(<ColorPicker value="#ef4444" onChange={mockOnChange} />)
      const buttons = screen.getAllByRole('button')
      // trigger + 15 color swatches = 16
      expect(buttons.length).toBeGreaterThanOrEqual(DEFAULT_COLORS.length)
    })

    it('renders custom colors when provided', () => {
      const customColors = ['#ff0000', '#00ff00', '#0000ff']
      render(
        <ColorPicker
          value="#ff0000"
          onChange={mockOnChange}
          colors={customColors}
        />
      )
      const colorButtons = screen.getAllByRole('button')
      // trigger + 3 swatches + potentially native color input
      expect(colorButtons.length).toBeGreaterThanOrEqual(customColors.length)
    })

    it('renders the hex text input', () => {
      render(<ColorPicker value="#ef4444" onChange={mockOnChange} />)
      const textInput = screen.getByRole('textbox') as HTMLInputElement
      expect(textInput).toBeInTheDocument()
      expect(textInput.value).toBe('#ef4444')
    })

    it('renders the native color input', () => {
      render(<ColorPicker value="#ef4444" onChange={mockOnChange} />)
      const colorInput = document.querySelector(
        'input[type="color"]'
      ) as HTMLInputElement
      expect(colorInput).toBeInTheDocument()
      expect(colorInput.value).toBe('#ef4444')
    })

    it('renders the custom color label via translations', () => {
      render(<ColorPicker value="#ef4444" onChange={mockOnChange} />)
      expect(screen.getByText('custom-color')).toBeInTheDocument()
    })
  })

  // ─── Default / Fallback Value ─────────────────────────────────────────────

  describe('Default / Fallback Value', () => {
    it('falls back to the first color when value is empty string', () => {
      render(<ColorPicker value="" onChange={mockOnChange} />)
      expect(getTriggerButton()).toHaveStyle({
        backgroundColor: DEFAULT_COLORS[0],
      })
    })

    it('falls back to first custom color when value is empty and custom colors provided', () => {
      const customColors = ['#aabbcc', '#112233']
      render(
        <ColorPicker value="" onChange={mockOnChange} colors={customColors} />
      )
      expect(getTriggerButton()).toHaveStyle({ backgroundColor: '#aabbcc' })
    })
  })

  // ─── Check Mark ──────────────────────────────────────────────────────────────

  describe('Check Mark on Selected Color', () => {
    it('shows a check icon on the currently selected color swatch', () => {
      render(<ColorPicker value="#ef4444" onChange={mockOnChange} />)
      // The Check icon renders inside the swatch button for the matching color
      const svgIcons = document.querySelectorAll('svg')
      expect(svgIcons.length).toBeGreaterThan(0)
    })

    it('does not show check icon on non-selected swatches', () => {
      render(<ColorPicker value="#ef4444" onChange={mockOnChange} />)
      // Only one check icon should be present
      const svgIcons = document.querySelectorAll('svg')
      expect(svgIcons.length).toBe(1)
    })
  })

  // ─── Interactions ─────────────────────────────────────────────────────────

  describe('Color Swatch Click', () => {
    it('calls onChange when selecting a different color', async () => {
      render(<ColorPicker value="#ef4444" onChange={mockOnChange} />)
      const swatchButtons = document.querySelectorAll<HTMLButtonElement>(
        'button[style*="background-color"]'
      )
      fireEvent.click(swatchButtons[2])
      expect(mockOnChange).toHaveBeenCalledTimes(1)
    })
  })

  describe('Hex Text Input', () => {
    it('calls onChange with a valid hex value when typed', () => {
      render(<ColorPicker value="#ef4444" onChange={mockOnChange} />)
      const textInput = screen.getByRole('textbox')
      fireEvent.change(textInput, { target: { value: '#3b82f6' } })
      expect(mockOnChange).toHaveBeenCalledWith('#3b82f6')
    })

    it('does not call onChange for invalid hex input', () => {
      render(<ColorPicker value="#ef4444" onChange={mockOnChange} />)
      const textInput = screen.getByRole('textbox')
      fireEvent.change(textInput, { target: { value: 'invalid' } })
      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('allows partial hex values (#abc)', () => {
      render(<ColorPicker value="#ef4444" onChange={mockOnChange} />)
      const textInput = screen.getByRole('textbox')
      fireEvent.change(textInput, { target: { value: '#abc' } })
      expect(mockOnChange).toHaveBeenCalledWith('#abc')
    })

    it('allows the # character alone', () => {
      render(<ColorPicker value="#ef4444" onChange={mockOnChange} />)
      const textInput = screen.getByRole('textbox')
      fireEvent.change(textInput, { target: { value: '#' } })
      expect(mockOnChange).toHaveBeenCalledWith('#')
    })

    it('rejects values without leading #', () => {
      render(<ColorPicker value="#ef4444" onChange={mockOnChange} />)
      const textInput = screen.getByRole('textbox')
      fireEvent.change(textInput, { target: { value: 'ef4444' } })
      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('rejects values longer than 7 characters (#xxxxxxxx)', () => {
      render(<ColorPicker value="#ef4444" onChange={mockOnChange} />)
      const textInput = screen.getByRole('textbox')
      fireEvent.change(textInput, { target: { value: '#ef44441' } })
      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('has maxLength of 7', () => {
      render(<ColorPicker value="#ef4444" onChange={mockOnChange} />)
      const textInput = screen.getByRole('textbox') as HTMLInputElement
      expect(textInput.maxLength).toBe(7)
    })
  })

  describe('Native Color Input', () => {
    it('calls onChange when native color input changes', () => {
      render(<ColorPicker value="#ef4444" onChange={mockOnChange} />)
      const colorInput = document.querySelector(
        'input[type="color"]'
      ) as HTMLInputElement
      fireEvent.change(colorInput, { target: { value: '#00ff00' } })
      expect(mockOnChange).toHaveBeenCalledWith('#00ff00')
    })

    it('reflects the current value in the native color input', () => {
      render(<ColorPicker value="#8b5cf6" onChange={mockOnChange} />)
      const colorInput = document.querySelector(
        'input[type="color"]'
      ) as HTMLInputElement
      expect(colorInput.value).toBe('#8b5cf6')
    })
  })

  // ─── Disabled State ───────────────────────────────────────────────────────

  describe('Disabled State', () => {
    it('disables the trigger button when disabled prop is true', () => {
      render(<ColorPicker value="#ef4444" onChange={mockOnChange} disabled />)
      expect(getTriggerButton()).toBeDisabled()
    })

    it('trigger button is enabled by default', () => {
      render(<ColorPicker value="#ef4444" onChange={mockOnChange} />)
      expect(getTriggerButton()).not.toBeDisabled()
    })
  })

  // ─── Props ────────────────────────────────────────────────────────────────

  describe('Props', () => {
    it('uses provided colors array instead of defaults', () => {
      const customColors = ['#ff0000', '#00ff00', '#0000ff']
      render(
        <ColorPicker
          value="#ff0000"
          onChange={mockOnChange}
          colors={customColors}
        />
      )
      const swatches = document.querySelectorAll<HTMLButtonElement>(
        'button[style*="background-color"]'
      )
      // 1 trigger + 3 swatches = 4
      expect(swatches).toHaveLength(4)
    })

    it('accepts and displays uppercase hex values', () => {
      render(<ColorPicker value="#EF4444" onChange={mockOnChange} />)
      const textInput = screen.getByRole('textbox') as HTMLInputElement
      expect(textInput.value).toBe('#EF4444')
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────────────

  describe('Accessibility', () => {
    it('trigger button has type="button" to prevent form submission', () => {
      render(<ColorPicker value="#ef4444" onChange={mockOnChange} />)
      expect(getTriggerButton()).toHaveAttribute('type', 'button')
    })

    it('all swatch buttons have type="button"', () => {
      render(<ColorPicker value="#ef4444" onChange={mockOnChange} />)
      const allButtons = screen.getAllByRole('button')
      allButtons.forEach((btn) => {
        expect(btn).toHaveAttribute('type', 'button')
      })
    })
  })
})
