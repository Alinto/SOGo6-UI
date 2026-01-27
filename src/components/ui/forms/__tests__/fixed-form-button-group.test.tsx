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
})
