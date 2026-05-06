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

const data = {
  REACT_APP_API_BASE_URL: process.env.REACT_APP_API_BASE_URL,
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  NEXT_PUBLIC_ADMIN_DOMAINS:
    process.env.NEXT_PUBLIC_ADMIN_DOMAINS || 'admin.localhost',
  SSE_ENABLED: process.env.SSE_ENABLED !== 'false',
  LOGIN_PREFILL_EMAIL: loginPrefillEmail,
  LOGIN_PREFILL_PASSWORD: loginPrefillPassword,
}

export async function GET() {
  return NextResponse.json(data)
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET'] }, { status: 200 })
}
