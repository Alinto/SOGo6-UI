import { NextRequest, NextResponse } from 'next/server'



//POST fakeApi/mailboxes/[accountId]/mail/save
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  const { accountId } = await params
  const body = await req.json()
  const close = new URL(req.url).searchParams.get('close') === 'true'

  console.log(
    `[fakeApi] POST /mailboxes/${accountId}/mail/save${close ? '?close=true' : ''}`,
    body
  )

  // Generate a mock key for the new draft
  const mockKey = `${Date.now()}${Math.random().toString(36).substr(2, 9)}`

  return NextResponse.json(
    {
      data: { key: mockKey },
      error_code: 'S000000',
      error_msg: 'No Error',
    },
    { status: 200 }
  )
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['POST'] }, { status: 200 })
}
