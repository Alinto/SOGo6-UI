import React from 'react'

export interface EnvVariables {
  REACT_APP_API_BASE_URL?: string
  SSE_ENABLED?: boolean
  // Add other environment variables here as needed
}

let envCache: EnvVariables | null = null
let fetchPromise: Promise<EnvVariables> | null = null
let isApiHealthy: boolean | null = null

/**
 * Check if the API is reachable with a simple health check
 */
const checkApiHealth = async (apiUrl: string): Promise<boolean> => {
  if (apiUrl === '/fakeApi') {
    return true // fakeApi is always available
  }

  try {
    // Try to reach the API with a short timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout

    await fetch(apiUrl, {
      method: 'HEAD',
      signal: controller.signal,
      mode: 'no-cors', // Allow cross-origin requests without CORS
    })

    clearTimeout(timeoutId)
    // With no-cors mode, we won't get response status, so if fetch completes without error, assume it's reachable
    return true
  } catch (error) {
    const errorName = (error as Error).name
    const errorMessage = (error as Error).message

    if (
      errorName === 'AbortError' ||
      errorMessage.includes('Failed to fetch')
    ) {
      console.info(
        `%cAPI health check failed for ${apiUrl} (unreachable or timeout)`,
        'color: #94a3b8'
      )
    } else {
      console.info(
        `%cAPI health check failed for ${apiUrl}`,
        'color: #94a3b8',
        error
      )
    }
    return false
  }
}

export const fetchEnvVars = async (): Promise<EnvVariables> => {
  if (envCache) {
    return envCache
  }

  if (fetchPromise) {
    return fetchPromise
  }

  fetchPromise = (async () => {
    try {
      const response = await fetch('/env')
      const data = await response.json()
      // Check if the configured API is healthy (only in development)
      const configuredApiUrl = data.REACT_APP_API_BASE_URL || '/fakeApi'
      const isDevelopment = process.env.NODE_ENV === 'development'

      if (isDevelopment && configuredApiUrl !== '/fakeApi') {
        console.log(
          `%c🔍 Checking API connectivity: ${configuredApiUrl}`,
          'color: #3b82f6; font-weight: bold'
        )
        isApiHealthy = await checkApiHealth(configuredApiUrl)
        if (!isApiHealthy) {
          console.log(
            `%c❌ API at ${configuredApiUrl} is not reachable.`,
            'color: #ef4444; font-weight: bold'
          )
          console.log(
            `%c➡️  Switching to /fakeApi (mock data)`,
            'color: #f59e0b; font-weight: bold'
          )
          data.REACT_APP_API_BASE_URL = '/fakeApi'
        } else {
          console.log(
            `%c✅ API at ${configuredApiUrl} is reachable. Using real API.`,
            'color: #10b981; font-weight: bold'
          )
        }
      } else if (isDevelopment && configuredApiUrl === '/fakeApi') {
        console.log(
          `%c🎭 Using /fakeApi (mock data) - No health check needed.`,
          'color: #8b5cf6; font-weight: bold'
        )
      }

      envCache = data
      return data
    } catch (error) {
      console.warn(
        `⚠️  Failed to fetch environment variables.\n` +
          `➡️  Switching to /fakeApi (mock data)`,
        error
      )
      const fallback = { REACT_APP_API_BASE_URL: '/fakeApi' }
      envCache = fallback
      isApiHealthy = false
      return fallback
    } finally {
      fetchPromise = null
    }
  })()

  return fetchPromise
}

export const getCachedEnvVars = (): EnvVariables | null => {
  return envCache
}

export const getEnvVar = (
  key: keyof EnvVariables
): string | boolean | undefined => {
  return envCache?.[key]
}

export const clearEnvCache = (): void => {
  envCache = null
  fetchPromise = null
  isApiHealthy = null
}

export const isEnvLoaded = (): boolean => {
  return envCache !== null
}

export const getApiHealthStatus = (): boolean | null => {
  return isApiHealthy
}

export const isUsingFakeApi = (): boolean => {
  return envCache?.REACT_APP_API_BASE_URL === '/fakeApi'
}

export const useEnvVars = () => {
  const [envVars, setEnvVars] = React.useState<EnvVariables | null>(
    getCachedEnvVars()
  )
  const [loading, setLoading] = React.useState(!isEnvLoaded())
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    if (!isEnvLoaded()) {
      fetchEnvVars()
        .then((vars) => {
          setEnvVars(vars)
          setLoading(false)
        })
        .catch((err) => {
          setError(err)
          setLoading(false)
        })
    } else {
      setEnvVars(getCachedEnvVars())
      setLoading(false)
    }
  }, [])

  return {
    envVars,
    loading,
    error,
    refetch: () => {
      clearEnvCache()
      setLoading(true)
      return fetchEnvVars().then((vars) => {
        setEnvVars(vars)
        setLoading(false)
        return vars
      })
    },
  }
}
