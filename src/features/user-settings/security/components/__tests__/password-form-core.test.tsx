import { render, screen } from '@testing-library/react'
import PasswordForm from '../password-form-core'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

describe('PasswordForm', () => {
  it('renders password change fields and save action', () => {
    render(<PasswordForm />)

    expect(screen.getByText('title.string')).toBeInTheDocument()
    expect(screen.getByText('description.string')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('current.string')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('new.string')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('confirm.string')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'save.default.string' })
    ).toBeInTheDocument()
  })
})
