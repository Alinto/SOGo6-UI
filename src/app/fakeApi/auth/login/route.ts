import { NextRequest, NextResponse } from 'next/server'

const data = {
  data: {
    jwt_token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJzb2dvLXRlc3RzMUBleGFtcGxlLm9yZyIsImNuIjoiSm9obiBQYXVsIiwiZW1haWwiOiJzb2dvLXRlc3RzMUBleGFtcGxlLm9yZyIsInNlc3Npb25fa2V5IjoiRk9SX1RFU1RJTkciLCJpc3MiOiJTT0dvNiIsImV4cCI6MTc3NTI5Mzg0M30.INVALID_SIGNATURE_ONLY_FOR_TESTING',
  },
  error_code: 'S000000',
  error_msg: 'No Error',
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ calendarId: string }> }
) {
  // const body = await req.json()

  // Save in the cookie
  const response = NextResponse.json(data)
  return response
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET'] }, { status: 200 })
}
