import { NextRequest, NextResponse } from 'next/server'

// GET fakeApi/mailboxes/[accountId]/mail/[key]/attachments/[filename]
// Download the attachment identified by filename from the draft identified by key
export async function GET(
  _req: NextRequest,
  {
    params,
  }: { params: Promise<{ accountId: string; key: string; filename: string }> }
) {
  const { accountId, key, filename } = await params
  console.log(
    `[fakeApi] GET /mailboxes/${accountId}/mail/${key}/attachments/${filename}`
  )

  // Generate mock file content
  const mockContent = new TextEncoder().encode(
    `Mock content for attachment: ${filename}`
  )

  // Determine content type based on file extension
  const ext = filename.split('.').pop()?.toLowerCase() || 'bin'
  const contentTypeMap: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    txt: 'text/plain',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    zip: 'application/zip',
    bin: 'application/octet-stream',
  }

  const contentType = contentTypeMap[ext] || 'application/octet-stream'

  return new NextResponse(mockContent, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': mockContent.length.toString(),
    },
  })
}

// DELETE fakeApi/mailboxes/[accountId]/mail/[key]/attachments/[filename]
export async function DELETE(
  _req: NextRequest,
  {
    params,
  }: { params: Promise<{ accountId: string; key: string; filename: string }> }
) {
  const { accountId, key, filename } = await params
  console.log(
    `[fakeApi] DELETE /mailboxes/${accountId}/mail/${key}/attachments/${filename}`
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
  return NextResponse.json({ allow: ['GET', 'DELETE'] }, { status: 200 })
}
