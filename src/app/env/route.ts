import { NextResponse } from 'next/server'

/** Runtime login prefill (Rancher / container env). Falls back to NEXT_PUBLIC_* for older local .env files. */
const loginPrefillEmail =
  process.env.LOGIN_PREFILL_EMAIL?.trim() ||
  process.env.NEXT_PUBLIC_LOGIN_PREFILL_EMAIL?.trim() ||
  ''

const loginPrefillPassword =
  process.env.LOGIN_PREFILL_PASSWORD ??
  process.env.NEXT_PUBLIC_LOGIN_PREFILL_PASSWORD ??
  ''

/** Dev default: talk to Flask directly (no Next.js proxy). */
const defaultDevApiBaseUrl = 'http://127.0.0.1:5000/api/user/v1'

const reactAppApiBaseUrl =
  process.env.REACT_APP_API_BASE_URL?.trim() ||
  (process.env.NODE_ENV === 'development' ? defaultDevApiBaseUrl : undefined)

/** Dev: SSE off unless explicitly enabled (avoids reconnect loops to missing servers). */
const sseEnabled =
  process.env.NODE_ENV === 'development'
    ? process.env.SSE_ENABLED === 'true'
    : process.env.SSE_ENABLED !== 'false'

const data = {
  REACT_APP_API_BASE_URL: reactAppApiBaseUrl,
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  NEXT_PUBLIC_ADMIN_DOMAINS:
    process.env.NEXT_PUBLIC_ADMIN_DOMAINS || 'admin.localhost',
  SSE_ENABLED: sseEnabled,
  LOGIN_PREFILL_EMAIL: loginPrefillEmail,
  LOGIN_PREFILL_PASSWORD: loginPrefillPassword,
}

export async function GET() {
  return NextResponse.json(data)
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET'] }, { status: 200 })
}
