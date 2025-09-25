import { NextResponse } from 'next/server'

const domainConfigs: Record<string, any> = {
  'example.org': {
    Basic: [
      {
        name: 'SOGO_D_AUTH_TYPE',
        origin: {
          type: 'default',
        },
        value: 'plain',
      },
    ],
    Advanced: [
      {
        name: 'SOGO_D_IDENTITIES_ENABLED',
        origin: {
          type: 'default',
        },
        value: false,
      },
      {
        name: 'SOGO_D_FOLDER_DISABLE_SHARING',
        value: true,
      },
    ],
    'User Source': [
      {
        name: 'US_TYPE',
        origin: {
          id: 2,
          name: 'Université',
          type: 'rule',
        },
        value: 'ldap',
      },
      {
        name: 'LDAP_GROUP_CLASS',
        origin: {
          type: 'default',
        },
        value: ['group', 'groupOfNames', 'sogo_group'],
      },
    ],
  },
  'sogo.nu': {
    Basic: [
      {
        name: 'SOGO_D_AUTH_TYPE',
        origin: {
          type: 'default',
        },
        value: 'plain',
      },
    ],
    Advanced: [
      {
        name: 'SOGO_D_IDENTITIES_ENABLED',
        origin: {
          type: 'default',
        },
        value: false,
      },
      {
        name: 'SOGO_D_FOLDER_DISABLE_SHARING',
        value: true,
      },
    ],
    'User Source': [
      {
        name: 'US_TYPE',
        origin: {
          id: 2,
          name: 'Université',
          type: 'rule',
        },
        value: 'ldap',
      },
      {
        name: 'LDAP_GROUP_CLASS',
        origin: {
          type: 'default',
        },
        value: ['group', 'groupOfNames', 'sogo_group'],
      },
    ],
  },
}

export async function GET(
  req: Request,
  { params }: { params: { custom_domain_id: string } }
) {
  const { custom_domain_id } = params
  const config = domainConfigs[custom_domain_id]
  if (config) {
    return NextResponse.json(config)
  } else {
    return NextResponse.json({ error: 'Domain not found' }, { status: 404 })
  }
}

// OPTIONS for preflight (CORS, etc.)
export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET'] }, { status: 200 })
}

export async function POST(
  req: Request,
  { params }: { params: { custom_domain_id: string } }
) {
  const body = await req.json()
  console.log(`POST config for domain ${params.custom_domain_id}:`, body) //L'api existe pas encore
  return NextResponse.json({ success: true, data: body })
}
