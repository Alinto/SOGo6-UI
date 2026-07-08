import { NextRequest, NextResponse } from 'next/server'

//POST fakeApi/mailboxes/[accountId]/send
export async function POST(
  req: NextRequest,
  { params: _params }: { params: Promise<{ accountId: string }> }
) {
  const body = await req.json()

  // Basic validation — mirror what the real backend would reject
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
