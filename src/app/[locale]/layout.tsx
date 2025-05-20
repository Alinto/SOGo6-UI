// import localFont from "next/font/local";
import { ThemesLoader } from '@/features/themes/themes-loader'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import React from 'react'

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages()

  return (
    <div>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <ThemesLoader />
        {children}
      </NextIntlClientProvider>
    </div>
  )
}
