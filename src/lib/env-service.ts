import React from 'react'

export interface EnvVariables {
  REACT_APP_API_BASE_URL?: string
  // Add other environment variables here as needed
}

let envCache: EnvVariables | null = null
let fetchPromise: Promise<EnvVariables> | null = null

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
      envCache = data
      return data
    } catch (error) {
      console.warn(
        'Failed to fetch environment variables, falling back to defaults:',
        error
      )
      const fallback = { REACT_APP_API_BASE_URL: '/fakeApi' }
      envCache = fallback
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

export const getEnvVar = (key: keyof EnvVariables): string | undefined => {
  return envCache?.[key]
}

export const clearEnvCache = (): void => {
  envCache = null
  fetchPromise = null
}

export const isEnvLoaded = (): boolean => {
  return envCache !== null
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
