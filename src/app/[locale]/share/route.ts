import { NextResponse } from 'next/server'

interface ShareRouteContext {
  params: Promise<{ locale: string }>
}

function redirectToCompose(request: Request, locale: string) {
  const dest = new URL(`/${locale}/u/0/INBOX?compose=1&share=1`, request.url)
  return NextResponse.redirect(dest, 303)
}

export async function GET(request: Request, context: ShareRouteContext) {
  const { locale } = await context.params
  return redirectToCompose(request, locale)
}

/** Fallback when the service worker does not intercept the OS share POST. */
export async function POST(request: Request, context: ShareRouteContext) {
  const { locale } = await context.params
  const dest = new URL(`/${locale}/u/0/INBOX?compose=1&share=1`, request.url)
  try {
    const form = await request.formData()
    const title = String(form.get('title') ?? form.get('subject') ?? '')
    const text = String(form.get('text') ?? form.get('body') ?? '')
    const sharedUrl = String(form.get('url') ?? '')
    if (title) dest.searchParams.set('subject', title)
    const body = [text, sharedUrl].filter(Boolean).join('\n')
    if (body) dest.searchParams.set('body', body)
  } catch {
    // Redirect anyway so the compose window still opens.
  }
  return NextResponse.redirect(dest, 303)
}
