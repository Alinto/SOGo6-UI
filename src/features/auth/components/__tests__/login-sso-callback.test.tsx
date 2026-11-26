import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
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
let mockAuthenticated = false
jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppStore: () => ({
    getState: () => ({ auth: { token: mockAuthenticated ? 'old' : null } }),
  }),
}))

const mockWaitForLogoutWipe = jest.fn(() => Promise.resolve())
jest.mock('@/features/offline/auth/logout-wipe', () => ({
  waitForLogoutWipe: () => mockWaitForLogoutWipe(),
}))

const mockClearApiCache = jest.fn()
jest.mock('@/lib/redux/listeners/reset-cache-on-logout', () => ({
  clearAuthenticatedApiCache: (dispatch: unknown) =>
    mockClearApiCache(dispatch),
}))

// header.payload.signature, payload = {"uid":"user","cn":"John Doe","email":"user@example.com"}
const TOKEN = `h.${btoa(
  JSON.stringify({ uid: 'user', cn: 'John Doe', email: 'user@example.com' })
)}.s`
const NONCE = 'abc123'
const NONCE_STORAGE_KEY = 'sogo.sso_nonce'

const setUrl = (hash: string, nonce: string | null = NONCE) => {
  const query = nonce === null ? '' : `?nonce=${nonce}`
  window.history.replaceState(null, '', `/en/auth/login/sso${query}${hash}`)
}

const credentialsAction = (token: string, user: object) =>
  expect.objectContaining({
    type: 'auth/setCredentials',
    payload: { token, user, rememberMe: false },
  })

describe('LoginSsoCallback', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAuthenticated = false
    sessionStorage.setItem(NONCE_STORAGE_KEY, NONCE)
  })

  afterEach(() => {
    sessionStorage.clear()
  })

  it('stores the token from the fragment and goes to the inbox', async () => {
    setUrl(`#token=${encodeURIComponent(TOKEN)}`)

    render(<LoginSsoCallback />)

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/u/0/INBOX'))
    expect(mockDispatch).toHaveBeenCalledWith(
      credentialsAction(TOKEN, {
        uid: 'user',
        cn: 'John Doe',
        email: 'user@example.com',
      })
    )
  })

  it('waits for the logout wipe and clears the API cache before storing the token', async () => {
    const order: string[] = []
    mockWaitForLogoutWipe.mockImplementationOnce(() => {
      order.push('wipe')
      return Promise.resolve()
    })
    mockClearApiCache.mockImplementationOnce(() => order.push('clear'))
    mockDispatch.mockImplementation((action: { type: string }) => {
      order.push(action.type)
    })
    setUrl(`#token=${encodeURIComponent(TOKEN)}`)

    render(<LoginSsoCallback />)

    await waitFor(() => expect(mockPush).toHaveBeenCalled())
    expect(order).toEqual(['wipe', 'clear', 'auth/setCredentials'])
    mockDispatch.mockReset()
  })

  it('ends the session of an account already signed in', async () => {
    mockAuthenticated = true
    setUrl(`#token=${encodeURIComponent(TOKEN)}`)

    render(<LoginSsoCallback />)

    await waitFor(() => expect(mockPush).toHaveBeenCalled())
    expect(mockDispatch).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ type: 'auth/logout' })
    )
  })

  it('removes the token and the nonce from the url', () => {
    setUrl(`#token=${encodeURIComponent(TOKEN)}`)

    render(<LoginSsoCallback />)

    expect(window.location.hash).toBe('')
    expect(window.location.search).toBe('')
    expect(window.location.pathname).toBe('/en/auth/login/sso')
    expect(sessionStorage.getItem(NONCE_STORAGE_KEY)).toBeNull()
  })

  it('refuses a token without the nonce of this tab', () => {
    setUrl(`#token=${encodeURIComponent(TOKEN)}`, 'other')

    render(<LoginSsoCallback />)

    expect(mockDispatch).not.toHaveBeenCalled()
    expect(
      screen.getByText('error.sso_state_invalid.string')
    ).toBeInTheDocument()
  })

  it('refuses a token when no SSO login was started in this tab', () => {
    sessionStorage.clear()
    setUrl(`#token=${encodeURIComponent(TOKEN)}`)

    render(<LoginSsoCallback />)

    expect(mockDispatch).not.toHaveBeenCalled()
    expect(
      screen.getByText('error.sso_state_invalid.string')
    ).toBeInTheDocument()
  })

  it('shows the loader while the token is stored', () => {
    setUrl(`#token=${encodeURIComponent(TOKEN)}`)

    const { container } = render(<LoginSsoCallback />)

    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('shows a mapped error instead of the loader', () => {
    setUrl('#error=S000212')

    const { container } = render(<LoginSsoCallback />)

    expect(mockDispatch).not.toHaveBeenCalled()
    expect(mockTranslate).toHaveBeenCalledWith(
      'error.sso_user_not_found.string'
    )
    expect(container.querySelector('.animate-spin')).not.toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent(
      'error.sso_user_not_found.string'
    )
    expect(screen.getByText('sso_back_to_login.string')).toBeInTheDocument()
  })

  it('maps the unverified email error', () => {
    setUrl('#error=S000217')

    render(<LoginSsoCallback />)

    expect(
      screen.getByText('error.sso_email_not_verified.string')
    ).toBeInTheDocument()
  })

  it('keeps the code for an unknown SSO error', () => {
    setUrl('#error=S000299')

    render(<LoginSsoCallback />)

    expect(mockTranslate).toHaveBeenCalledWith('error.sso_failed.string', {
      code: 'S000299',
    })
  })

  it('shows a generic error without token nor error', () => {
    setUrl('')

    render(<LoginSsoCallback />)

    expect(mockDispatch).not.toHaveBeenCalled()
    expect(screen.getByText('error.generic.string')).toBeInTheDocument()
  })

  it('shows a generic error with an invalid token', () => {
    setUrl('#token=not-a-jwt')

    render(<LoginSsoCallback />)

    expect(mockDispatch).not.toHaveBeenCalled()
    expect(screen.getByText('error.generic.string')).toBeInTheDocument()
  })

  it('stores an unpadded token and clears the fragment', async () => {
    const payload = { uid: 'user', cn: 'John Do', email: 'user@example.com' }
    const bytes = new TextEncoder().encode(JSON.stringify(payload))
    let binary = ''
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte)
    })
    const segment = btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
    const token = `h.${segment}.s`
    expect(segment.length % 4).not.toBe(0)
    setUrl(`#token=${encodeURIComponent(token)}`)

    render(<LoginSsoCallback />)

    await waitFor(() =>
      expect(mockDispatch).toHaveBeenCalledWith(
        credentialsAction(token, payload)
      )
    )
    expect(window.location.hash).toBe('')
  })
})
