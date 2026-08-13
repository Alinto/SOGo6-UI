var mockIntlMiddleware: jest.Mock

jest.mock('next-intl/middleware', () => {
  mockIntlMiddleware = jest.fn()
  return {
    __esModule: true,
    default: () => mockIntlMiddleware,
  }
})

jest.mock('next/server', () => {
  class MockNextRequest {
    url: string
    headers: { get: (name: string) => string | null }
    nextUrl: { pathname: string; search: string }

    constructor(url: string, init?: { headers?: Record<string, string> }) {
      const parsed = new URL(url)
      this.url = url
      this.nextUrl = {
        pathname: parsed.pathname,
        search: parsed.search,
      }
      const headerMap = new Map(
        Object.entries(init?.headers ?? {}).map(([key, value]) => [
          key.toLowerCase(),
          value,
        ])
      )
      this.headers = {
        get: (name: string) => headerMap.get(name.toLowerCase()) ?? null,
      }
    }
  }

  return {
    NextRequest: MockNextRequest,
    NextResponse: {
      redirect: (url: URL | string, status = 307) => {
        const location = typeof url === 'string' ? url : url.toString()
        return {
          status,
          headers: {
            get: (name: string) =>
              name.toLowerCase() === 'location' ? location : null,
          },
        }
      },
      next: () => ({
        status: 200,
        headers: { get: () => null },
      }),
    },
  }
})

import type { NextRequest } from 'next/server'
import proxy, {
  generateLocaleRegex,
  hostnameMatchesAdminDomain,
  isAdminDomain,
  isAdminPanelPath,
  isAuthPath,
  isLocaleRootPath,
  isPwaAssetPath,
  normalizeHostname,
} from '../proxy'

function createRequest(pathname: string, host = 'mail.example.com') {
  return new (jest.requireMock('next/server').NextRequest)(
    `http://${host}${pathname}`,
    { headers: { host } }
  ) as NextRequest
}

describe('proxy helpers', () => {
  const originalAdminDomains = process.env.NEXT_PUBLIC_ADMIN_DOMAINS

  afterAll(() => {
    process.env.NEXT_PUBLIC_ADMIN_DOMAINS = originalAdminDomains
  })

  describe('generateLocaleRegex', () => {
    it('matches locale-prefixed paths', () => {
      const regex = generateLocaleRegex(['en', 'fr'])
      expect(regex.test('/en/mails')).toBe(true)
      expect(regex.test('/fr')).toBe(true)
      expect(regex.test('/mails')).toBe(false)
    })
  })

  describe('isAdminDomain', () => {
    it('returns true when host matches configured admin domains', () => {
      process.env.NEXT_PUBLIC_ADMIN_DOMAINS =
        'admin.example.com,ops.example.com'
      expect(isAdminDomain('admin.example.com')).toBe(true)
      expect(isAdminDomain('mail.example.com')).toBe(false)
    })

    it('does not match admin domains as substrings', () => {
      process.env.NEXT_PUBLIC_ADMIN_DOMAINS = 'admin.example.com'
      expect(isAdminDomain('evil-admin.example.com')).toBe(false)
      expect(isAdminDomain('notadmin.example.com.evil.tld')).toBe(false)
    })

    it('ignores port when comparing hostnames', () => {
      process.env.NEXT_PUBLIC_ADMIN_DOMAINS = 'admin.example.com'
      expect(
        hostnameMatchesAdminDomain(
          'admin.example.com:3000',
          'admin.example.com'
        )
      ).toBe(true)
      expect(normalizeHostname('Admin.Example.COM:443')).toBe(
        'admin.example.com'
      )
    })
  })

  describe('isAdminPanelPath', () => {
    it('matches admin panel routes for supported locales', () => {
      expect(isAdminPanelPath('/en/admin_panel')).toBe(true)
      expect(isAdminPanelPath('/fr/admin_panel/users')).toBe(true)
      expect(isAdminPanelPath('/en/mails')).toBe(false)
    })
  })

  describe('isLocaleRootPath', () => {
    it('matches locale root paths only', () => {
      expect(isLocaleRootPath('/en')).toBe(true)
      expect(isLocaleRootPath('/fr/')).toBe(true)
      expect(isLocaleRootPath('/en/mails')).toBe(false)
    })
  })

  describe('isAuthPath', () => {
    it('matches auth routes for supported locales', () => {
      expect(isAuthPath('/en/auth/login')).toBe(true)
      expect(isAuthPath('/de/auth')).toBe(true)
      expect(isAuthPath('/en/mails')).toBe(false)
    })
  })

  describe('isPwaAssetPath', () => {
    it('matches manifest, serwist and offline fallback paths', () => {
      expect(isPwaAssetPath('/manifest.webmanifest')).toBe(true)
      expect(isPwaAssetPath('/serwist/sw.js')).toBe(true)
      expect(isPwaAssetPath('/~offline')).toBe(true)
      expect(isPwaAssetPath('/en/u/0/INBOX')).toBe(false)
    })
  })
})

describe('proxy handler', () => {
  const originalAdminDomains = process.env.NEXT_PUBLIC_ADMIN_DOMAINS

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NEXT_PUBLIC_ADMIN_DOMAINS = 'admin.example.com'
    mockIntlMiddleware.mockResolvedValue(
      jest.requireMock('next/server').NextResponse.next()
    )
  })

  afterAll(() => {
    process.env.NEXT_PUBLIC_ADMIN_DOMAINS = originalAdminDomains
    jest.restoreAllMocks()
  })

  it('redirects paths without a locale prefix to the default locale', async () => {
    const response = await proxy(createRequest('/mails'))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe(
      'http://mail.example.com/en/mails'
    )
  })

  it('does not locale-prefix the web app manifest', async () => {
    const response = await proxy(createRequest('/manifest.webmanifest'))

    expect(response.status).not.toBe(307)
    expect(response.headers.get('location')).toBeNull()
    expect(mockIntlMiddleware).not.toHaveBeenCalled()
  })

  it('does not locale-prefix serwist service worker paths', async () => {
    const response = await proxy(createRequest('/serwist/sw.js'))

    expect(response.status).not.toBe(307)
    expect(response.headers.get('location')).toBeNull()
    expect(mockIntlMiddleware).not.toHaveBeenCalled()
  })

  it('preserves query params when redirecting to default locale', async () => {
    const response = await proxy(createRequest('/mails?folder=inbox'))

    expect(response.headers.get('location')).toBe(
      'http://mail.example.com/en/mails?folder=inbox'
    )
  })

  it('delegates auth routes to next-intl middleware', async () => {
    const intlResponse = jest.requireMock('next/server').NextResponse.next()
    mockIntlMiddleware.mockResolvedValue(intlResponse)

    const response = await proxy(createRequest('/en/auth/login'))

    expect(mockIntlMiddleware).toHaveBeenCalledTimes(1)
    expect(response).toBe(intlResponse)
  })

  it('redirects admin domain locale root to admin panel', async () => {
    const response = await proxy(createRequest('/en', 'admin.example.com'))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe(
      'http://admin.example.com/en/admin_panel'
    )
    expect(mockIntlMiddleware).not.toHaveBeenCalled()
  })

  it('redirects non-admin routes on admin domain to admin panel', async () => {
    const response = await proxy(
      createRequest('/en/mails', 'admin.example.com')
    )

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe(
      'http://admin.example.com/en/admin_panel'
    )
  })

  it('blocks admin panel on user domain outside development', async () => {
    jest.replaceProperty(process, 'env', {
      ...process.env,
      NODE_ENV: 'production',
    })

    const response = await proxy(createRequest('/en/admin_panel'))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://mail.example.com/en')
    expect(mockIntlMiddleware).not.toHaveBeenCalled()
  })

  it('allows admin panel on user domain in development', async () => {
    jest.replaceProperty(process, 'env', {
      ...process.env,
      NODE_ENV: 'development',
    })
    const intlResponse = jest.requireMock('next/server').NextResponse.next()
    mockIntlMiddleware.mockResolvedValue(intlResponse)

    const response = await proxy(createRequest('/en/admin_panel'))

    expect(mockIntlMiddleware).toHaveBeenCalledTimes(1)
    expect(response).toBe(intlResponse)
  })

  it('delegates regular user routes to next-intl middleware', async () => {
    jest.replaceProperty(process, 'env', {
      ...process.env,
      NODE_ENV: 'production',
    })
    const intlResponse = jest.requireMock('next/server').NextResponse.next()
    mockIntlMiddleware.mockResolvedValue(intlResponse)

    const response = await proxy(createRequest('/en/mails'))

    expect(mockIntlMiddleware).toHaveBeenCalledTimes(1)
    expect(response).toBe(intlResponse)
  })
})
