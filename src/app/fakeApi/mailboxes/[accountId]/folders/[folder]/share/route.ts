import type {
  FolderShareData,
  FolderShareUser,
} from '@/features/mails/mails-types'
import { NextRequest, NextResponse } from 'next/server'

const shareByFolderPath = new Map<string, FolderShareData>()

function usersArrayToFolderShareData(users: FolderShareUser[]): FolderShareData {
  const usersRecord: FolderShareData['users'] = {}
  for (const u of users) {
    usersRecord[u.uid] = {
      uid: u.uid,
      c_email: u.c_email,
      cn: u.cn,
      userClass: u.userClass,
      rights: u.rights,
    }
  }
  return { users: usersRecord }
}

const okEnvelope = <T>(data: T) => ({
  data,
  error_code: 'S000000' as const,
  error_msg: 'No Error' as const,
})

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ accountId: string; folder: string }> }
) {
  const { folder } = await ctx.params
  const data = shareByFolderPath.get(folder) ?? { users: {} }
  return NextResponse.json(okEnvelope(data))
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ accountId: string; folder: string }> }
) {
  const { folder } = await ctx.params
  const body = (await req.json()) as FolderShareUser[]
  const data = usersArrayToFolderShareData(Array.isArray(body) ? body : [])
  shareByFolderPath.set(folder, data)
  return NextResponse.json(okEnvelope(data))
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET', 'POST', 'OPTIONS'] })
}
