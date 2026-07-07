/**
 * SSE API Integration using RTK Query
 * Integrates SSE events with RTK Query for real-time data management
 */

import { fetchEnvVars } from '@/lib/env-service'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { SSEService } from './sse-service'
import { SSEConfig, SSEConnectionState, SSEMessage } from './types'

let sseServiceInstance: SSEService | null = null

/**
 * Check if SSE is enabled via environment variable
 * Fetches env vars if not yet loaded. Defaults to true if not set.
 */
const isSSEEnabled = async (): Promise<boolean> => {
  const envVars = await fetchEnvVars()
  // Disable SSE only if the env var is explicitly set to false
  return envVars.SSE_ENABLED !== false
}

/**
 * Get or create SSE service instance
 */
const getSSEService = (config?: SSEConfig): SSEService => {
  if (!sseServiceInstance && config) {
    sseServiceInstance = new SSEService(config)
  }
  if (!sseServiceInstance) {
    throw new Error('SSE Service not initialized. Call initSSEApi first.')
  }
  return sseServiceInstance
}

/**
 * Create a no-op baseQuery since we're using queryFn
 */
const baseQuery = fetchBaseQuery({
  baseUrl: '/fakeApi/sse',
})

/**
 * SSE API slice with RTK Query
 * Handles EventSource subscriptions and cache management
 */
export const sseApi = createApi({
  reducerPath: 'sseApi',
  tagTypes: ['SSE_EVENT'],
  baseQuery,
  endpoints: (builder) => ({
    /**
     * Subscribe to a specific event type
     * Returns a stream of data from SSE
     */
    subscribeToEvents: builder.query<SSEMessage[], { eventType: string }>({
      queryFn: () => {
        // Return empty array initially - updates come through listener middleware
        return { data: [] }
      },
      // Keep data in cache indefinitely
      keepUnusedDataFor: Infinity,
    }) /**
     * Get current connection status
     */,
    getSSEStatus: builder.query<
      {
        state: SSEConnectionState
        messageCount: number
        reconnectAttempts: number
        lastMessageTime: number | null
      },
      void
    >({
      queryFn: async () => {
        try {
          if (!sseServiceInstance) {
            return {
              data: {
                state: SSEConnectionState.DISCONNECTED,
                messageCount: 0,
                reconnectAttempts: 0,
                lastMessageTime: null,
              },
            }
          }
          const stats = sseServiceInstance.getStats()
          return {
            data: {
              state: stats.state,
              messageCount: stats.messageCount,
              reconnectAttempts: stats.reconnectAttempts,
              lastMessageTime: stats.lastMessageTime,
            },
          }
        } catch (error) {
          console.warn('Failed to get SSE status:', error)
          return {
            data: {
              state: SSEConnectionState.DISCONNECTED,
              messageCount: 0,
              reconnectAttempts: 0,
              lastMessageTime: null,
            },
          }
        }
      },
    }),

    /**
     * Connect to SSE server
     */
    connectSSE: builder.mutation<
      { connected: boolean; disabled?: boolean },
      SSEConfig | void
    >({
      queryFn: async (newConfig) => {
        // Check if SSE is disabled via environment variable
        const sseEnabled = await isSSEEnabled()
        if (!sseEnabled) {
          console.log('SSE is disabled via SSE_ENABLED environment variable')
          return { data: { connected: false, disabled: true } }
        }

        console.log('Connecting to SSE server with config:', newConfig)
        if (newConfig) {
          // Create or update service with new config
          if (sseServiceInstance) {
            sseServiceInstance.disconnect()
          }
          sseServiceInstance = new SSEService(newConfig)
          await sseServiceInstance.connect()
        } else {
          const sseService = getSSEService()
          await sseService.connect()
        }

        return { data: { connected: true } }
      },
    }),

    /**
     * Disconnect from SSE server
     */
    disconnectSSE: builder.mutation<{ disconnected: boolean }, void>({
      queryFn: async () => {
        if (sseServiceInstance) {
          sseServiceInstance.disconnect()
        }
        return { data: { disconnected: true } }
      },
      invalidatesTags: [{ type: 'SSE_EVENT', id: 'all' }],
    }),
  }),
})

/**
 * Initialize SSE API with config
 * Returns null if SSE is disabled
 */
export const initSSEApi = async (
  config: SSEConfig
): Promise<SSEService | null> => {
  const sseEnabled = await isSSEEnabled()
  if (!sseEnabled) {
    console.log('SSE is disabled via SSE_ENABLED environment variable')
    return null
  }
  sseServiceInstance = new SSEService(config)
  return sseServiceInstance
}

/**
 * Get current SSE service instance
 */
export const getSSEServiceInstance = () => sseServiceInstance

/**
 * Export RTK Query hooks
 */
export const {
  useSubscribeToEventsQuery,
  useGetSSEStatusQuery,
  useConnectSSEMutation,
  useDisconnectSSEMutation,
} = sseApi
