import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({ mails_deleted: 5 })
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['POST', 'OPTIONS'] })
}
