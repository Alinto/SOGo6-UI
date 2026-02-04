import type { Metadata } from 'next'
import './globals.css'
import { geistSans, geistMono, openDyslexic } from '@/lib/fonts'
import { ThemeProvider } from '@/components/theme-provider'
import StoreProvider from '@/lib/redux/store-provider'
import React from 'react'

// import { ModeToggle } from "@/components/theme-switcher";

// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });

export const metadata: Metadata = {
  title: 'SOGo',
  description: 'SOGo Webmail',
  robots: 'noindex, nofollow',
  icons: {
    icon: '/images/sogo-compact.svg',
    shortcut: '/images/sogo-compact.svg',
    apple: '/images/sogo-compact.svg',
  },
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
