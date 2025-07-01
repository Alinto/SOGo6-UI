import { NextResponse } from 'next/server'

const data = {
  mailDisplayMode: 'modern', // or 'modern'
}

export async function GET() {
  return NextResponse.json(data)
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET'] }, { status: 200 })
}
