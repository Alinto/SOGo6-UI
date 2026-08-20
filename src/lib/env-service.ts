import React from 'react'

export interface EnvVariables {
  REACT_APP_API_BASE_URL?: string
  REACT_APP_API_URL?: string
  NEXT_PUBLIC_ADMIN_DOMAINS?: string
  SSE_ENABLED?: boolean
  /** Runtime prefill for /auth/login (from LOGIN_PREFILL_EMAIL or legacy NEXT_PUBLIC_* on server). */
  LOGIN_PREFILL_EMAIL?: string
  /** Runtime prefill for /auth/login/pwd (from LOGIN_PREFILL_PASSWORD or legacy NEXT_PUBLIC_* on server). Dev only. */
  LOGIN_PREFILL_PASSWORD?: string
}

let envCache: EnvVariables | null = null
let fetchPromise: Promise<EnvVariables> | null = null
let isApiHealthy: boolean | null = null

const HEALTH_CHECK_MS = 2000
const ENV_FETCH_MS = 4000
const ENV_SESSION_KEY = 'sogo-env-vars'

const readSessionEnv = (): EnvVariables | null => {
  if (typeof sessionStorage === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(ENV_SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as EnvVariables
    return parsed.REACT_APP_API_BASE_URL ? parsed : null
  } catch {
    return null
  }
}

const writeSessionEnv = (data: EnvVariables): void => {
  if (typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.setItem(ENV_SESSION_KEY, JSON.stringify(data))
  } catch {
    // quota / private mode
  }
}

/** Mock API fallback is allowed only outside production (dev + tests). */
const allowFakeApiFallback = (): boolean =>
  process.env.NODE_ENV !== 'production'

/**
 * Check if the API is reachable via GET /system (same check for relative and absolute base URLs).
 */
const checkApiHealth = async (apiUrl: string): Promise<boolean> => {
  if (apiUrl === '/fakeApi') {
    return true
  }

  const healthUrl = `${apiUrl.replace(/\/$/, '')}/system`

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_MS)

    const response = await fetch(healthUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      console.info(
        `%cAPI health check failed for ${healthUrl} (HTTP ${response.status})`,
        'color: #94a3b8'
      )
      return false
    }

    try {
      const body = (await response.json()) as { error_code?: string }
      if (body.error_code && body.error_code !== 'S000000') {
        console.info(
          `%cAPI health check failed for ${healthUrl} (error_code ${body.error_code})`,
          'color: #94a3b8'
        )
        return false
      }
    } catch {
      // Non-JSON health body — HTTP 200 is enough
    }

    return true
  } catch (error) {
    const errorName = (error as Error).name
    const errorMessage = (error as Error).message

    if (
      errorName === 'AbortError' ||
      errorMessage.includes('Failed to fetch')
    ) {
      console.info(
        `%cAPI health check failed for ${healthUrl} (unreachable or timeout)`,
        'color: #94a3b8'
      )
    } else {
      console.info(
        `%cAPI health check failed for ${healthUrl}`,
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
      const envController = new AbortController()
      const envTimeout = setTimeout(() => envController.abort(), ENV_FETCH_MS)

      let response: Response
      try {
        response = await fetch('/env', { signal: envController.signal })
        clearTimeout(envTimeout)
      } catch {
        clearTimeout(envTimeout)
        throw new Error('fetch /env timeout or network error')
      }

      const data = await response.json()
      const isDevelopment = process.env.NODE_ENV === 'development'
      const configuredApiUrl =
        data.REACT_APP_API_BASE_URL?.trim() ||
        (allowFakeApiFallback() ? '/fakeApi' : undefined)

      if (!configuredApiUrl) {
        throw new Error('REACT_APP_API_BASE_URL is not configured')
      }

      data.REACT_APP_API_BASE_URL = configuredApiUrl

      // Check if the configured API is healthy (only in development)
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
          //fakeApi defined here
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
      writeSessionEnv(data)
      return data
    } catch (error) {
      const stored = readSessionEnv()
      if (stored) {
        envCache = stored
        return stored
      }

      if (!allowFakeApiFallback()) {
        throw error
      }

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
  if (typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.removeItem(ENV_SESSION_KEY)
    } catch {
      // ignore
    }
  }
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
      setError(null)
      return fetchEnvVars()
        .then((vars) => {
          setEnvVars(vars)
          setLoading(false)
          return vars
        })
        .catch((err) => {
          setError(err instanceof Error ? err : new Error(String(err)))
          setLoading(false)
          throw err
        })
    },
  }
}
