import { buildEnvRoutePayload } from '@/lib/env-route-payload'

describe('buildEnvRoutePayload', () => {
  it('exposes login prefill values outside production', () => {
    const payload = buildEnvRoutePayload({
      NODE_ENV: 'development',
      LOGIN_PREFILL_EMAIL: 'dev@example.org',
      LOGIN_PREFILL_PASSWORD: 'dev-secret',
    })

    expect(payload.LOGIN_PREFILL_EMAIL).toBe('dev@example.org')
    expect(payload.LOGIN_PREFILL_PASSWORD).toBe('dev-secret')
  })

  it('strips login prefill values in production', () => {
    const payload = buildEnvRoutePayload({
      NODE_ENV: 'production',
      LOGIN_PREFILL_EMAIL: 'prod@example.org',
      LOGIN_PREFILL_PASSWORD: 'prod-secret',
    })

    expect(payload.LOGIN_PREFILL_EMAIL).toBe('')
    expect(payload.LOGIN_PREFILL_PASSWORD).toBe('')
    expect(payload.REACT_APP_API_BASE_URL).toBeUndefined()
  })

  it('includes NEXT_PUBLIC_ADMIN_DOMAINS in the payload', () => {
    const payload = buildEnvRoutePayload({
      NODE_ENV: 'test',
      NEXT_PUBLIC_ADMIN_DOMAINS: 'admin.example.com,ops.example.com',
    })

    expect(payload.NEXT_PUBLIC_ADMIN_DOMAINS).toBe(
      'admin.example.com,ops.example.com'
    )
  })

  it('defaults SSE_ENABLED to false in development unless explicitly enabled', () => {
    const payload = buildEnvRoutePayload({ NODE_ENV: 'development' })
    expect(payload.SSE_ENABLED).toBe(false)
  })

  it('defaults SSE_ENABLED to true in production unless explicitly disabled', () => {
    const payload = buildEnvRoutePayload({
      NODE_ENV: 'production',
      SSE_ENABLED: 'false',
    })
    expect(payload.SSE_ENABLED).toBe(false)
  })
})
