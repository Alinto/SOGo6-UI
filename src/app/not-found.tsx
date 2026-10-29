import '@/app/globals.css'
import { geistMono, geistSans, openDyslexic } from '@/lib/fonts'

// This page renders when a route like `/unknown.txt` is requested.
// In this case, the layout at `app/[locale]/layout.tsx` receives
// an invalid value as the `[locale]` param and calls `notFound()`.

export default function GlobalNotFound() {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${openDyslexic.variable}`}
    >
      <head>
        <title>Page not found · SOGo</title>
      </head>
      <body className="flex min-h-screen items-center justify-center antialiased">
        <a
          href="#main-content"
          className="bg-background text-foreground focus:ring-ring sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:px-3 focus:py-2 focus:ring-2"
        >
          Skip to content
        </a>
        <main id="main-content" className="text-center">
          <p className="text-6xl font-semibold tracking-tight">404</p>
          <p className="text-muted-foreground mt-2">Page not found</p>
        </main>
      </body>
    </html>
  )
}
