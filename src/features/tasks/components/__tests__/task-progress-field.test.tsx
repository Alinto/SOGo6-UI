import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import TaskProgressField from '../task-progress-field'

describe('TaskProgressField', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('renders field container and label', () => {
      render(<TaskProgressField value={50} onChange={jest.fn()} />)
      expect(screen.getByTestId('task-progress-field')).toBeInTheDocument()
      expect(
        screen.getByText('form.percent_complete.string')
      ).toBeInTheDocument()
    })

    it('displays clamped percentage value', () => {
      render(<TaskProgressField value={120} onChange={jest.fn()} />)
      expect(screen.getByText('100%')).toBeInTheDocument()
    })
  })

  describe('configuration', () => {
    it('calls onChange when slider value changes', () => {
      const onChange = jest.fn()
      render(<TaskProgressField value={25} onChange={onChange} />)

      const slider = screen.getByRole('slider')
      fireEvent.change(slider, { target: { value: '75' } })

      expect(onChange).toHaveBeenCalledWith(75)
    })

    it('disables slider when disabled prop is true', () => {
      render(
        <TaskProgressField value={40} onChange={jest.fn()} disabled />
      )
      expect(screen.getByRole('slider')).toBeDisabled()
    })
  })

  describe('accessibility', () => {
    it('associates label with range input', () => {
      render(<TaskProgressField value={30} onChange={jest.fn()} />)
      const slider = screen.getByRole('slider')
      const label = screen.getByText('form.percent_complete.string')
      expect(slider).toHaveAttribute('id')
      expect(label).toHaveAttribute('for', slider.getAttribute('id'))
    })

    it('exposes aria value attributes on slider', () => {
      render(<TaskProgressField value={45} onChange={jest.fn()} />)
      const slider = screen.getByRole('slider')
      expect(slider).toHaveAttribute('aria-valuemin', '0')
      expect(slider).toHaveAttribute('aria-valuemax', '100')
      expect(slider).toHaveAttribute('aria-valuenow', '45')
    })
  })

  describe('custom styling', () => {
    it('applies custom className to container', () => {
      render(
        <TaskProgressField
          value={20}
          onChange={jest.fn()}
          className="field-custom"
        />
      )
      expect(screen.getByTestId('task-progress-field')).toHaveClass(
        'field-custom'
      )
    })

    it('sets fill width from value', () => {
      const { container } = render(
        <TaskProgressField value={55} onChange={jest.fn()} />
      )
      const fill = container.querySelector('[style*="width: 55%"]')
      expect(fill).toBeInTheDocument()
    })
  })
})
