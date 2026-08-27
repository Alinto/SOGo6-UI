import type {
  FolderShareData,
  FolderShareUser,
} from '@/features/mails/mails-types'
import {
  ANY_AUTHENTICATED_UID,
  buildRightsFromPermissions,
} from '@/features/mails/utils/permission-mapping'
import { USER_CLASS_ANY } from '@/lib/constants/user-class'
import { NextRequest, NextResponse } from 'next/server'

const shareByFolderPath = new Map<string, FolderShareData>()

/**
 * Wire shape sent by the client: PUT body is a bare array of these. `rights`
 * is intentionally not part of the wire payload — `permissions` (always the
 * advanced IMAP codes) fully describes the selection, and the (real) backend
 * derives the actual IMAP ACL from it. This mock reconstructs `rights` the
 * same way, purely so its own GET response can still feed the app's
 * checkbox UI. `uid` is omitted by the client for the "any authenticated
 * user" pseudo-entry (user_class "anyone") — it isn't a real account.
 */
interface WireShareUser {
  c_email?: string
  uid?: string
  user_class?: string
  permissions?: string[]
  do_subfolders?: boolean
}

function fromWireUserClass(
  userClass?: string
): FolderShareUser['userClass'] {
  if (userClass === 'public') return 'public-user'
  if (userClass === USER_CLASS_ANY) return 'any-authenticated-user'
  return 'normal-user'
}

function wireUserToFolderShareUser(u: WireShareUser): FolderShareUser {
  const permissions = u.permissions ?? []
  const userClass = fromWireUserClass(u.user_class)
  return {
    uid: u.uid ?? (userClass === 'any-authenticated-user' ? ANY_AUTHENTICATED_UID : ''),
    c_email: u.c_email,
    userClass,
    rights: buildRightsFromPermissions(permissions),
    permissions,
    applyToSubfolders: u.do_subfolders ?? false,
  }
}

function usersArrayToFolderShareData(users: FolderShareUser[]): FolderShareData {
  const usersRecord: FolderShareData['users'] = {}
  for (const u of users) {
    usersRecord[u.uid] = {
      uid: u.uid,
      c_email: u.c_email,
      userClass: u.userClass,
      rights: u.rights,
      permissions: u.permissions,
      applyToSubfolders: u.applyToSubfolders,
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

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ accountId: string; folder: string }> }
) {
  const { folder } = await ctx.params
  // Each user's do_subfolders isn't acted upon here: the in-memory mock only
  // tracks a single folder path and doesn't recurse into child folders.
  const body = (await req.json()) as WireShareUser[]
  const users = Array.isArray(body) ? body.map(wireUserToFolderShareUser) : []
  const data = usersArrayToFolderShareData(users)
  shareByFolderPath.set(folder, data)
  return NextResponse.json(okEnvelope(data))
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET', 'PUT', 'OPTIONS'] })
}
