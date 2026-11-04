import { redirectToExternalLogin } from '@/features/auth/utils'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '../login-form'

jest.mock('@/features/auth/utils', () => {
  const actual = jest.requireActual<typeof import('@/features/auth/utils')>(
    '@/features/auth/utils'
  )
  return {
    ...actual,
    redirectToExternalLogin: jest.fn(),
  }
})

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}))

jest.mock('@/lib/i18n/config', () => ({
  getLocales: () => ['en', 'fr', 'de', 'es'],
}))

const mockPush = jest.fn()
const mockPathname = '/en/auth/login'

jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}))

jest.mock('@/lib/i18n/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockPathname,
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

const mockGetAuthMode = jest.fn()

jest.mock('@/features/auth/components/store/auth.api', () => ({
  useGetSystemQuery: () => ({
    data: { data: { system: { SOGO_S_DIRECT_LOGIN: false } } },
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  }),
  useLazyGetAuthModeQuery: () => [mockGetAuthMode],
}))

describe('LoginForm - Step 1 (Email + Language)', () => {
  const originalOnLine = navigator.onLine

  beforeEach(() => {
    jest.clearAllMocks()
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true,
    })
  })

  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: originalOnLine,
    })
  })

  it('renders email input field', () => {
    render(<LoginForm />)
    const emailInput = screen.getByLabelText(/email.label.string/i)
    expect(emailInput).toBeInTheDocument()
    expect(emailInput).toHaveAttribute('type', 'email')
  })

  it('renders language selector', () => {
    render(<LoginForm />)
    const languageLabel = screen.getByText(/language.label.string/i)
    expect(languageLabel).toBeInTheDocument()
  })

  it('renders submit button with correct text', () => {
    render(<LoginForm />)
    const submitButton = screen.getByRole('button', { name: /next.string/i })
    expect(submitButton).toBeInTheDocument()
    expect(submitButton).toHaveAttribute('type', 'submit')
  })

  it('does not render password field', () => {
    render(<LoginForm />)
    const passwordInputs = screen.queryAllByLabelText(/password/i)
    expect(passwordInputs).toHaveLength(0)
  })

  it('does not render remember me checkbox', () => {
    render(<LoginForm />)
    const checkbox = screen.queryByRole('checkbox')
    expect(checkbox).not.toBeInTheDocument()
  })

  it('renders without crashing', () => {
    const { container } = render(<LoginForm />)
    expect(container).toBeTruthy()
  })

  it('renders email placeholder', () => {
    render(<LoginForm />)
    const emailInput = screen.getByPlaceholderText(/email.placeholder.string/i)
    expect(emailInput).toBeInTheDocument()
  })

  it('renders language selector with all locales', () => {
    render(<LoginForm />)
    const languageLabel = screen.getByText(/language.label.string/i)
    expect(languageLabel).toBeInTheDocument()
  })

  it('shows an offline banner and disables submit while offline', () => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: false,
    })
    render(<LoginForm />)
    expect(screen.getByTestId('login-offline-banner')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next.string/i })).toBeDisabled()
  })
})

describe('LoginForm auth mode', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true,
    })
  })

  async function submit(email = 'user@example.com') {
    const user = userEvent.setup()
    render(<LoginForm />)
    await user.type(screen.getByLabelText(/email.label.string/i), email)
    await user.click(screen.getByRole('button', { name: /next.string/i }))
  }

  it('assigns an absolute openid location', async () => {
    mockGetAuthMode.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          data: { kind: 'openid', location: 'https://idp.example/auth' },
        }),
    })

    await submit()

    expect(redirectToExternalLogin).toHaveBeenCalledWith(
      'https://idp.example/auth'
    )
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('stays on the form when the openid location is missing or relative', async () => {
    mockGetAuthMode.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          data: { kind: 'openid', location: '/relative' },
        }),
    })

    await submit()

    expect(redirectToExternalLogin).not.toHaveBeenCalled()
    expect(
      screen.getByText('error.unknown_provider.string')
    ).toBeInTheDocument()
  })

  it('goes to the password step for a plain login', async () => {
    mockGetAuthMode.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          data: { kind: 'plain', location: '' },
        }),
    })

    await submit('ada@example.com')

    expect(mockPush).toHaveBeenCalledWith(
      '/auth/login/pwd?email=ada%40example.com'
    )
    expect(redirectToExternalLogin).not.toHaveBeenCalled()
  })

  it('shows an unknown provider when cas has no location', async () => {
    mockGetAuthMode.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          data: { kind: 'cas', location: '' },
        }),
    })

    await submit()

    expect(redirectToExternalLogin).not.toHaveBeenCalled()
    expect(
      screen.getByText('error.unknown_provider.string')
    ).toBeInTheDocument()
  })

  it('shows the translated redirect error', async () => {
    mockGetAuthMode.mockReturnValue({
      unwrap: () =>
        Promise.reject({
          status: 400,
          data: {
            error_code: 'S000215',
            error_msg: 'SSO Redirect Url Not Allowed',
          },
        }),
    })

    await submit()

    expect(
      screen.getByText('error.sso_redirect_not_allowed.string')
    ).toBeInTheDocument()
    expect(
      screen.queryByText('SSO Redirect Url Not Allowed')
    ).not.toBeInTheDocument()
  })
})
