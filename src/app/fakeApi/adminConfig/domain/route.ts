import { NextResponse } from 'next/server'

  // voir avec quentin pour rajouter des infos ici sur chaque domain (user source ?)
const domains: string[] = [
  'example.org',
  'sogo.nu',
  'business.com',
  'example.com',
  'test.com',
  'mycompany.net',
  'demo.fr',
  'startup.io',
  'mailbox.co',
  'cloudservice.app',
  'superapp.dev',
  'webagency.biz',
  'servicepro.info',
  'projectx.site',
  'sampledomain.eu',
]

export async function GET() {
  return NextResponse.json(domains)
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
