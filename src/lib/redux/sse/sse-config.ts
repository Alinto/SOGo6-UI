/**
 * SSE Connection Configuration
 *
 * Default configuration for SSE connections used by useConnectSSEMutation.
 * This file centralizes SSE configuration for easy management and updates.
 */

import { fetchEnvVars } from '@/lib/env-service'
import type { SSEConfig } from './types'

/**
 * Get default SSE configuration
 *
 * Dynamically resolves the SSE endpoint based on environment variables.
 * Falls back to mock endpoint for development.
 */
export async function getDefaultSSEConfig(): Promise<SSEConfig> {
  try {
    const envVars = await fetchEnvVars()
    const baseUrl = envVars.REACT_APP_API_BASE_URL || '/fakeApi'

    return {
      url: `${baseUrl}/sse`,
      reconnectInterval: 3000, // Reconnect after 3 seconds
      maxReconnectAttempts: 5, // Maximum 5 reconnection attempts
      heartbeatTimeout: 30000, // 30 second heartbeat timeout
      withCredentials: true, // Include credentials for authenticated requests
      headers: {
        'Content-Type': 'text/event-stream',
        Accept: 'text/event-stream',
      },
    }
  } catch (error) {
    console.warn(
      'Failed to load environment variables for SSE config, using defaults',
      error
    )
    // Fallback to safe defaults
    return getDefaultSSEConfigSync()
  }
}

/**
 * Synchronous version of default SSE configuration
 * Used as fallback when async loading is not possible
 */
export function getDefaultSSEConfigSync(): SSEConfig {
  return {
    url: 'http://localhost:8888/sse',
    reconnectInterval: 3000,
    maxReconnectAttempts: 5,
    heartbeatTimeout: 30000,
    withCredentials: true,
    headers: {
      'Content-Type': 'text/event-stream',
      Accept: 'text/event-stream',
    },
  }
}

/**
 * Production SSE configuration
 * Used when deployed to production environment
 */
export function getProductionSSEConfig(): SSEConfig {
  return {
    url: `${window.location.origin}/api/sse`,
    reconnectInterval: 5000, // Longer reconnect interval for production
    maxReconnectAttempts: 10, // More reconnection attempts
    heartbeatTimeout: 60000, // 60 second heartbeat timeout
    withCredentials: true,
    headers: {
      'Content-Type': 'text/event-stream',
      Accept: 'text/event-stream',
      Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}`,
    },
  }
}

/**
 * Development SSE configuration
 * Used during development with mock endpoint
 */
export function getDevelopmentSSEConfig(): SSEConfig {
  return {
    url: 'http://localhost:8888/sse',
    reconnectInterval: 2000, // Fast reconnect for development
    maxReconnectAttempts: 3,
    heartbeatTimeout: 15000,
    withCredentials: false,
    headers: {
      'Content-Type': 'text/event-stream',
      Accept: 'text/event-stream',
    },
  }
}

/**
 * Test SSE configuration
 * Used during testing with mock data
 */
export function getTestSSEConfig(): SSEConfig {
  return {
    url: 'http://localhost:8888/sse',
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
 * Get SSE configuration based on environment
 *
 * @returns SSE configuration for current environment
 */
export function getSSEConfigForEnvironment(): SSEConfig {
  if (typeof window === 'undefined') {
    // Server-side: use default sync config
    return getDefaultSSEConfigSync()
  }

  const isDevelopment = process.env.NODE_ENV === 'development'
  const isTest = process.env.NODE_ENV === 'test'

  if (isTest) {
    return getTestSSEConfig()
  }

  if (isDevelopment) {
    return getDevelopmentSSEConfig()
  }

  return getProductionSSEConfig()
}
