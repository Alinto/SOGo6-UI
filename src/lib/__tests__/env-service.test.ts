import '@testing-library/jest-dom'
import { act, renderHook, waitFor } from '@testing-library/react'
import {
  clearEnvCache,
  fetchEnvVars,
  getApiHealthStatus,
  getCachedEnvVars,
  getEnvVar,
  isEnvLoaded,
  isUsingFakeApi,
  useEnvVars,
} from '@/lib/env-service'

const mockResponse = (body: Record<string, unknown>) =>
  ({
    json: jest.fn().mockResolvedValue(body),
  }) as unknown as Response

/** Health check only runs when NODE_ENV === 'development'; force test to avoid extra fetch + mock drain */
const PREV_NODE_ENV = process.env.NODE_ENV

describe('env-service', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    clearEnvCache()
    global.fetch = jest.fn()
    jest.clearAllMocks()
  })

  afterEach(() => {
    process.env.NODE_ENV = PREV_NODE_ENV
  })

  describe('clearEnvCache and getters', () => {
    it('starts with no cached env', () => {
      expect(getCachedEnvVars()).toBeNull()
      expect(isEnvLoaded()).toBe(false)
      expect(getEnvVar('REACT_APP_API_BASE_URL')).toBeUndefined()
      expect(isUsingFakeApi()).toBe(false)
      expect(getApiHealthStatus()).toBeNull()
    })

    it('clearEnvCache resets getters after a successful load', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce(
        mockResponse({ REACT_APP_API_BASE_URL: '/fakeApi' })
      )
      await fetchEnvVars()
      expect(isEnvLoaded()).toBe(true)
      expect(isUsingFakeApi()).toBe(true)

      clearEnvCache()
      expect(getCachedEnvVars()).toBeNull()
      expect(isEnvLoaded()).toBe(false)
      expect(getApiHealthStatus()).toBeNull()
    })
  })

  describe('fetchEnvVars', () => {
    it('fetches /env with AbortSignal and returns parsed JSON', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce(
        mockResponse({
          REACT_APP_API_BASE_URL: 'https://api.example.test',
          SSE_ENABLED: true,
        })
      )

      const vars = await fetchEnvVars()

      expect(global.fetch).toHaveBeenCalledTimes(1)
      expect(global.fetch).toHaveBeenCalledWith(
        '/env',
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      )
      expect(vars.REACT_APP_API_BASE_URL).toBe('https://api.example.test')
      expect(vars.SSE_ENABLED).toBe(true)
      expect(getCachedEnvVars()).toEqual(vars)
      expect(getEnvVar('REACT_APP_API_BASE_URL')).toBe('https://api.example.test')
    })

    it('returns cached env without calling fetch again', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce(
        mockResponse({ REACT_APP_API_BASE_URL: '/fakeApi' })
      )

      const first = await fetchEnvVars()
      const second = await fetchEnvVars()

      expect(first).toEqual(second)
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    it('shares one /env request when fetchEnvVars is called concurrently', async () => {
      let resolveFetch!: (value: Response) => void
      const pending = new Promise<Response>((resolve) => {
        resolveFetch = resolve
      })
      ;(global.fetch as jest.Mock).mockImplementation(() => pending)

      const a = fetchEnvVars()
      const b = fetchEnvVars()

      resolveFetch(mockResponse({ REACT_APP_API_BASE_URL: '/fakeApi' }))

      const [r1, r2] = await Promise.all([a, b])

      expect(r1).toEqual(r2)
      expect(global.fetch).toHaveBeenCalledTimes(1)
      expect(global.fetch).toHaveBeenCalledWith(
        '/env',
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      )
    })

    it('falls back to /fakeApi when fetch /env rejects', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('network'))

      const vars = await fetchEnvVars()

      expect(vars).toEqual({ REACT_APP_API_BASE_URL: '/fakeApi' })
      expect(isUsingFakeApi()).toBe(true)
      expect(getApiHealthStatus()).toBe(false)
    })

    it('falls back to /fakeApi when response.json throws', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        json: jest.fn().mockRejectedValue(new Error('invalid json')),
      })

      const vars = await fetchEnvVars()

      expect(vars).toEqual({ REACT_APP_API_BASE_URL: '/fakeApi' })
      expect(isUsingFakeApi()).toBe(true)
    })
  })

  describe('fetchEnvVars (production)', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production'
    })

    it('throws when REACT_APP_API_BASE_URL is missing from /env', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse({}))

      await expect(fetchEnvVars()).rejects.toThrow(
        'REACT_APP_API_BASE_URL is not configured'
      )
      expect(isEnvLoaded()).toBe(false)
    })

    it('throws when fetch /env rejects instead of falling back to /fakeApi', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('network'))

      await expect(fetchEnvVars()).rejects.toThrow('network')
      expect(isUsingFakeApi()).toBe(false)
    })
  })

  describe('fetchEnvVars health check (development)', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development'
    })

    it('uses real API when cross-origin health check returns 200 + S000000', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce(
          mockResponse({
            REACT_APP_API_BASE_URL: 'http://127.0.0.1:5000/api/user/v1',
          })
        )
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ error_code: 'S000000' }),
        } as unknown as Response)

      const vars = await fetchEnvVars()

      expect(vars.REACT_APP_API_BASE_URL).toBe(
        'http://127.0.0.1:5000/api/user/v1'
      )
      expect(getApiHealthStatus()).toBe(true)
      expect(global.fetch).toHaveBeenCalledTimes(2)
      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        'http://127.0.0.1:5000/api/user/v1/system',
        expect.objectContaining({ method: 'GET' })
      )
    })

    it('falls back to /fakeApi when cross-origin health check fails', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce(
          mockResponse({
            REACT_APP_API_BASE_URL: 'http://127.0.0.1:5000/api/user/v1',
          })
        )
        .mockRejectedValueOnce(new Error('Failed to fetch'))

      const vars = await fetchEnvVars()

      expect(vars.REACT_APP_API_BASE_URL).toBe('/fakeApi')
      expect(getApiHealthStatus()).toBe(false)
    })
  })

  describe('useEnvVars', () => {
    it('loads env on mount when cache is empty', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce(
        mockResponse({ REACT_APP_API_BASE_URL: '/fakeApi' })
      )

      const { result } = renderHook(() => useEnvVars())

      expect(result.current.loading).toBe(true)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.envVars?.REACT_APP_API_BASE_URL).toBe('/fakeApi')
      expect(result.current.error).toBeNull()
    })

    it('uses cache on mount when env is already loaded', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce(
        mockResponse({ REACT_APP_API_BASE_URL: '/fakeApi' })
      )
      await fetchEnvVars()

      const { result } = renderHook(() => useEnvVars())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.envVars?.REACT_APP_API_BASE_URL).toBe('/fakeApi')
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    it('refetch clears cache and fetches again', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockResponse({ REACT_APP_API_BASE_URL: '/a' }))
        .mockResolvedValueOnce(mockResponse({ REACT_APP_API_BASE_URL: '/b' }))

      const { result } = renderHook(() => useEnvVars())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
      expect(result.current.envVars?.REACT_APP_API_BASE_URL).toBe('/a')

      await act(async () => {
        await result.current.refetch()
      })

      expect(result.current.envVars?.REACT_APP_API_BASE_URL).toBe('/b')
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    it('refetch surfaces errors in production mode', async () => {
      process.env.NODE_ENV = 'production'
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce(
          mockResponse({ REACT_APP_API_BASE_URL: 'https://api.example.test' })
        )
        .mockRejectedValueOnce(new Error('network'))

      const { result } = renderHook(() => useEnvVars())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await expect(result.current.refetch()).rejects.toThrow()
      })

      expect(result.current.error).toBeTruthy()
    })
  })
})
