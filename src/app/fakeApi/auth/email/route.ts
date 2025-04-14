import { NextResponse } from 'next/server'

const data = {
  type: 'oidc',
  oidc: {
    authority: 'https://auth.alinto.net/application/o/test-sogo',
    client_id: 'oJeQLOkpEP8W4gUGm7HjAEXek7QRgrkm2HC9v3pS',
    redirect_uri: 'http://localhost:3001/auth/callback',
    response_type: 'code',
    client_secret:
      'GUFufpD7b6bTWWN2gCiQNy9FuCb60ACy11xO8nbFulfvW5Z2T4I3Nfyhpv2bsT7QWtpEqRxMd5vGdvtYLcSYoN9ImzpH4CYqPgQmluJPzBgTQ9mthxxXLDYnyRsA6p3t',
    scope: 'openid profile offline_access',
    post_logout_redirect_uri: 'http://localhost:3001/',
    automaticSilentRenew: false,
    silent_redirect_uri: 'http://localhost:3001/auth/silent-callback',
  },
}

export async function GET() {
  return NextResponse.json(data)
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET'] }, { status: 200 })
}
