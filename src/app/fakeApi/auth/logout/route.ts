import { NextResponse } from 'next/server'

const data = {
  data: null,
  error_code: 'S000000',
  error_msg: 'No Error',
}

export async function POST() {
  return NextResponse.json(data)
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['POST'] }, { status: 200 })
}
