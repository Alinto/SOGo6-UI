import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json()

  console.log(`[fakeApi] POST /mailboxes/${params.id}/discarddraft`, body)

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
