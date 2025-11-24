import { NextResponse } from 'next/server'

// import domainSettings from '../'

// //const domainConfigs: Record<string, any> =

// export async function GET() {
//   return NextResponse.json(domainSettings)
// }

// export async function GET(
//   req: Request,
//   { params }: { params: { custom_domain_id: string } }
// ) {
//   const { custom_domain_id } = params
//   const config = domainConfigs[custom_domain_id]
//   if (config) {
//     return NextResponse.json(config)
//   } else {
//     return NextResponse.json({ error: 'Domain not found' }, { status: 404 })
//   }
// }

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
