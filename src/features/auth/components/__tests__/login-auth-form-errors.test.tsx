import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginAuthForm } from '../login-auth-form'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams('email=user@example.com'),
}))

const mockPush = jest.fn()
jest.mock('@/lib/i18n/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

const mockDispatch = jest.fn()
jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}))

jest.mock('@/lib/env-service', () => ({
  useEnvVars: () => ({ envVars: {} }),
}))

jest.mock('@/features/user-settings/store/user-preferences-api', () => ({
  useLazyGetUserPreferencesQuery: () => [jest.fn()],
}))

const mockLogin = jest.fn()
jest.mock('@/features/auth/components/store/auth.api', () => ({
  useLoginMutation: () => [mockLogin],
}))

describe('LoginAuthForm - server errors', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true,
    })
  })

  async function submit() {
    const user = userEvent.setup()
    render(<LoginAuthForm />)
    await user.type(screen.getByLabelText(/password.label.string/i), 'secret')
    await user.click(screen.getByRole('button', { name: /login.string/i }))
  }

  it('asks to use single sign-on when the domain refuses passwords', async () => {
    mockLogin.mockReturnValue({
      unwrap: () =>
        Promise.reject({
          status: 403,
          data: {
            data: null,
            error_code: 'S000216',
            error_msg: 'Login With Password Not Allowed',
          },
        }),
    })

    await submit()

    expect(
      await screen.findByText('error.sso_required.string')
    ).toBeInTheDocument()
    expect(mockDispatch).not.toHaveBeenCalled()
    expect(mockPush).not.toHaveBeenCalledWith('/u/0/INBOX')
  })

  it('still shows invalid credentials on a 401', async () => {
    mockLogin.mockReturnValue({
      unwrap: () =>
        Promise.reject({
          status: 401,
          data: { data: null, error_code: 'S000208', error_msg: 'failed' },
        }),
    })

    await submit()

    expect(
      await screen.findByText('error.invalid_credentials.string')
    ).toBeInTheDocument()
  })
})
