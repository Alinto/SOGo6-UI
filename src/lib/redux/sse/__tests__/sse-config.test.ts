jest.mock('@/lib/env-service', () => ({
  fetchEnvVars: jest.fn(),
  getCachedEnvVars: jest.fn(),
}))

const { fetchEnvVars, getCachedEnvVars } = jest.requireMock(
  '@/lib/env-service'
) as {
  fetchEnvVars: jest.Mock
  getCachedEnvVars: jest.Mock
}

import {
  buildSSEConfig,
  getDefaultSSEConfig,
  getDefaultSSEConfigSync,
  getProductionSSEConfig,
  getSSEConfigForEnvironment,
  getTestSSEConfig,
} from '../sse-config'

describe('sse-config', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getCachedEnvVars.mockReturnValue(undefined)
  })

  describe('buildSSEConfig', () => {
    it('builds SSE URL from API base with trailing slash stripped', () => {
      const config = buildSSEConfig('/fakeApi/')

      expect(config.url).toBe('/fakeApi/sse')
      expect(config.reconnectInterval).toBe(3000)
      expect(config.maxReconnectAttempts).toBe(5)
      expect(config.withCredentials).toBe(false)
    })

    it('enables credentials for absolute API base URLs', () => {
      const config = buildSSEConfig('https://api.example.com')

      expect(config.url).toBe('https://api.example.com/sse')
      expect(config.withCredentials).toBe(true)
    })
  })

  describe('getDefaultSSEConfigSync', () => {
    it('uses cached env base URL when available', () => {
      getCachedEnvVars.mockReturnValue({
        REACT_APP_API_BASE_URL: '/customApi',
      })

      const config = getDefaultSSEConfigSync()

      expect(config.url).toBe('/customApi/sse')
    })

    it('falls back to /fakeApi when cache is empty', () => {
      const config = getDefaultSSEConfigSync()

      expect(config.url).toBe('/fakeApi/sse')
    })
  })

  describe('getDefaultSSEConfig', () => {
    it('resolves config from fetched env vars', async () => {
      fetchEnvVars.mockResolvedValue({
        REACT_APP_API_BASE_URL: '/backend',
      })

      const config = await getDefaultSSEConfig()

      expect(config.url).toBe('/backend/sse')
    })

    it('falls back to sync config when env fetch fails', async () => {
      fetchEnvVars.mockRejectedValue(new Error('env unavailable'))

      const config = await getDefaultSSEConfig()

      expect(config.url).toBe('/fakeApi/sse')
    })
  })

  describe('getProductionSSEConfig', () => {
    it('uses same-origin API SSE endpoint with auth header', () => {
      localStorage.setItem('auth_token', 'token-123')

      const config = getProductionSSEConfig()

      expect(config.url).toBe(`${window.location.origin}/api/sse`)
      expect(config.headers?.Authorization).toBe('Bearer token-123')
      expect(config.reconnectInterval).toBe(5000)
    })
  })

  describe('getTestSSEConfig', () => {
    it('returns minimal reconnect settings for fakeApi', () => {
      const config = getTestSSEConfig()

      expect(config.url).toBe('/fakeApi/sse')
      expect(config.maxReconnectAttempts).toBe(1)
      expect(config.withCredentials).toBe(false)
    })
  })

  describe('getSSEConfigForEnvironment', () => {
    it('returns a config with SSE endpoint URL', async () => {
      const config = await getSSEConfigForEnvironment()

      expect(config.url).toMatch(/\/sse$/)
      expect(config.reconnectInterval).toBeGreaterThan(0)
    })
  })
})
