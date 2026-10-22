import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { LoginSsoCallback } from '../login-sso-callback'

const mockTranslate = jest.fn((key: string) => key)
jest.mock('next-intl', () => ({
  useTranslations: () => mockTranslate,
}))

const mockPush = jest.fn()
jest.mock('@/lib/i18n/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

const mockDispatch = jest.fn()
jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}))

// header.payload.signature, payload = {"uid":"user","cn":"John Doe","email":"user@example.com"}
const TOKEN = `h.${btoa(
  JSON.stringify({ uid: 'user', cn: 'John Doe', email: 'user@example.com' })
)}.s`

const setHash = (hash: string) => {
  window.history.replaceState(null, '', `/en/auth/login/sso${hash}`)
}

describe('LoginSsoCallback', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('stores the token from the fragment and goes to the inbox', () => {
    setHash(`#token=${encodeURIComponent(TOKEN)}`)

    render(<LoginSsoCallback />)

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: {
          token: TOKEN,
          user: { uid: 'user', cn: 'John Doe', email: 'user@example.com' },
          rememberMe: false,
        },
      })
    )
    expect(mockPush).toHaveBeenCalledWith('/u/0/INBOX')
  })

  it('removes the token from the url', () => {
    setHash(`#token=${encodeURIComponent(TOKEN)}`)

    render(<LoginSsoCallback />)

    expect(window.location.hash).toBe('')
    expect(window.location.pathname).toBe('/en/auth/login/sso')
  })

  it('shows the error code sent by the API', () => {
    setHash('#error=S000212')

    render(<LoginSsoCallback />)

    expect(mockDispatch).not.toHaveBeenCalled()
    expect(mockTranslate).toHaveBeenCalledWith('error.sso_failed.string', {
      code: 'S000212',
    })
    expect(screen.getByText('sso_back_to_login.string')).toBeInTheDocument()
  })

  it('shows a generic error without token nor error', () => {
    setHash('')

    render(<LoginSsoCallback />)

    expect(mockDispatch).not.toHaveBeenCalled()
    expect(screen.getByText('error.generic.string')).toBeInTheDocument()
  })

  it('shows a generic error with an invalid token', () => {
    setHash('#token=not-a-jwt')

    render(<LoginSsoCallback />)

    expect(mockDispatch).not.toHaveBeenCalled()
    expect(screen.getByText('error.generic.string')).toBeInTheDocument()
  })
})
