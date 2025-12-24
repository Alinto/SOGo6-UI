import type {
  ImapAccountCreate,
  ImapAccountDetail,
  ImapAccountListItem,
} from '@/features/user-settings/mail/imap-accounts/types'
import { NextRequest, NextResponse } from 'next/server'

let nextId = 2

const accounts: ImapAccountListItem[] = [
  { id: '1', email: 'user@entreprise.com', readReceipts: 'never' },
]

const accountDetails: Record<string, ImapAccountDetail> = {
  '1': {
    id: '1',
    imapServer: 'imap.entreprise.com',
    imapPort: 993,
    imapEncryption: 'ssl',
    smtpServer: 'smtp.entreprise.com',
    smtpPort: 587,
    smtpAuth: true,
    smtpEncryption: 'tls',
    username: 'user@entreprise.com',
    useDefaultIdentity: false,
    readReceipts: 'never',
    certificateName: '',
    certificateFingerprint: '',
  },
}

export async function GET(req: NextRequest) {
  await new Promise((r) => setTimeout(r, 1000))

  const id = req.nextUrl.searchParams.get('id')
  if (id) {
    const detail = accountDetails[id]
    if (!detail) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }
    return NextResponse.json(detail)
  }

  return NextResponse.json(accounts)
}

export async function POST(req: NextRequest) {
  await new Promise((r) => setTimeout(r, 500))

  const body = (await req.json()) as ImapAccountCreate
  const newId = (nextId++).toString()

  const newAccount: ImapAccountListItem = {
    id: newId,
    email: body.username,
    readReceipts: body.readReceipts,
  }

  const newDetail: ImapAccountDetail = {
    id: newId,
    ...body,
  }

  accounts.push(newAccount)
  accountDetails[newId] = newDetail

  return NextResponse.json(newAccount)
}

export async function PATCH(req: NextRequest) {
  await new Promise((r) => setTimeout(r, 500))

  const id = req.nextUrl.searchParams.get('id')
  if (!id || !accountDetails[id]) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 })
  }

  const body = await req.json()

  Object.assign(accountDetails[id], body)

  const account = accounts.find((a) => a.id === id)
  if (account && body.readReceipts) {
    account.readReceipts = body.readReceipts as 'never' | 'selective'
  }

  return NextResponse.json(accountDetails[id])
}

export async function DELETE(req: NextRequest) {
  await new Promise((r) => setTimeout(r, 500))

  const id = req.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  const index = accounts.findIndex((a) => a.id === id)
  if (index === -1) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 })
  }

  accounts.splice(index, 1)
  delete accountDetails[id]

  return NextResponse.json({ success: true })
}
