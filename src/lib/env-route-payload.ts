export interface EnvRoutePayload {
  REACT_APP_API_BASE_URL?: string
  REACT_APP_API_URL?: string
  NEXT_PUBLIC_ADMIN_DOMAINS: string
  SSE_ENABLED: boolean
  LOGIN_PREFILL_EMAIL: string
  LOGIN_PREFILL_PASSWORD: string
}

const defaultDevApiBaseUrl = 'http://127.0.0.1:5000/api/user/v1'

type EnvSource = Record<string, string | undefined>

/** Build the public JSON payload served by GET /env. */
export function buildEnvRoutePayload(
  env: EnvSource = process.env
): EnvRoutePayload {
  const isProduction = env.NODE_ENV === 'production'

  const loginPrefillEmail =
    env.LOGIN_PREFILL_EMAIL?.trim() ||
    env.NEXT_PUBLIC_LOGIN_PREFILL_EMAIL?.trim() ||
    ''

  const loginPrefillPassword =
    env.LOGIN_PREFILL_PASSWORD ?? env.NEXT_PUBLIC_LOGIN_PREFILL_PASSWORD ?? ''

  const reactAppApiBaseUrl =
    env.REACT_APP_API_BASE_URL?.trim() ||
    (env.NODE_ENV === 'development' ? defaultDevApiBaseUrl : undefined)

  const sseEnabled =
    env.NODE_ENV === 'development'
      ? env.SSE_ENABLED === 'true'
      : env.SSE_ENABLED !== 'false'

  return {
    REACT_APP_API_BASE_URL: reactAppApiBaseUrl,
    REACT_APP_API_URL: env.REACT_APP_API_URL,
    NEXT_PUBLIC_ADMIN_DOMAINS:
      env.NEXT_PUBLIC_ADMIN_DOMAINS || 'admin.localhost',
    SSE_ENABLED: sseEnabled,
    LOGIN_PREFILL_EMAIL: isProduction ? '' : loginPrefillEmail,
    LOGIN_PREFILL_PASSWORD: isProduction ? '' : loginPrefillPassword,
  }
}
