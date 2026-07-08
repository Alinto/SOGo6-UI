import { NextRequest, NextResponse } from 'next/server'

// GET fakeApi/mailboxes/[accountId]/mail/current
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const { accountId } = await params
    console.log(`[fakeApi] GET /mailboxes/${accountId}/mail/current`)

    return NextResponse.json(
      {
        data: [],
        error_code: 'S000000',
        error_msg: 'No Error',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[fakeApi] Error fetching current drafts:', error)
    return NextResponse.json(
      {
        data: null,
        error_code: 'E000500',
        error_msg: 'Failed to fetch current drafts',
      },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET'] }, { status: 200 })
}
