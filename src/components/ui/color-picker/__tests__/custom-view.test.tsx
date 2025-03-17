import ColorPicker from '@/components/ui/color-picker/custom-view'
import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
jest.mock('lucide-react', () => ({
  HashIcon: jest.fn(() => <svg />),
  Save: jest.fn(() => 'Save'),
}))
// filepath: src/components/ui/color-picker/custom-view.test.tsx

jest.mock('../../button', () => ({
  Button: jest.fn(({ children, ...props }) => (
    <button {...props}>{children}</button>
  )),
}))

jest.mock('../../input', () => ({
  Input: jest.fn((props) => <input {...props} />),
}))

jest.mock('../../input-with-icon', () => ({
  InputWithIcon: jest.fn(({ ActionComponent, ...props }) => (
    <div>
      <input {...props} />
      {ActionComponent}
    </div>
  )),
}))

describe('ColorPicker Component', () => {
  it('renders the ColorPicker with default value', () => {
    render(<ColorPicker onChange={jest.fn()} />)
    expect(screen.getByDisplayValue('1C9488')).toBeInTheDocument()
  })

  it('renders the ColorPicker with provided initial color', () => {
    render(<ColorPicker defaultValue="#FF5733" onChange={jest.fn()} />)
    expect(screen.getByDisplayValue('FF5733')).toBeInTheDocument()
  })

  it('calls onChange with the correct hex value when the Save button is clicked', () => {
    const handleChange = jest.fn()
    render(<ColorPicker defaultValue="#FF5733" onChange={handleChange} />)
    fireEvent.click(screen.getByText('Save'))
    expect(handleChange).toHaveBeenCalledWith('FF5733')
  })

  it('updates the color when the hex input value changes', () => {
    render(<ColorPicker onChange={jest.fn()} />)
    const input = screen.getByDisplayValue('1C9488')
    fireEvent.change(input, { target: { value: '#FF5733' } })
    expect(screen.getByDisplayValue('FF5733')).toBeInTheDocument()
  })

  it('updates the color when the hue slider value changes', () => {
    render(<ColorPicker onChange={jest.fn()} />)
    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: 180 } })
    expect(slider).toHaveValue('180')
  })

  it('updates the color when dragging the color selector', () => {
    render(<ColorPicker onChange={jest.fn()} />)
    const canvas = screen.getByRole('slider')
    fireEvent.mouseDown(canvas, { clientX: 50, clientY: 50 })
    fireEvent.mouseMove(canvas, { clientX: 100, clientY: 100 })
    fireEvent.mouseUp(canvas)
    expect(screen.getByDisplayValue('1C9488')).toBeInTheDocument()
  })

  it('renders the InputWithIcon with correct styles', () => {
    render(<ColorPicker onChange={jest.fn()} />)
    const inputWithIcon = screen.getByRole('textbox')
    expect(inputWithIcon).toHaveClass(
      'flex w-full items-center justify-between rounded-lg border p-2 text-sm focus:ring-1'
    )
  })

  it('renders the Save button', () => {
    render(<ColorPicker onChange={jest.fn()} />)
    expect(screen.getByText('Save')).toBeInTheDocument()
  })
})
