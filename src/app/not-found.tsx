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
      <body className="flex min-h-screen items-center justify-center antialiased">
        <main className="text-center">
          <p className="text-6xl font-semibold tracking-tight">404</p>
          <p className="text-muted-foreground mt-2">Page not found</p>
        </main>
      </body>
    </html>
  )
}
