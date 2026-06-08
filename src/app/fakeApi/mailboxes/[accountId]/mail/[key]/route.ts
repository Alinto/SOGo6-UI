import { NextRequest, NextResponse } from 'next/server'

// PUT fakeApi/mailboxes/[accountId]/mail/[key]
// PUT fakeApi/mailboxes/[accountId]/mail/[key]?close=true
export async function PUT(
  req: NextRequest,
  { params }: { params: { accountId: string; key: string } }
) {
  const body = await req.json()
  const close = new URL(req.url).searchParams.get('close') === 'true'

  // Validate required fields
  if (!body.from || !Array.isArray(body.to) || body.to.length === 0) {
    return NextResponse.json(
      {
        data: null,
        error_code: 'E000400',
        error_msg: 'Missing required fields: from, to',
      },
      { status: 400 }
    )
  }

  return NextResponse.json(
    {
      data: { key: params.key },
      error_code: 'S000000',
      error_msg: 'No Error',
    },
    { status: 200 }
  )
}

// DELETE fakeApi/mailboxes/[accountId]/mail/[key]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { accountId: string; key: string } }
) {
  console.log(
    `[fakeApi] DELETE /mailboxes/${params.accountId}/mail/${params.key}`
  )

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
  return NextResponse.json({ allow: ['PUT', 'DELETE'] }, { status: 200 })
}
