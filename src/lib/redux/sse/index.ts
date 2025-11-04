/**
 * SSE Redux Integration - Main Entry Point
 *
 * This module provides RTK Query-based real-time event streaming via Server-Sent Events (SSE).
 * All hooks and utilities are exported from this file.
 */

// Types
export { SSEConnectionState } from './types'
export type { SSEConfig, SSEEvent, SSEMessage } from './types'

// Service
export {
  SSEService,
  getSSEService,
  initializeSSEService,
  resetSSEService,
} from './sse-service'

// RTK Query API (Primary Integration)
export {
  getSSEServiceInstance,
  initSSEApi,
  sseApi,
  useConnectSSEMutation,
  useDisconnectSSEMutation,
  useGetSSEStatusQuery,
  useSubscribeToEventsQuery,
} from './sse-api'

// Configuration
export {
  getDefaultSSEConfig,
  getDefaultSSEConfigSync,
  getDevelopmentSSEConfig,
  getProductionSSEConfig,
  getSSEConfigForEnvironment,
  getTestSSEConfig,
} from './sse-config'
