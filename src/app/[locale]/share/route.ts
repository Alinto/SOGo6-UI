import { buildShareFallbackHtml } from '@/features/offline/share/share-fallback-html'
import { isForeignFetchSite } from '@/features/offline/share/share-target-policy'
import { getDefaultLocale, getLocales } from '@/lib/i18n/config'
import { NextResponse } from 'next/server'

interface ShareRouteContext {
  params: Promise<{ locale: string }>
}

/** Only known locales: the segment ends up in a redirect URL. */
function safeLocale(locale: string): string {
  return getLocales().includes(locale) ? locale : getDefaultLocale()
}

function inboxUrl(request: Request, locale: string): string {
  return new URL(`/${safeLocale(locale)}/u/0/INBOX`, request.url).href
}

function composeUrl(request: Request, locale: string): string {
  return `${inboxUrl(request, locale)}?compose=1&share=1`
}

export async function GET(request: Request, context: ShareRouteContext) {
  const { locale } = await context.params
  return NextResponse.redirect(composeUrl(request, locale), 303)
}

/** Fallback when the service worker does not intercept the OS share POST. */
export async function POST(request: Request, context: ShareRouteContext) {
  const { locale } = await context.params
  // OS share sheets navigate with `Sec-Fetch-Site: none`; a form posted by
  // another site must not prefill a compose window.
  if (isForeignFetchSite(request.headers.get('sec-fetch-site'))) {
    return NextResponse.redirect(inboxUrl(request, locale), 303)
  }
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
