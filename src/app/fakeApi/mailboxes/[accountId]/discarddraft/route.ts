import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  const { accountId } = await params
  const body = await req.json()

  console.log(`[fakeApi] POST /mailboxes/${accountId}/discarddraft`, body)

  return NextResponse.json(
    {
      data: null,
      error_code: 'S000000',
      error_msg: 'No Error',
    },
    { status: 200 }
  )
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['POST'] }, { status: 200 })
}
