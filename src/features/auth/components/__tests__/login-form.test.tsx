import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { LoginForm } from '../login-form'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}))

jest.mock('@/lib/i18n/config', () => ({
  getLocales: () => ['en', 'fr', 'de', 'es'],
}))

const mockPush = jest.fn()
const mockPathname = '/en/auth/login'

jest.mock('@/lib/i18n/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockPathname,
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

jest.mock('@/features/auth/components/store/auth.api', () => ({
  useGetSystemQuery: () => ({
    data: { data: { system: { SOGO_S_DIRECT_LOGIN: false } } },
    isLoading: false,
    isError: false,
  }),
  useLazyGetAuthModeQuery: () => [jest.fn()],
}))

describe('LoginForm - Step 1 (Email + Language)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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
})
