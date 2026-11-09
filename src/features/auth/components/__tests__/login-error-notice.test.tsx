import { render, screen } from '@testing-library/react'
import LoginErrorNotice from '../login-error-notice'

describe('LoginErrorNotice', () => {
  it('renders the message on a light high-contrast surface', () => {
    render(<LoginErrorNotice>Invalid credentials</LoginErrorNotice>)
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Invalid credentials')
    expect(alert).toHaveClass('bg-white', 'text-red-900', 'border-red-200')
  })
})
