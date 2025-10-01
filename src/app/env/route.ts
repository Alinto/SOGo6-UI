import { NextResponse } from 'next/server'

const data = {
  REACT_APP_API_BASE_URL: process.env.REACT_APP_API_BASE_URL || '/fakeApi',
  NEXT_PUBLIC_ADMIN_DOMAINS:
    process.env.NEXT_PUBLIC_ADMIN_DOMAINS || 'admin.localhost',
}

export async function GET() {
  return NextResponse.json(data)
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET'] }, { status: 200 })
}
