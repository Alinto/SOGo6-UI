/**
 * SSE Connection Configuration
 *
 * Default configuration for SSE connections used by useConnectSSEMutation.
 * Endpoints follow REACT_APP_API_BASE_URL (e.g. /fakeApi/sse or backend /sse).
 */

import { fetchEnvVars, getCachedEnvVars } from '@/lib/env-service'
import type { SSEConfig } from './types'

const DEFAULT_SSE_OPTIONS = {
  reconnectInterval: 3000,
  maxReconnectAttempts: 5,
  heartbeatTimeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'text/event-stream',
    Accept: 'text/event-stream',
  },
} as const satisfies Partial<SSEConfig>

/** Build SSE URL from the same base URL as RTK Query API calls. */
export function buildSSEConfig(apiBaseUrl: string): SSEConfig {
  const normalized = apiBaseUrl.replace(/\/$/, '')
  const withCredentials = !apiBaseUrl.startsWith('/')

  return {
    ...DEFAULT_SSE_OPTIONS,
    url: `${normalized}/sse`,
    withCredentials,
    headers: { ...DEFAULT_SSE_OPTIONS.headers },
  }
}

/**
 * Get default SSE configuration
 *
 * Dynamically resolves the SSE endpoint based on environment variables.
 */
export async function getDefaultSSEConfig(): Promise<SSEConfig> {
  try {
    const envVars = await fetchEnvVars()
    const baseUrl = envVars.REACT_APP_API_BASE_URL || '/fakeApi'
    return buildSSEConfig(baseUrl)
  } catch (error) {
    console.warn(
      'Failed to load environment variables for SSE config, using defaults',
      error
    )
    return getDefaultSSEConfigSync()
  }
}

/**
 * Synchronous fallback when env is already loaded or on the server.
 */
export function getDefaultSSEConfigSync(): SSEConfig {
  const cached = getCachedEnvVars()?.REACT_APP_API_BASE_URL
  return buildSSEConfig(cached || '/fakeApi')
}

/**
 * Production SSE configuration (reverse-proxy same-origin).
 */
export function getProductionSSEConfig(): SSEConfig {
  return {
    url: `${window.location.origin}/api/sse`,
    reconnectInterval: 5000,
    maxReconnectAttempts: 10,
    heartbeatTimeout: 60000,
    withCredentials: true,
    headers: {
      'Content-Type': 'text/event-stream',
      Accept: 'text/event-stream',
      Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}`,
    },
  }
}

/**
 * @deprecated Use getDefaultSSEConfig() — resolves from REACT_APP_API_BASE_URL.
 */
export function getDevelopmentSSEConfig(): SSEConfig {
  return getDefaultSSEConfigSync()
}

/**
 * Test SSE configuration (fakeApi, minimal reconnect).
 */
export function getTestSSEConfig(): SSEConfig {
  return {
    url: '/fakeApi/sse',
    reconnectInterval: 1000,
    maxReconnectAttempts: 1,
    heartbeatTimeout: 5000,
    withCredentials: false,
    headers: {
      'Content-Type': 'text/event-stream',
    },
  }
}

/**
 * Resolve SSE configuration for the current runtime environment.
 */
export async function getSSEConfigForEnvironment(): Promise<SSEConfig> {
  if (typeof window === 'undefined') {
    return getDefaultSSEConfigSync()
  }

  if (process.env.NODE_ENV === 'test') {
    return getTestSSEConfig()
  }

  if (process.env.NODE_ENV === 'production') {
    return getProductionSSEConfig()
  }

  return getDefaultSSEConfig()
}
