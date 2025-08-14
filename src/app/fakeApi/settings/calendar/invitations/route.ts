import { NextRequest, NextResponse } from 'next/server'

const data = {
  disable_notifications: true,
  prevent_invitations: false,
  invitations_wlist: ['test@test.fr', 'test2@test.fr'],
}

export async function GET() {
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  return NextResponse.json({ ...data, ...body }, { status: 201 })
}
