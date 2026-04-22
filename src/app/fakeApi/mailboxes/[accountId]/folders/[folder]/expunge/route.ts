import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({ mail_deleted: 3 })
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['POST', 'OPTIONS'] })
}
