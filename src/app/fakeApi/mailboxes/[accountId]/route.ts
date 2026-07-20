import { NextRequest, NextResponse } from 'next/server'

// GET fakeApi/mailboxes/[accountId]
const mailboxesById: Record<string, unknown> = {
  '0': {
    certificates: {},
    identities: [
      {
        isDefault: true,
        mail: 'sogo-tests1@example.org',
        name: 'John Paul',
        replyTo: 'sogo-tests1@example.org',
        signatures: {},
      },
    ],
    quota: {
      soft_quota_value: 8000,
      storage_limit: 512000,
      storage_used: 350000,
    },
    receipts: {},
  },
  '1': {
    certificates: {},
    identities: [
      {
        isDefault: true,
        mail: 'gustave@lumiere.fr',
        name: 'Gustave',
        replyTo: 'gustave@lumiere.fr',
        signatures: {
          Gustave: '<p>&nbsp;</p><p>Greetings,</p><p>&nbsp;</p><p>Gustave</p>',
        },
      },
    ],
    mail_outgoing: {
      auth_mech: 'login',
      encryption: 'StartTLS',
      port: 587,
      server: 'smtp.example.com',
      type: 'smtp',
      username: 'gustave@smtp.example.com',
    },
    mail_server: {
      auth_mech: 'plain',
      encryption: 'StartTLS',
      port: 993,
      server: 'imap.example.com',
      type: 'imap',
      username: 'gustave@imap.example.com',
    },
    name: 'Work account',
    quota: {
      soft_quota_value: 8000,
      storage_limit: 100000,
      storage_used: 76000,
    },
    receipts: {
      enabled: false,
      not_to_cc: 'never',
      other: 'never',
      outside_domain: 'never',
    },
  },
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  const { accountId } = await params
  console.log(`[fakeApi] GET /mailboxes/${accountId}`)

  const mailbox = mailboxesById[accountId] ?? mailboxesById['0']

  return NextResponse.json(
    {
      data: mailbox,
      error_code: 'S000000',
      error_msg: 'No Error',
    },
    { status: 200 }
  )
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET'] }, { status: 200 })
}
