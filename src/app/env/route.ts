import { NextResponse } from 'next/server'
import { buildEnvRoutePayload } from '@/lib/env-route-payload'

export async function GET() {
  return NextResponse.json(buildEnvRoutePayload())
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET'] }, { status: 200 })
}
