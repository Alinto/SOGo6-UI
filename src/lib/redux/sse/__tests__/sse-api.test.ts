const mockFetchEnvVars = jest.fn()
const mockConnect = jest.fn()
const mockDisconnect = jest.fn()
const mockGetStats = jest.fn()

jest.mock('@/lib/env-service', () => ({
  fetchEnvVars: (...args: unknown[]) => mockFetchEnvVars(...args),
}))

jest.mock('../sse-service', () => ({
  SSEService: jest.fn().mockImplementation(() => ({
    connect: mockConnect,
    disconnect: mockDisconnect,
    getStats: mockGetStats,
  })),
}))

import { configureStore } from '@reduxjs/toolkit'
import { SSEConnectionState } from '../types'

async function createStore(options?: { sseEnabled?: boolean }) {
  jest.resetModules()
  mockFetchEnvVars.mockResolvedValue({
    SSE_ENABLED: options?.sseEnabled ?? true,
  })
  mockConnect.mockResolvedValue(undefined)
  mockGetStats.mockReturnValue({
    state: SSEConnectionState.CONNECTED,
    messageCount: 3,
    reconnectAttempts: 1,
    lastMessageTime: 123456,
  })

  const { sseApi } = await import('../sse-api')
  const store = configureStore({
    reducer: { [sseApi.reducerPath]: sseApi.reducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(sseApi.middleware),
  })

  return { store, sseApi }
}

describe('sse-api', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getSSEStatus endpoint', () => {
    it('returns disconnected status when service is not initialized', async () => {
      const { store, sseApi } = await createStore()
      const result = await store.dispatch(
        sseApi.endpoints.getSSEStatus.initiate()
      )

      expect(result.data).toEqual({
        state: SSEConnectionState.DISCONNECTED,
        messageCount: 0,
        reconnectAttempts: 0,
        lastMessageTime: null,
      })
    })
  })

  describe('connectSSE mutation', () => {
    it('returns disabled when SSE_ENABLED is false', async () => {
      const { store, sseApi } = await createStore({ sseEnabled: false })

      const result = await store.dispatch(
        sseApi.endpoints.connectSSE.initiate(undefined)
      )

      expect(result.data).toEqual({ connected: false, disabled: true })
      expect(mockConnect).not.toHaveBeenCalled()
    })

    it('connects with provided config', async () => {
      const { store, sseApi } = await createStore()
      const config = { url: '/fakeApi/sse' }

      const result = await store.dispatch(
        sseApi.endpoints.connectSSE.initiate(config)
      )

      expect(result.data).toEqual({ connected: true })
      expect(mockConnect).toHaveBeenCalled()
    })
  })

  describe('disconnectSSE mutation', () => {
    it('disconnects active service instance', async () => {
      const { store, sseApi } = await createStore()
      const config = { url: '/fakeApi/sse' }

      await store.dispatch(sseApi.endpoints.connectSSE.initiate(config))
      const result = await store.dispatch(
        sseApi.endpoints.disconnectSSE.initiate()
      )

      expect(result.data).toEqual({ disconnected: true })
      expect(mockDisconnect).toHaveBeenCalled()
    })
  })

  describe('initSSEApi', () => {
    it('returns null when SSE is disabled', async () => {
      mockFetchEnvVars.mockResolvedValue({ SSE_ENABLED: false })
      const { initSSEApi } = await import('../sse-api')
      const service = await initSSEApi({ url: '/fakeApi/sse' })

      expect(service).toBeNull()
    })

    it('creates service when SSE is enabled', async () => {
      mockFetchEnvVars.mockResolvedValue({ SSE_ENABLED: true })
      const { initSSEApi, getSSEServiceInstance } = await import('../sse-api')
      const service = await initSSEApi({ url: '/fakeApi/sse' })

      expect(service).not.toBeNull()
      expect(getSSEServiceInstance()).toBe(service)
    })
  })

  describe('subscribeToEvents endpoint', () => {
    it('returns empty array initially', async () => {
      const { store, sseApi } = await createStore()
      const result = await store.dispatch(
        sseApi.endpoints.subscribeToEvents.initiate({
          eventType: 'mail:received',
        })
      )

      expect(result.data).toEqual([])
    })
  })

  describe('exports', () => {
    it('exposes RTK Query hooks and api slice', async () => {
      const mod = await import('../sse-api')

      expect(mod.sseApi).toBeDefined()
      expect(mod.useConnectSSEMutation).toBeDefined()
      expect(mod.useDisconnectSSEMutation).toBeDefined()
      expect(mod.useGetSSEStatusQuery).toBeDefined()
      expect(mod.useSubscribeToEventsQuery).toBeDefined()
    })
  })
})
