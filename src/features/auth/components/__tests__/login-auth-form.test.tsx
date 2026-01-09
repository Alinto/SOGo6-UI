import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import { LoginAuthForm } from '../login-auth-form'

// Mock next-intl
const mockTranslate = jest.fn((key: string) => key)
jest.mock('next-intl', () => ({
  useTranslations: () => mockTranslate,
}))

// Mock navigation with searchParams
const mockPush = jest.fn()
const mockSearchParams = new URLSearchParams('email=test@example.com')

jest.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
}))

jest.mock('@/lib/i18n/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('LoginAuthForm - Step 2 (Password)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSearchParams.set('email', 'test@example.com')
  })

  it('renders email from searchParams as read-only', () => {
    render(<LoginAuthForm />)
    const emailDisplay = screen.getByText('test@example.com')
    expect(emailDisplay).toBeInTheDocument()
  })

  it('renders password input field', () => {
    render(<LoginAuthForm />)
    const passwordInput = screen.getByLabelText(/password.label.string/i)
    expect(passwordInput).toBeInTheDocument()
  })

  it('renders remember me checkbox', () => {
    render(<LoginAuthForm />)
    const rememberMeCheckbox = screen.getByRole('checkbox')
    expect(rememberMeCheckbox).toBeInTheDocument()
  })

  it('renders remember me label', () => {
    render(<LoginAuthForm />)
    const rememberMeLabel = screen.getByText(/remember_me.string/i)
    expect(rememberMeLabel).toBeInTheDocument()
  })

  it('renders submit button', () => {
    render(<LoginAuthForm />)
    const submitButton = screen.getByRole('button', { name: /login.string/i })
    expect(submitButton).toBeInTheDocument()
    expect(submitButton).toHaveAttribute('type', 'submit')
  })

  it('renders without crashing', () => {
    const { container } = render(<LoginAuthForm />)
    expect(container).toBeTruthy()
  })

  it('redirects to login page if no email in searchParams', async () => {
    mockSearchParams.delete('email')

    render(<LoginAuthForm />)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth/login')
    })
  })

  it('renders email label', () => {
    render(<LoginAuthForm />)
    const emailLabel = screen.getByText(/email.label.string/i)
    expect(emailLabel).toBeInTheDocument()
  })

  it('password input has correct attributes', () => {
    render(<LoginAuthForm />)
    const passwordInput = screen.getByLabelText(/password.label.string/i)
    expect(passwordInput).toHaveAttribute('autoComplete', 'current-password')
    // autoFocus is handled by React, not visible as HTML attribute
    // expect(passwordInput).toHaveAttribute('autoFocus')
  })
})
