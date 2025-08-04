import '@testing-library/jest-dom'
import { fireEvent, render } from '@testing-library/react'
import { Checkbox } from '../checkbox'

// filepath: /SOGo/src/components/ui/checkbox.test.tsx

describe('Checkbox component', () => {
  it('matches the snapshot', () => {
    const { asFragment } = render(<Checkbox />)
    expect(asFragment()).toMatchSnapshot()
  })
  it('renders Checkbox component', () => {
    const { container } = render(<Checkbox />)
    expect(container.firstChild).toHaveClass(
      'peer h-5 w-5 shrink-0 rounded-sm border border-primary shadow-sm focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
    )
  })

  it('applies custom className to Checkbox component', () => {
    const { container } = render(<Checkbox className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('renders Check icon inside Checkbox component when checked', () => {
    const { container } = render(<Checkbox checked />)
    expect(container.querySelector('svg')).toHaveClass('h-5 w-5')
  })

  it('toggles Checkbox state on click', () => {
    const { getByRole } = render(<Checkbox />)
    const checkbox = getByRole('checkbox')
    expect(checkbox).not.toBeChecked()
    fireEvent.click(checkbox)
    expect(checkbox).toBeChecked()
  })

  it('renders Checkbox component with disabled state', () => {
    const { getByRole } = render(<Checkbox disabled />)
    const checkbox = getByRole('checkbox')
    expect(checkbox).toBeDisabled()
  })

  it('renders Checkbox component with custom props', () => {
    const { getByRole } = render(<Checkbox data-testid="checkbox" />)
    const checkbox = getByRole('checkbox')
    expect(checkbox).toHaveAttribute('data-testid', 'checkbox')
  })
})
