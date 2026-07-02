import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SettingsFormActionBar from '../settings-form-action-bar'

describe('SettingsFormActionBar', () => {
  const defaultProps = {
    onReset: jest.fn(),
    disableReset: false,
    disableSubmit: false,
    resetLabel: 'Reset',
    submitLabel: 'Save',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders reset and submit buttons with labels', () => {
    render(<SettingsFormActionBar {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('returns null when not visible', () => {
    const { container } = render(
      <SettingsFormActionBar {...defaultProps} visible={false} />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('calls onReset when reset is clicked', async () => {
    const user = userEvent.setup()
    const onReset = jest.fn()
    render(<SettingsFormActionBar {...defaultProps} onReset={onReset} />)
    await user.click(screen.getByRole('button', { name: 'Reset' }))
    expect(onReset).toHaveBeenCalledTimes(1)
  })

  it('disables buttons when disableReset or disableSubmit is true', () => {
    render(
      <SettingsFormActionBar
        {...defaultProps}
        disableReset
        disableSubmit
      />
    )
    expect(screen.getByRole('button', { name: 'Reset' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it('disables both buttons and sets aria-busy when loading', () => {
    render(<SettingsFormActionBar {...defaultProps} isLoading />)
    const submit = screen.getByRole('button', { name: 'Save' })
    expect(screen.getByRole('button', { name: 'Reset' })).toBeDisabled()
    expect(submit).toBeDisabled()
    expect(submit).toHaveAttribute('aria-busy', 'true')
  })

  it('renders optional hint text', () => {
    render(
      <SettingsFormActionBar {...defaultProps} hint="Unsaved changes" />
    )
    expect(screen.getByText('Unsaved changes')).toBeInTheDocument()
  })
})
