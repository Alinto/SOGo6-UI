import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FixedFormButtonGroup from '../fixed-form-button-group'

describe('FixedFormButtonGroup', () => {
  const mockReset = jest.fn()

  beforeEach(() => {
    mockReset.mockClear()
  })

  it('renders reset and submit buttons', () => {
    render(
      <FixedFormButtonGroup
        onReset={mockReset}
        disableReset={false}
        disableSubmit={false}
      />
    )

    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })

  it('calls onReset when reset button is clicked', async () => {
    const user = userEvent.setup()

    render(
      <FixedFormButtonGroup
        onReset={mockReset}
        disableReset={false}
        disableSubmit={false}
      />
    )

    const resetButton = screen.getByRole('button', { name: /reset/i })
    await user.click(resetButton)

    expect(mockReset).toHaveBeenCalledTimes(1)
  })

  it('disables buttons when disabled props are true', () => {
    render(
      <FixedFormButtonGroup
        onReset={mockReset}
        disableReset={true}
        disableSubmit={true}
      />
    )

    expect(screen.getByRole('button', { name: /reset/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
  })

  it('shows loading spinner when isLoading is true', () => {
    render(
      <FixedFormButtonGroup
        onReset={mockReset}
        disableReset={false}
        disableSubmit={false}
        isLoading={true}
      />
    )

    const submitButton = screen.getByRole('button', { name: /save/i })
    expect(submitButton).toHaveAttribute('aria-busy', 'true')
  })

  it('renders in inline mode with labels', () => {
    render(
      <FixedFormButtonGroup
        onReset={mockReset}
        disableReset={false}
        disableSubmit={false}
        mode="inline"
        resetLabel="Cancel"
        submitLabel="Confirm"
      />
    )

    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Confirm')).toBeInTheDocument()
  })

  it('renders floating labelled buttons without round style when showLabels is true', () => {
    render(
      <FixedFormButtonGroup
        onReset={mockReset}
        disableReset={false}
        disableSubmit={false}
        showLabels
        resetLabel="Reset"
        submitLabel="Save"
      />
    )

    const resetButton = screen.getByRole('button', { name: 'Reset' })
    const submitButton = screen.getByRole('button', { name: 'Save' })
    expect(screen.getByText('Reset')).toBeVisible()
    expect(screen.getByText('Save')).toBeVisible()
    expect(resetButton).not.toHaveClass('rounded-full')
    expect(submitButton).not.toHaveClass('rounded-full')
    // Same size as the other form buttons (default Button size)
    expect(resetButton).toHaveClass('h-9', 'px-4')
    expect(submitButton).toHaveClass('h-9', 'px-4')
    expect(resetButton.querySelector('svg')).toBeNull()
    expect(submitButton.querySelector('svg')).toBeNull()
    expect(resetButton.parentElement).toHaveClass('fixed')
  })

  it('shows a spinner next to the label while loading when showLabels is true', () => {
    render(
      <FixedFormButtonGroup
        onReset={mockReset}
        disableReset={false}
        disableSubmit={false}
        isLoading
        showLabels
        resetLabel="Reset"
        submitLabel="Save"
      />
    )

    const submitButton = screen.getByRole('button', { name: 'Save' })
    expect(screen.getByText('Save')).toBeVisible()
    expect(submitButton).toBeDisabled()
    expect(submitButton).toHaveAttribute('aria-busy', 'true')
    expect(submitButton.querySelector('svg.animate-spin')).not.toBeNull()
    expect(screen.getByRole('button', { name: 'Reset' })).toBeDisabled()
  })
})
