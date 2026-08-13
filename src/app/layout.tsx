import { ThemeProvider } from '@/components/theme-provider'
import SerwistProviderGate from '@/features/offline/components/serwist-provider-gate'
import { geistMono, geistSans, openDyslexic } from '@/lib/fonts'
import { getDefaultLocale } from '@/lib/i18n/config'
import StoreProvider from '@/lib/redux/store-provider'
import type { Metadata, Viewport } from 'next'
import { getLocale } from 'next-intl/server'
import React from 'react'
import './globals.css'

// import { ModeToggle } from "@/components/theme-switcher";

// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });

export const metadata: Metadata = {
  applicationName: 'SOGo',
  title: {
    default: 'SOGo',
    template: '%s · SOGo',
  },
  description: 'SOGo Webmail',
  robots: 'noindex, nofollow',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SOGo',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/images/sogo-compact.svg' },
    ],
    shortcut: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
  manifest: '/manifest.webmanifest',
}

export const viewport: Viewport = {
  themeColor: '#1a56db',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  let locale = getDefaultLocale()
  try {
    locale = await getLocale()
  } catch {
    // Root layout may render before locale is resolved (e.g. in tests)
  }

  return (
    <html
      suppressHydrationWarning
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${openDyslexic.variable}`}
    >
      <body className="overflow-hidden antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          themes={[
            'light',
            'dark',
            'dyslexia',
            'tritanopia',
            'deuteranopia',
            'protanopia',
            'system',
          ]}
          enableSystem
        >
          <StoreProvider>
            <SerwistProviderGate>{children}</SerwistProviderGate>
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
