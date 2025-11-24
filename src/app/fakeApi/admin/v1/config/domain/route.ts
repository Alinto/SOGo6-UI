import domainSettings from '../../../domainSettings.json'

export async function GET() {
  return new Response(JSON.stringify(domainSettings), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export async function OPTIONS() {
  return new Response(JSON.stringify({ allow: ['GET'] }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
