import { NextRequest, NextResponse } from 'next/server'

// POST fakeApi/mailboxes/[accountId]/mail/[key]/attachments
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ accountId: string; key: string }> }
) {
  try {
    const { accountId, key } = await params
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        {
          data: null,
          error_code: 'E000400',
          error_msg: 'No file provided',
        },
        { status: 400 }
      )
    }

    console.log(
      `[fakeApi] POST /mailboxes/${accountId}/mail/${key}/attachments`,
      {
        filename: file.name,
        size: file.size,
        type: file.type,
      }
    )

    return NextResponse.json(
      {
        data: { filename: file.name },
        error_code: 'S000000',
        error_msg: 'No Error',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[fakeApi] Error uploading attachment:', error)
    return NextResponse.json(
      {
        data: null,
        error_code: 'E000500',
        error_msg: 'Failed to upload attachment',
      },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['POST'] }, { status: 200 })
}
