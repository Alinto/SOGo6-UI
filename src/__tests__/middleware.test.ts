// Set environment variable BEFORE any imports - this is critical!
// ADMIN_DOMAINS is calculated at module load time in middleware.ts
process.env.NEXT_PUBLIC_ADMIN_DOMAINS = 'admin.example.com'

// Mock i18n config FIRST - before middleware is imported
jest.mock('@/lib/i18n/config', () => ({
  getLocales: () => ['en', 'fr'],
  getDefaultLocale: () => 'en',
  routing: {
    locales: ['en', 'fr'],
    defaultLocale: 'en',
  },
}))

// Mock Next.js server modules before importing
jest.mock('next/server', () => {
  // Create a simple Request-like class for NextRequest
  class MockRequest {
    url: string
    _headersMap: Map<string, string>
    nextUrl: {
      pathname: string
      search: string
    }

    constructor(url: string, init?: { headers?: Record<string, string> }) {
      this.url = url
      this._headersMap = new Map()
      if (init?.headers) {
        Object.entries(init.headers).forEach(([key, value]) => {
          this._headersMap.set(key, value)
        })
      }
      const urlObj = new URL(url)
      this.nextUrl = {
        pathname: urlObj.pathname,
        search: urlObj.search,
      }
    }

    get headers() {
      return {
        get: (name: string) => this._headersMap.get(name) || null,
      }
    }
  }

  return {
    NextRequest: MockRequest,
    NextResponse: {
      redirect: (url: string | URL) => {
        const location = typeof url === 'string' ? url : url.toString()
        return {
          status: 307,
          headers: {
            get: (name: string) => {
              if (name === 'location') {
                return location
              }
              return null
            },
          },
        }
      },
    },
  }
})

jest.mock('next-intl/middleware', () => {
  return jest.fn(() => async () => {
    return {
      status: 200,
      headers: new Map(),
    }
  })
})

import { NextRequest, NextResponse } from 'next/server'
import handler from '../middleware'

describe('middleware', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_ADMIN_DOMAINS = 'admin.example.com'
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be a function', () => {
    expect(typeof handler).toBe('function')
  })

  it('should redirect to default locale when pathname has no locale', async () => {
    const url = 'http://localhost:3000/test'
    const req = new NextRequest(url, {
      headers: {
        host: 'localhost:3000',
      },
    })

    const response = await handler(req)

    expect(response.status).toBe(307)
    const location = response.headers.get('location')
    expect(location).toContain('/en/test')
  })

  it('should allow requests with locale prefix', async () => {
    const url = 'http://localhost:3000/en/test'
    const req = new NextRequest(url, {
      headers: {
        host: 'localhost:3000',
      },
    })

    const response = await handler(req)

    expect(response.status).toBe(200)
  })

  it('should handle admin domain requests', async () => {
    const url = 'http://admin.example.com/en/test'
    const req = new NextRequest(url, {
      headers: {
        host: 'admin.example.com',
      },
    })

    const response = await handler(req)

    expect(response).toBeDefined()
  })

  it('should redirect admin domain root to admin_panel', async () => {
    // Ensure admin domain is set
    process.env.NEXT_PUBLIC_ADMIN_DOMAINS = 'admin.example.com'
    
    // Isolate module loading to ensure ADMIN_DOMAINS is recalculated with the env var
    let testHandler: typeof handler
    jest.isolateModules(() => {
      testHandler = require('../middleware').default
    })
    
    // For admin domain with locale root (/en), should redirect to /en/admin_panel
    // The pathname '/en' should match LOCALE_ROOT_REGEX = ^/(en|fr)/?$
    const url = 'http://admin.example.com/en'
    const req = new NextRequest(url, {
      headers: {
        host: 'admin.example.com',
      },
    })

    const response = await testHandler!(req)

    // The middleware logic:
    // 1. pathname = '/en' matches LOCALE_REGEX, so no redirect to default locale
    // 2. pathname = '/en' is NOT an auth route, so continue
    // 3. isAdmin should be true (hostname 'admin.example.com' contains 'admin.example.com')
    // 4. isLocaleRoot should be true (pathname '/en' matches LOCALE_ROOT_REGEX)
    // 5. isAdminPanelRoute should be false (pathname '/en' doesn't match ADMIN_PATH_REGEX)
    // 6. So condition (isLocaleRoot || !isAdminPanelRoute) = (true || true) = true
    // 7. Should redirect to '/en/admin_panel' with status 307
    
    expect(response.status).toBe(307)
    const location = response.headers.get('location')
    expect(location).toBeTruthy()
    // The redirect URL should contain /en/admin_panel
    expect(location).toMatch(/\/en\/admin_panel/)
  })

  it('should allow auth routes on admin domain', async () => {
    const url = 'http://admin.example.com/en/auth/login'
    const req = new NextRequest(url, {
      headers: {
        host: 'admin.example.com',
      },
    })

    const response = await handler(req)

    expect(response.status).toBe(200)
  })
})
