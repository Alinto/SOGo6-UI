import { NextResponse } from 'next/server'
import domainCustom from '../../../../domainCustom.json'

export async function GET() {
  return NextResponse.json(domainCustom)
}

// PATCH

// PATCH handler for updating a custom domain config
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ custom_domain_id: string }> }
) {
  try {
    const { custom_domain_id: customDomainId } = await params
    const body = await request.json()
    console.log(`PATCH /admin/v1/config/domains/${customDomainId} body:`, body)
    console.log(
      `PATCH /admin/v1/config/domains/${customDomainId} body:`,
      JSON.stringify(body, null, 2)
    )
    // This is a fake API: we don't persist to disk.
    // Return the updated representation indicating success.
    // const updated = {
    //   // echo provided id and config back to caller so client can validate
    //   data: {
    //     domain: customDomainId,
    //     settings: body,
    //   },
    //   error_code: 0,
    //   error_msg: '',
    // }

    return new Response(
      JSON.stringify({
        ok: true,
        message: 'Patch applied (fakeApi)',
        //storedConfig: { [customDomainId]: storedConfig[customDomainId] },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (e: unknown) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

// DELETE
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ custom_domain_id: string }> }
) {
  const { custom_domain_id: customDomainId } = await params
  console.log(`DELETE config for domain ${customDomainId}`)
  return NextResponse.json(
    { success: true, message: `Domain ${customDomainId} deleted (fakeApi)` },
    { status: 200 }
  )
}
