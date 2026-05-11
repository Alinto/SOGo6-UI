import { NextResponse } from 'next/server'

const data = {
  data: {
    system: {
      SOGO_S_DIRECT_LOGIN: false,
    },
  },
  error_code: 'S000000',
  error_msg: 'No Error',
}
export async function GET() {
  return NextResponse.json(data)
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET'] }, { status: 200 })
}
