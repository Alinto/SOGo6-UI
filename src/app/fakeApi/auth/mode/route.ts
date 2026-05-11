import { NextResponse } from 'next/server'

const data = {
  data: {
    SOGO_D_PWD_RECOVERY: true,
    kind: 'plain',
    location: '',
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
