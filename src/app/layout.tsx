import type { Metadata, Viewport } from 'next'
import './globals.css'
import { geistSans, geistMono, openDyslexic } from '@/lib/fonts'
import { ThemeProvider } from '@/components/theme-provider'
import StoreProvider from '@/lib/redux/store-provider'
import React from 'react'
import PWAInitializer from '@/lib/pwa/components/pwa-initializer'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
}

export const metadata: Metadata = {
  title: 'SOGo',
  description: 'SOGo Webmail',
  robots: 'noindex, nofollow',
  icons: {
    icon: '/images/sogo-compact.svg',
    shortcut: '/images/sogo-compact.svg',
    apple: '/images/sogo-compact.svg',
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SOGo',
    startupImage: [
      {
        url: '/images/sogo-logo.png',
        media: '(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)',
      },
      {
        url: '/images/sogo-logo.png',
        media: '(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)',
      },
      {
        url: '/images/sogo-logo.png',
        media: '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)',
      },
    ],
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  applicationName: 'SOGo',
  category: 'productivity',
  keywords: ['email', 'calendar', 'contacts', 'groupware', 'webmail'],
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params
  
  return (
    <html
      suppressHydrationWarning
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${openDyslexic.variable}`}
    >
      <body className="overflow-hidden antialiased">
        <PWAInitializer />
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
          <StoreProvider>{children}</StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
