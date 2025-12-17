import domainDefault from '../../../domainDefault.json'

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    console.log('PATCH /admin/v1/config/domain-default body:', body)
    console.log(
      'PATCH /admin/v1/config/domain-default body:',
      JSON.stringify(body, null, 2)
    )

    // Expecting { customDomainId, config } — store/merge as simple behavior
    // const { customDomainId, config } = body ?? {}

    // if (!customDomainId) {
    //   return new Response(JSON.stringify({ error: 'Missing customDomainId' }), {
    //     status: 400,
    //     headers: { 'Content-Type': 'application/json' },
    //   })
    // }

    // if (!storedConfig[customDomainId]) storedConfig[customDomainId] = {}

    // Object.keys(config || {}).forEach((sectionKey) => {
    //   const sectionVal = config[sectionKey]
    //   // if sectionVal is an object => merge
    //   if (
    //     sectionVal &&
    //     typeof sectionVal === 'object' &&
    //     !Array.isArray(sectionVal)
    //   ) {
    //     storedConfig[customDomainId][sectionKey] = {
    //       ...(storedConfig[customDomainId][sectionKey] || {}),
    //       ...sectionVal,
    //     }
    //   } else {
    //     // otherwise replace
    //     storedConfig[customDomainId][sectionKey] = sectionVal
    //   }
    // })

    return new Response(
      JSON.stringify({
        ok: true,
        message: 'Patch applied (fakeApi)',
        //storedConfig: { [customDomainId]: storedConfig[customDomainId] },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export async function GET() {
  return new Response(JSON.stringify(domainDefault), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
