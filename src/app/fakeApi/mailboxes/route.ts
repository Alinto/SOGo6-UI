import { NextResponse } from 'next/server'

const data = {
  data: [
    {
      certificates: {},
      id: '0',
      identities: [
        {
          isDefault: true,
          mail: 'sogo-tests1@example.org',
          name: 'John Paul',
          replyTo: 'sogo-tests1@example.org',
          signatures: {},
        },
      ],
      receipts: {},
    },
    {
      certificates: {},
      id: 'u7lI',
      identities: [
        {
          isDefault: true,
          mail: 'gustave@lumiere.fr',
          name: 'Gustave',
          replyTo: 'gustave@lumiere.fr',
          signatures: {
            Gustave:
              '<p>&nbsp;</p><p>Greetings,</p><p>&nbsp;</p><p>Gustave</p>',
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
      receipts: {
        enabled: false,
        not_to_cc: 'never',
        other: 'never',
        outside_domain: 'never',
      },
    },
  ],
  error_code: 'S000000',
  error_msg: 'No Error',
}

export async function GET() {
  return NextResponse.json(data)
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET'] }, { status: 200 })
}
