import { buildShareFallbackHtml } from '@/features/offline/share/share-fallback-html'
import { NextResponse } from 'next/server'

interface ShareRouteContext {
  params: Promise<{ locale: string }>
}

function composeUrl(request: Request, locale: string): string {
  return new URL(`/${locale}/u/0/INBOX?compose=1&share=1`, request.url).href
}

export async function GET(request: Request, context: ShareRouteContext) {
  const { locale } = await context.params
  return NextResponse.redirect(composeUrl(request, locale), 303)
}

/** Fallback when the service worker does not intercept the OS share POST. */
export async function POST(request: Request, context: ShareRouteContext) {
  const { locale } = await context.params
  const dest = composeUrl(request, locale)
  let subject = ''
  let body = ''
  let url = ''
  try {
    const form = await request.formData()
    subject = String(form.get('title') ?? form.get('subject') ?? '')
    body = String(form.get('text') ?? form.get('body') ?? '')
    url = String(form.get('url') ?? '')
  } catch {
    // Still hand the user an empty compose window.
  }
  return new NextResponse(
    buildShareFallbackHtml(dest, { subject, body, url }),
    {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    }
  )
}
