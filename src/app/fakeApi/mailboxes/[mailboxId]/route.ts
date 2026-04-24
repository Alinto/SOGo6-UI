import { NextRequest, NextResponse } from 'next/server'

const data = {
  data: {
    certificates: {},
    id: '0',
    identities: [
      {
        isDefault: true,
        mail: 'sogo-tests1@example.org',
        name: 'John Paul',
        replyTo: 'sogo-tests1@example.org',
        signatures: {},
      },
    ],
    receipts: {},
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`PATCH /fakeApi/mailboxes/${params.id} body:`, await req.json())
  return NextResponse.json(data, { status: 200 })
}
