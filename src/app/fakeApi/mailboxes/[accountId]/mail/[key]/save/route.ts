import { NextRequest, NextResponse } from 'next/server'

//POST fakeApi/mailboxes/[accountId]/mail/[key]/save
export async function PUT(
  req: NextRequest,
  { params }: { params: { accountId: string; key: string } }
) {
  const body = await req.json()
  const close = new URL(req.url).searchParams.get('close') === 'true'

  console.log(
    "[fakeApi] PUT /mailboxes/${params.accountId}/mail/${params.key}/save${close ? '?close=true' : ''}",
    body
  )

  return NextResponse.json(
    {
      data: { key: params.key },
      error_code: 'S000000',
      error_msg: 'No Error',
    },
    { status: 200 }
  )
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['PUT'] }, { status: 200 })
}
